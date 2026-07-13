const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Add Pyodide
if (!html.includes('pyodide.js')) {
    html = html.replace('<!-- Custom CSS -->', '<!-- Pyodide -->\n    <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>\n    <!-- Custom CSS -->');
}

// Add navigation buttons
if (!html.includes("app.navigate('python')")) {
    html = html.replace(
        '<button onclick="app.navigate(\\'markdown\\')"',
        `<button onclick="app.navigate('python')" class="nav-btn w-full flex items-center px-4 py-3 text-left rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                        <i class="fa-brands fa-python w-6"></i> <span data-i18n="nav_python">Python IDE</span>
                    </button>
                    <button onclick="app.navigate('guides')" class="nav-btn w-full flex items-center px-4 py-3 text-left rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                        <i class="fa-solid fa-book w-6"></i> <span data-i18n="nav_guides">Centro de Guías</span>
                    </button>
                    <button onclick="app.navigate('markdown')"`
    );
}

// Add Views
const newViews = `
            <!-- PYTHON IDE VIEW -->
            <div id="view-python" class="view-section hidden fade-in h-full flex flex-col">
                <div class="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 class="text-3xl font-bold"><i class="fa-brands fa-python text-brand-500 mr-2"></i> <span data-i18n="nav_python">Python IDE</span></h2>
                    <div class="flex items-center gap-2">
                        <span id="py-status" class="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-400">Esperando...</span>
                        <div class="relative flex items-center ml-2 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-[#1a2233]">
                            <input type="text" id="py-package-input" placeholder="Librería (ej: numpy)" class="px-3 py-2 text-sm bg-transparent outline-none w-40 text-slate-800 dark:text-slate-200" data-i18n-placeholder="py_pkg_ph">
                            <button id="py-install-btn" disabled class="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border-l border-slate-200 dark:border-slate-700" title="Instalar Librería"><i class="fa-solid fa-download"></i></button>
                        </div>
                        <button id="py-run-btn" disabled class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center shadow-md shadow-green-500/20 ml-2"><i class="fa-solid fa-play mr-2"></i> <span data-i18n="py_run">Ejecutar</span></button>
                    </div>
                </div>
                
                <div class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                    <!-- Editor Panel -->
                    <div class="flex-1 flex flex-col min-h-0 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                        <div class="absolute top-0 right-0 bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur px-3 py-1 text-xs font-bold rounded-bl-lg z-10 uppercase tracking-wider text-slate-600 dark:text-slate-400">EDITOR (PYTHON)</div>
                        <textarea id="py-textarea" class="w-full h-full p-5 pt-8 font-mono text-sm bg-slate-900 text-slate-100 resize-none outline-none focus:ring-2 focus:ring-brand-500" spellcheck="false"># Escribe tu código Python aquí
print("Hola Mundo desde el navegador!")
</textarea>
                    </div>
                    <!-- Terminal Panel -->
                    <div class="flex-1 flex flex-col min-h-0 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-black p-5 pt-8 overflow-y-auto">
                        <div class="absolute top-0 right-0 bg-slate-800/80 backdrop-blur px-3 py-1 text-xs font-bold rounded-bl-lg z-10 uppercase tracking-wider text-green-400">TERMINAL</div>
                        <pre id="py-output" class="font-mono text-sm text-green-400 whitespace-pre-wrap"></pre>
                    </div>
                </div>
            </div>

            <!-- GUIDES VIEW -->
            <div id="view-guides" class="view-section hidden fade-in h-full flex flex-col relative">
                <div class="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 class="text-3xl font-bold"><i class="fa-solid fa-book text-brand-500 mr-2"></i> <span data-i18n="nav_guides">Centro de Guías</span></h2>
                </div>
                
                <div class="flex flex-1 gap-4 overflow-hidden min-h-0">
                    <!-- Sidebar -->
                    <div class="w-56 flex-shrink-0 bg-white dark:bg-[#151b26] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                        <div class="p-3 border-b border-slate-100 dark:border-slate-800">
                            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider" data-i18n="guides_title">Temas</span>
                        </div>
                        <div class="flex-1 overflow-y-auto p-2 space-y-1">
                            <button data-guide="python" class="guide-item w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                                <i class="fa-brands fa-python mr-2"></i> <span data-i18n="guide_python">Guía Python</span>
                            </button>
                            <button data-guide="html" class="guide-item w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <i class="fa-brands fa-html5 mr-2"></i> <span data-i18n="guide_html">Guía HTML</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0f141e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 overflow-y-auto">
                        <div id="guide-preview" class="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200"></div>
                    </div>
                </div>
            </div>
`;

if (!html.includes('id="view-python"')) {
    html = html.replace('<!-- MINDMAP VIEW -->', newViews + '\n            <!-- MINDMAP VIEW -->');
}

fs.writeFileSync('index.html', html);
console.log("HTML Patched for Python IDE and Guides");
