export const PythonIde = {
    pyodide: null,
    
    async init() {
        const runBtn = document.getElementById('py-run-btn');
        const installBtn = document.getElementById('py-install-btn');
        const output = document.getElementById('py-output');
        const status = document.getElementById('py-status');
        const textarea = document.getElementById('py-textarea');
        const packageInput = document.getElementById('py-package-input');
        
        if (!runBtn) return;
        
        // Print function override to redirect output to our console
        const printOutput = (text) => {
            if (output.textContent === 'Cargando entorno Python... espere por favor.\n' || 
                output.textContent === 'Python environment loaded.\n' ||
                output.textContent === 'Entorno de Python cargado y listo.\n') {
                output.textContent = '';
            }
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
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
            });
            
            // Setup micropip for package installation
            await this.pyodide.loadPackage("micropip");
            
            // Redirect stdout
            this.pyodide.setStdout({ batched: printOutput });
            
            status.textContent = 'Python Listo';
            status.className = 'text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg dark:bg-green-900/40 dark:text-green-400';
            output.textContent = 'Entorno de Python cargado y listo.\\n';
            
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
            output.textContent = '>>> Ejecutando...\\n';
            try {
                // To support top-level await in scripts
                await this.pyodide.loadPackagesFromImports(code);
                let result = await this.pyodide.runPythonAsync(code);
                if (result !== undefined) {
                    printOutput(result);
                }
            } catch (err) {
                printOutput(err);
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
    }
};
