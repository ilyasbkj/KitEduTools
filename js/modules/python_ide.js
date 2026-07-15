export const PythonIDE = {
    editor: null,
    term: null,
    pyodideReady: false,
    pyodide: null,

    init() {
        if (!document.getElementById('python-editor')) return;
        
        this.initEditor();
        this.initTerminal();
        this.bindEvents();
        this.loadPyodide();
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

print(saludar("Mundo"))

# Ejemplo de bucle
for i in range(1, 6):
    print(f"Contador: {i}")
`;
        this.editor.setValue(initialCode, -1);
        
        // Theme update listener
        document.addEventListener('themeChanged', () => {
            const isDark = document.documentElement.classList.contains('dark');
            this.editor.setTheme(isDark ? "ace/theme/tomorrow_night_eighties" : "ace/theme/textmate");
        });
        
        // initial theme
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
            fontSize: 14
        });
        const fitAddon = new FitAddon.FitAddon();
        this.term.loadAddon(fitAddon);
        this.term.open(document.getElementById('python-terminal'));
        fitAddon.fit();

        window.addEventListener('resize', () => {
            if (document.getElementById('view-python').classList.contains('hidden')) return;
            fitAddon.fit();
        });
        
        // Hack for fitting when becoming visible
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.id === 'view-python' && !mutation.target.classList.contains('hidden')) {
                    setTimeout(() => fitAddon.fit(), 50);
                }
            });
        });
        observer.observe(document.getElementById('view-python'), { attributes: true, attributeFilter: ['class'] });

        this.term.writeln('\x1b[33mPreparando entorno Python...\x1b[0m');
    },

    async loadPyodide() {
        try {
            this.pyodide = await loadPyodide({
                stdout: (text) => this.term.writeln(text),
                stderr: (text) => this.term.writeln(`\x1b[31m${text}\x1b[0m`),
                stdin: () => prompt()
            });
            this.term.writeln('\x1b[32mEntorno Python listo. Pyodide ' + this.pyodide.version + '\x1b[0m');
            this.pyodideReady = true;
            this.updateRunButtonState(false);
            
            // Set basic configuration
            this.pyodide.runPython(`
import sys
import io
`);
        } catch (err) {
            this.term.writeln(`\x1b[31mError al cargar Python: ${err}\x1b[0m`);
            console.error(err);
        }
    },

    bindEvents() {
        document.getElementById('btn-py-run').addEventListener('click', () => this.runCode());
        document.getElementById('btn-py-clear').addEventListener('click', () => this.term.clear());
        document.getElementById('btn-py-install').addEventListener('click', () => this.installPackage());
    },

    updateRunButtonState(running) {
        const btn = document.getElementById('btn-py-run');
        const icon = document.getElementById('py-run-icon');
        const text = document.getElementById('py-run-text');
        
        if (!this.pyodideReady) return;

        if (running) {
            btn.disabled = true;
            icon.className = 'fa-solid fa-spinner fa-spin';
            text.textContent = 'Ejecutando...';
        } else {
            btn.disabled = false;
            icon.className = 'fa-solid fa-play';
            text.textContent = window.I18n ? window.I18n.get('py_run') || 'Ejecutar' : 'Ejecutar';
        }
    },

    async runCode() {
        if (!this.pyodideReady) return;
        
        const code = this.editor.getValue();
        this.updateRunButtonState(true);
        this.term.writeln('\x1b[36m>>> Ejecutando código...\x1b[0m');
        
        try {
            await this.pyodide.loadPackagesFromImports(code);
            await this.pyodide.runPythonAsync(code);
        } catch (err) {
            this.term.writeln(`\x1b[31m${err}\x1b[0m`);
        } finally {
            this.updateRunButtonState(false);
            this.term.writeln('\x1b[36m--- Ejecución terminada ---\x1b[0m');
            this.term.scrollToBottom();
        }
    },
    
    async installPackage() {
        if (!this.pyodideReady) return;
        
        const input = document.getElementById('py-pkg-input');
        const pkg = input.value.trim();
        if (!pkg) return;
        
        this.updateRunButtonState(true);
        this.term.writeln(`\x1b[33mInstalando ${pkg}...\x1b[0m`);
        
        try {
            await this.pyodide.loadPackage("micropip");
            const micropip = this.pyodide.pyimport("micropip");
            await micropip.install(pkg);
            this.term.writeln(`\x1b[32mPaquete ${pkg} instalado correctamente.\x1b[0m`);
            input.value = '';
        } catch (err) {
            this.term.writeln(`\x1b[31mError al instalar ${pkg}: ${err}\x1b[0m`);
        } finally {
            this.updateRunButtonState(false);
        }
    }
};
