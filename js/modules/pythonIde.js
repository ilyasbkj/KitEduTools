export const PythonIde = {
    term: null,
    fitAddon: null,
    worker: null,
    inputBuffer: null,
    isWaitingForInput: false,
    inputString: '',
    
    async init() {
        const runBtn = document.getElementById('py-run-btn');
        const installBtn = document.getElementById('py-install-btn');
        const status = document.getElementById('py-status');
        const textarea = document.getElementById('py-textarea');
        const packageInput = document.getElementById('py-package-input');
        const importBtn = document.getElementById('py-import-btn');
        const fileInput = document.getElementById('py-file-input');
        const exportBtn = document.getElementById('py-export-btn');
        const clearBtn = document.getElementById('py-clear-btn');
        
        if (!runBtn) return;

        // Init Xterm.js
        this.term = new window.Terminal({
            theme: { background: '#0d1117', foreground: '#4ade80', cursor: '#4ade80' },
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 14,
            cursorBlink: true,
            convertEol: true
        });
        
        this.fitAddon = new window.FitAddon.FitAddon();
        this.term.loadAddon(this.fitAddon);
        
        const termContainer = document.getElementById('py-xterm-container');
        if (termContainer) {
            this.term.open(termContainer);
            this.fitAddon.fit();
            
            // Resize observer para que Xterm.js se ajuste al div dinámicamente
            const resizeObserver = new ResizeObserver(() => {
                try {
                    this.fitAddon.fit();
                } catch(e) {}
            });
            resizeObserver.observe(termContainer);
        }

        this.term.writeln('Iniciando entorno Python (Xterm + Worker)...');
        
        // Handle terminal input
        this.term.onData((data) => {
            if (this.isWaitingForInput) {
                if (data === '\r') {
                    // Enter pressed
                    this.term.write('\r\n');
                    this.submitInput();
                } else if (data === '\x7F') {
                    // Backspace
                    if (this.inputString.length > 0) {
                        this.inputString = this.inputString.slice(0, -1);
                        this.term.write('\b \b');
                    }
                } else {
                    this.inputString += data;
                    this.term.write(data);
                }
            }
        });

        // Initialize SharedArrayBuffer for blocking input (1024 bytes)
        try {
            const sab = new SharedArrayBuffer(1024);
            this.inputBuffer = new Int32Array(sab);
        } catch (e) {
            this.term.writeln('\x1b[31m[ERROR crítico]\x1b[0m SharedArrayBuffer no está disponible.');
            this.term.writeln('Para usar la terminal interactiva, debes arrancar el servidor local:');
            this.term.writeln('\x1b[33mnode server.js\x1b[0m');
            this.term.writeln('Y acceder desde http://localhost:3000');
            status.textContent = 'Error COOP/COEP';
            return;
        }

        // Initialize Web Worker
        this.worker = new Worker('js/modules/pyodideWorker.js');
        
        this.worker.onmessage = (e) => {
            const { type, text, error, pkg } = e.data;
            
            if (type === 'init_complete') {
                status.textContent = 'Python Listo';
                status.className = 'text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg dark:bg-green-900/40 dark:text-green-400';
                runBtn.disabled = false;
                installBtn.disabled = false;
                this.term.writeln('Entorno de Python listo.');
            } 
            else if (type === 'init_error') {
                this.term.writeln('\x1b[31mError al iniciar Python:\x1b[0m ' + error);
            }
            else if (type === 'stdout') {
                this.term.write(text.replace(/\n/g, '\r\n'));
            }
            else if (type === 'stderr') {
                this.term.write('\x1b[31m' + text.replace(/\n/g, '\r\n') + '\x1b[0m');
            }
            else if (type === 'input_request') {
                this.isWaitingForInput = true;
                this.inputString = '';
            }
            else if (type === 'run_complete') {
                // Done
            }
            else if (type === 'run_error') {
                const cleanErr = error.split('File "<exec>"').pop() || error;
                this.term.writeln('\x1b[31m' + cleanErr.replace(/\n/g, '\r\n') + '\x1b[0m');
            }
            else if (type === 'install_complete') {
                this.term.writeln(`\r\nLibrería '${pkg}' instalada correctamente.`);
                installBtn.disabled = false;
                installBtn.innerHTML = '<i class="fa-solid fa-download"></i>';
                packageInput.value = '';
            }
            else if (type === 'install_error') {
                this.term.writeln(`\r\n\x1b[31mError instalando '${pkg}': ${error}\x1b[0m`);
                installBtn.disabled = false;
                installBtn.innerHTML = '<i class="fa-solid fa-download"></i>';
            }
        };

        this.worker.postMessage({
            type: 'init',
            data: { inputBuffer: this.inputBuffer }
        });

        // UI Buttons
        runBtn.addEventListener('click', () => {
            this.term.clear();
            this.worker.postMessage({ type: 'run', data: { code: textarea.value } });
        });

        installBtn.addEventListener('click', () => {
            const pkg = packageInput.value.trim();
            if (!pkg) return;
            this.term.writeln(`Instalando ${pkg}...`);
            installBtn.disabled = true;
            installBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            this.worker.postMessage({ type: 'install', data: { pkg } });
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.term.clear());
        }

        if (importBtn && fileInput) {
            importBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => textarea.value = ev.target.result;
                reader.readAsText(file);
                e.target.value = '';
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const blob = new Blob([textarea.value], { type: 'text/x-python' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'script.py';
                a.click();
                URL.revokeObjectURL(url);
            });
        }
    },
    
    submitInput() {
        this.isWaitingForInput = false;
        
        // Write string to SharedArrayBuffer
        const str = this.inputString;
        this.inputBuffer[0] = str.length; // Store length at index 0
        for (let i = 0; i < str.length; i++) {
            this.inputBuffer[i + 1] = str.charCodeAt(i);
        }
        
        // Wake up the worker
        Atomics.notify(this.inputBuffer, 0, 1);
    }
};
