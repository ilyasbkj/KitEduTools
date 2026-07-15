export const PythonIDE = {
    editor: null,
    term: null,
    worker: null,
    pyodideReady: false,
    sharedBuffer: null,
    int32Array: null,
    uint8Array: null,
    interruptBuffer: null,
    interruptArray: null,
    
    isWaitingForInput: false,
    inputBuffer: '',
    isRunning: false,

    init() {
        if (!document.getElementById('python-editor')) return;
        
        this.initEditor();
        this.initTerminal();
        this.bindEvents();
        this.initWorker();
    },

    initEditor() {
        this.editor = ace.edit("python-editor");
        this.editor.setTheme("ace/theme/textmate");
        this.editor.session.setMode("ace/mode/python");
        this.editor.setOptions({
            fontSize: "14px",
            showPrintMargin: false,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        });

        const initialCode = `# ¡Bienvenido a KitEduTools Python IDE!
# Puedes ejecutar código interactivo directamente en el navegador.

def saludar(nombre):
    return f"¡Hola, {nombre}!"

m = input("Escribe tu nombre: ")
print(saludar(m))

# Ejemplo de bucle
for i in range(1, 4):
    print(f"Contador: {i}")
`;
        this.editor.setValue(initialCode, -1);
        
        document.addEventListener('themeChanged', () => {
            const isDark = document.documentElement.classList.contains('dark');
            this.editor.setTheme(isDark ? "ace/theme/tomorrow_night_eighties" : "ace/theme/textmate");
        });
        
        if (document.documentElement.classList.contains('dark')) {
            this.editor.setTheme("ace/theme/tomorrow_night_eighties");
        }
    },

    initTerminal() {
        this.term = new Terminal({
            cursorBlink: true,
            theme: {
                background: '#1e1e1e',
                foreground: '#d4d4d4'
            },
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: 14,
            convertEol: true // Automatically converts \n to \r\n for normal rendering
        });
        const fitAddon = new FitAddon.FitAddon();
        this.term.loadAddon(fitAddon);
        this.term.open(document.getElementById('python-terminal'));
        fitAddon.fit();

        window.addEventListener('resize', () => {
            if (document.getElementById('view-python').classList.contains('hidden')) return;
            fitAddon.fit();
        });
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.id === 'view-python' && !mutation.target.classList.contains('hidden')) {
                    setTimeout(() => fitAddon.fit(), 50);
                }
            });
        });
        observer.observe(document.getElementById('view-python'), { attributes: true, attributeFilter: ['class'] });

        // Terminal PTY keystroke handling
        this.term.onData(e => {
            if (!this.isWaitingForInput) return;
            
            switch (e) {
                case '\r': // Enter
                    this.term.write('\n'); // Echo the newline
                    this.isWaitingForInput = false;
                    
                    const encoder = new TextEncoder();
                    const bytes = encoder.encode(this.inputBuffer + '\n');
                    
                    this.uint8Array.set(bytes, 8);
                    this.int32Array[1] = bytes.length;
                    
                    this.inputBuffer = '';
                    
                    this.int32Array[0] = 1;
                    Atomics.notify(this.int32Array, 0, 1);
                    break;
                case '\x7f': // Backspace
                    if (this.inputBuffer.length > 0) {
                        this.inputBuffer = this.inputBuffer.slice(0, -1);
                        this.term.write('\b \b');
                    }
                    break;
                default:
                    // Printable characters
                    if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E)) {
                        this.inputBuffer += e;
                        this.term.write(e);
                    }
            }
        });

        this.term.writeln('\x1b[33mIniciando Worker de Python...\x1b[0m');
    },

    initWorker() {
        if (!window.SharedArrayBuffer) {
            this.term.writeln('\x1b[31mError: SharedArrayBuffer no soportado.\x1b[0m');
            this.term.writeln('\x1b[31mEl servidor debe usar Cross-Origin-Opener-Policy: same-origin y Cross-Origin-Embedder-Policy: credentialless\x1b[0m');
            return;
        }

        this.sharedBuffer = new SharedArrayBuffer(1024);
        this.int32Array = new Int32Array(this.sharedBuffer);
        this.uint8Array = new Uint8Array(this.sharedBuffer);
        
        this.interruptBuffer = new SharedArrayBuffer(4);
        this.interruptArray = new Int32Array(this.interruptBuffer);

        this.worker = new Worker('js/modules/python_worker.js');
        this.worker.onmessage = (e) => this.handleWorkerMessage(e);
        this.worker.onerror = (e) => {
            this.term.writeln(`\x1b[31mError en Worker: ${e.message}\x1b[0m`);
            console.error(e);
        };

        this.worker.postMessage({
            type: 'init',
            sharedBuffer: this.sharedBuffer,
            interruptBuffer: this.interruptBuffer
        });
    },

    handleWorkerMessage(e) {
        const msg = e.data;
        switch (msg.type) {
            case 'ready':
                this.term.writeln('\x1b[32mEntorno Python listo (PTY). Pyodide ' + msg.version + '\x1b[0m');
                this.pyodideReady = true;
                this.updateRunButtonState(false);
                break;
            case 'stdout':
                this.term.write(msg.text);
                break;
            case 'stderr':
                this.term.write(`\x1b[31m${msg.text}\x1b[0m`);
                break;
            case 'request_input':
                this.isWaitingForInput = true;
                this.term.focus();
                break;
            case 'run_finished':
                this.term.writeln('\n\x1b[36m--- Ejecución terminada ---\x1b[0m');
                this.term.scrollToBottom();
                this.updateRunButtonState(false);
                break;
            case 'run_error':
                this.term.writeln(`\n\x1b[31m${msg.error}\x1b[0m`);
                this.term.writeln('\x1b[36m--- Ejecución detenida ---\x1b[0m');
                this.term.scrollToBottom();
                this.updateRunButtonState(false);
                break;
            case 'install_finished':
                this.term.writeln(`\n\x1b[32mPaquete ${msg.pkg} instalado correctamente.\x1b[0m`);
                document.getElementById('py-pkg-input').value = '';
                this.updateRunButtonState(false);
                break;
            case 'install_error':
                this.term.writeln(`\n\x1b[31mError al instalar ${msg.pkg}: ${msg.error}\x1b[0m`);
                this.updateRunButtonState(false);
                break;
            case 'error':
                this.term.writeln(`\n\x1b[31mError de inicialización: ${msg.error}\x1b[0m`);
                break;
        }
    },

    bindEvents() {
        document.getElementById('btn-py-run').addEventListener('click', () => {
            if (this.isRunning) {
                this.stopCode();
            } else {
                this.runCode();
            }
        });
        document.getElementById('btn-py-clear').addEventListener('click', () => this.term.clear());
        document.getElementById('btn-py-install').addEventListener('click', () => this.installPackage());
    },

    updateRunButtonState(running) {
        const btn = document.getElementById('btn-py-run');
        const icon = document.getElementById('py-run-icon');
        const text = document.getElementById('py-run-text');
        
        if (!this.pyodideReady) return;
        
        this.isRunning = running;

        if (running) {
            btn.classList.remove('bg-green-600', 'hover:bg-green-700');
            btn.classList.add('bg-red-600', 'hover:bg-red-700');
            icon.className = 'fa-solid fa-stop';
            text.textContent = 'Detener';
        } else {
            btn.classList.remove('bg-red-600', 'hover:bg-red-700');
            btn.classList.add('bg-green-600', 'hover:bg-green-700');
            icon.className = 'fa-solid fa-play';
            text.textContent = window.I18n ? window.I18n.get('py_run') || 'Ejecutar' : 'Ejecutar';
            
            // Interrupt wait state just in case
            if (this.isWaitingForInput) {
                this.isWaitingForInput = false;
                this.int32Array[0] = 1;
                this.int32Array[1] = 0; // EOF essentially
                Atomics.notify(this.int32Array, 0, 1);
            }
        }
    },

    runCode() {
        if (!this.pyodideReady) return;
        
        // Reset interrupt buffer
        this.interruptArray[0] = 0;
        
        this.inputBuffer = '';
        this.isWaitingForInput = false;

        const code = this.editor.getValue();
        this.updateRunButtonState(true);
        this.term.writeln('\x1b[36m>>> Ejecutando código...\x1b[0m');
        
        this.worker.postMessage({ type: 'run', code: code });
    },
    
    stopCode() {
        if (!this.isRunning) return;
        this.term.writeln('\n\x1b[33mDeteniendo ejecución (SIGINT)...\x1b[0m');
        
        // Interrupt Pyodide
        this.interruptArray[0] = 2; // SIGINT
        
        // If it's waiting for input, wake it up so it can throw KeyboardInterrupt
        if (this.isWaitingForInput) {
            this.isWaitingForInput = false;
            this.int32Array[0] = 1;
            this.int32Array[1] = 0; 
            Atomics.notify(this.int32Array, 0, 1);
        }
    },

    installPackage() {
        if (!this.pyodideReady) return;
        
        const input = document.getElementById('py-pkg-input');
        const pkg = input.value.trim();
        if (!pkg) return;
        
        this.updateRunButtonState(true);
        this.term.writeln(`\x1b[33mInstalando ${pkg}...\x1b[0m`);
        
        this.worker.postMessage({ type: 'install', pkg: pkg });
    }
};
