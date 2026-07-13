export const PythonIde = {
    pyodide: null,
    
    async init() {
        const runBtn = document.getElementById('py-run-btn');
        const installBtn = document.getElementById('py-install-btn');
        const output = document.getElementById('py-output');
        const status = document.getElementById('py-status');
        const textarea = document.getElementById('py-textarea');
        const packageInput = document.getElementById('py-package-input');
        const importBtn = document.getElementById('py-import-btn');
        const fileInput = document.getElementById('py-file-input');
        const exportBtn = document.getElementById('py-export-btn');
        const clearBtn = document.getElementById('py-clear-btn');
        const stdinTextarea = document.getElementById('py-stdin-textarea');
        let stdinLines = [];
        let stdinIndex = 0;
        
        if (!runBtn) return;
        
        // Print function override to redirect output to our console
        const printOutput = (text) => {
            output.textContent += text + '\\n';
            output.scrollTop = output.scrollHeight;
        };

        try {
            status.textContent = 'Cargando Pyodide (Puede tardar la primera vez)...';
            status.className = 'text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg dark:bg-amber-900/40 dark:text-amber-400';
            
            // Load Pyodide
            if (!window.loadPyodide) {
                throw new Error("Pyodide script not loaded in HTML");
            }
            
            this.pyodide = await window.loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
                stdin: () => {
                    if (stdinIndex < stdinLines.length) {
                        const val = stdinLines[stdinIndex++];
                        printOutput(val); // Mostrar en la terminal lo que se introdujo
                        return val;
                    }
                    return ""; // EOF
                }
            });
            
            // Setup micropip for package installation
            await this.pyodide.loadPackage("micropip");
            
            // Redirect stdout
            this.pyodide.setStdout({ batched: printOutput });
            
            status.textContent = 'Python Listo';
            status.className = 'text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg dark:bg-green-900/40 dark:text-green-400';
            
            runBtn.disabled = false;
            installBtn.disabled = false;
        } catch (err) {
            console.error(err);
            status.textContent = 'Error al cargar Python';
            status.className = 'text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded-lg dark:bg-red-900/40 dark:text-red-400';
            output.textContent += 'Error initializing Pyodide: ' + err.message + '\\n';
        }

        runBtn.addEventListener('click', async () => {
            if (!this.pyodide) return;
            const code = textarea.value;
            
            // Preparar Entrada Estándar
            if (stdinTextarea) {
                stdinLines = stdinTextarea.value.split('\\n');
                stdinIndex = 0;
            }
            
            // Limpiar terminal
            output.textContent = '';
            
            try {
                await this.pyodide.loadPackagesFromImports(code);
                let result = await this.pyodide.runPythonAsync(code);
                if (result !== undefined) {
                    printOutput(result);
                }
            } catch (err) {
                // Formatear error de Pyodide para ocultar la traza JS interna
                const errStr = err.toString();
                const cleanErr = errStr.split('File "<exec>"').pop();
                if (cleanErr) {
                    printOutput('File "<exec>"' + cleanErr);
                } else {
                    printOutput(errStr);
                }
            }
        });

        installBtn.addEventListener('click', async () => {
            if (!this.pyodide) return;
            const pkg = packageInput.value.trim();
            if (!pkg) return;
            
            output.textContent += `>>> Instalando ${pkg}...\\n`;
            installBtn.disabled = true;
            installBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            try {
                const micropip = this.pyodide.pyimport("micropip");
                await micropip.install(pkg);
                output.textContent += `Librería '${pkg}' instalada correctamente.\\n`;
                packageInput.value = '';
            } catch (err) {
                output.textContent += `Error instalando '${pkg}':\\n` + err + '\\n';
            }
            installBtn.disabled = false;
            installBtn.innerHTML = '<i class="fa-solid fa-download"></i>';
            output.scrollTop = output.scrollHeight;
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                output.textContent = '>>> Consola limpiada.\\n';
            });
        }

        if (importBtn && fileInput) {
            importBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    textarea.value = ev.target.result;
                };
                reader.readAsText(file);
                e.target.value = '';
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const code = textarea.value;
                const blob = new Blob([code], { type: 'text/x-python' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'script.py';
                a.click();
                URL.revokeObjectURL(url);
            });
        }
    }
};
