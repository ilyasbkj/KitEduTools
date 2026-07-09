import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// TODO: Configuración Firebase (Reemplazar con tus credenciales)
const firebaseConfig = {
  apiKey: "AIzaSyA-a_EdFks430bjdsnXFmsnhrTrJ9Qdhdw",
  authDomain: "kitedutools.firebaseapp.com",
  projectId: "kitedutools",
  storageBucket: "kitedutools.firebasestorage.app",
  messagingSenderId: "903715609205",
  appId: "1:903715609205:web:23f0bf7f8d74bfad2fb63c",
  measurementId: "G-BBWWE4394D"
};

let fbApp, auth, db, provider;
try {
    fbApp = initializeApp(firebaseConfig);
    auth = getAuth(fbApp);
    db = getFirestore(fbApp);
    provider = new GoogleAuthProvider();
} catch (e) {
    console.error("Firebase no configurado:", e);
}

window.fb = { auth, db, provider, signInWithPopup, onAuthStateChanged, signOut, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, setDoc, getDoc };

const app = {
    currentView: 'home',
    currentCategory: 'all',
    tools: [
        { id: 'calculator', name: 'Calculadora Avanzada', cat: 'Matemáticas', icon: 'fa-calculator', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', desc: 'Calculadora con modos Científico, Programador, Ecuaciones, Fracciones y Matrices.' },
        { id: 'converter', name: 'Conversor Universal', cat: 'Matemáticas', icon: 'fa-scale-balanced', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', desc: 'Convierte unidades físicas y sistemas matemáticos al instante.' },
        { id: 'editor', name: 'Editor HTML en Vivo', cat: 'Desarrollo', icon: 'fa-code', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', desc: 'Escribe código HTML y visualiza el resultado en tiempo real.' },
        { id: 'mindmap', name: 'Mapas Mentales', cat: 'Estudio', icon: 'fa-diagram-project', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', desc: 'Crea esquemas interactivos personalizables y guárdalos.' },
        { id: 'pomodoro', name: 'Temporizador Pomodoro', cat: 'Estudio', icon: 'fa-stopwatch', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', desc: 'Gestiona tu tiempo de estudio con intervalos personalizables.' },
        { id: 'textanalyzer', name: 'Analizador de Textos', cat: 'Estudio', icon: 'fa-chart-simple', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', desc: 'Análisis detallado de palabras, caracteres y tiempo de lectura.' },
        { id: 'spellchecker', name: 'Corrector Ortográfico', cat: 'Estudio', icon: 'fa-spell-check', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', desc: 'Corrector avanzado multilingüe para textos impecables.' },
        { id: 'agenda', name: 'Agenda Personal', cat: 'Nube', icon: 'fa-calendar-days', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', desc: 'Gestiona tus eventos diarios con almacenamiento seguro.' },
        { id: 'notebook', name: 'Libreta de Apuntes', cat: 'Nube', icon: 'fa-book-journal-whills', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', desc: 'Guarda tus apuntes por asignatura, incluye imágenes y enlaces.' }
    ],

    init() {
        this.initTheme();
        this.initFilters();
        this.renderHomeCards();
        this.initSearch();
        
        Calculator.init();
        Converter.init();
        HtmlEditor.init();
        MindMap.init();
        Pomodoro.init();
        TextAnalyzer.init();
        SpellChecker.init();
        ModalManager.init();
        AuthManager.init();
        Agenda.init();
        Notebook.init();
        this.initMobileMenu();
        
        this.navigate('home');
    },

    initTheme() {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
        if (localStorage.theme === 'light') {
            document.documentElement.classList.remove('dark');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        } else {
            document.documentElement.classList.add('dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }

        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            if (document.documentElement.classList.contains('dark')) {
                localStorage.theme = 'dark';
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                localStorage.theme = 'light';
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
        });
    },

    navigate(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
        document.getElementById(`view-${viewId}`).classList.remove('hidden');
        
        const sidebar = document.getElementById('sidebar');
        if (viewId === 'home') {
            sidebar.classList.add('hidden');
            sidebar.classList.remove('flex');
            document.getElementById('global-search').value = '';
            this.renderHomeCards();
        } else {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('flex');
        }

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-brand-600', 'dark:text-brand-400');
            btn.classList.add('text-slate-600', 'dark:text-slate-400');
        });
        
        if (viewId !== 'home') {
            const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.getAttribute('onclick')?.includes(viewId));
            if (activeBtn) {
                activeBtn.classList.remove('text-slate-600', 'dark:text-slate-400');
                activeBtn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-brand-600', 'dark:text-brand-400');
            }
        }
        
        // Handle Restricted Views
        const restrictedViews = ['agenda', 'notebook', 'mindmap'];
        const overlay = document.getElementById('login-overlay');
        if (restrictedViews.includes(viewId)) {
            if (!AuthManager.currentUser) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
                // Trigger load if necessary
                if (viewId === 'agenda') Agenda.loadEvents();
                if (viewId === 'notebook') Notebook.loadSubjects();
                if (viewId === 'mindmap') MindMap.loadFromCloud();
            }
        } else {
            overlay.classList.add('hidden');
        }
        
        this.currentView = viewId;
        
        // Close mobile menu if open
        const sidebarEl = document.getElementById('sidebar');
        const overlayEl = document.getElementById('mobile-overlay');
        if (sidebarEl && overlayEl && !sidebarEl.classList.contains('-translate-x-full')) {
            sidebarEl.classList.add('-translate-x-full');
            overlayEl.classList.add('hidden');
        }
    },

    initMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        if (!btn || !sidebar || !overlay) return;
        
        const toggleMenu = () => {
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        };
        
        btn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    },

    initFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => {
                    b.classList.remove('bg-brand-500', 'text-white', 'shadow-md', 'active');
                    b.classList.add('bg-white', 'dark:bg-[#1a2233]', 'text-slate-600', 'dark:text-slate-300');
                });
                
                e.target.classList.remove('bg-white', 'dark:bg-[#1a2233]', 'text-slate-600', 'dark:text-slate-300');
                e.target.classList.add('bg-brand-500', 'text-white', 'shadow-md', 'active');
                
                this.currentCategory = e.target.getAttribute('data-cat');
                this.renderHomeCards();
            });
        });
    },

    renderHomeCards(searchFilter = '') {
        const grid = document.getElementById('tools-grid');
        grid.innerHTML = '';
        
        const filteredTools = this.tools.filter(tool => {
            const matchSearch = tool.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                                tool.desc.toLowerCase().includes(searchFilter.toLowerCase());
            const matchCat = this.currentCategory === 'all' || tool.cat === this.currentCategory;
            return matchSearch && matchCat;
        });

        if (filteredTools.length === 0) {
            grid.innerHTML = `<p class="col-span-full text-center text-slate-500 py-10">No se encontraron herramientas.</p>`;
            return;
        }

        filteredTools.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-[#1a2233] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-800/80 transform hover:-translate-y-1 group';
            card.onclick = () => {
                this.navigate(tool.id);
            };
            
            card.innerHTML = `
                <div class="flex items-start justify-between mb-4">
                    <div class="w-14 h-14 rounded-2xl ${tool.bg} ${tool.color} flex items-center justify-center text-2xl transition-transform group-hover:scale-110">
                        <i class="fa-solid ${tool.icon}"></i>
                    </div>
                    <span class="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        ${tool.cat}
                    </span>
                </div>
                <h3 class="text-xl font-bold mb-2">${tool.name}</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">${tool.desc}</p>
            `;
            grid.appendChild(card);
        });
    },

    initSearch() {
        const searchInput = document.getElementById('global-search');
        if(!searchInput) return;
        searchInput.addEventListener('input', (e) => {
            this.renderHomeCards(e.target.value);
        });
    },

    toast(msg) {
        const t = document.getElementById('toast');
        document.getElementById('toast-msg').textContent = msg;
        t.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => {
            t.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.toast('¡Copiado al portapapeles!');
        }).catch(err => {
            console.error('Error copying text: ', err);
            this.toast('Error al copiar');
        });
    }
};

// ==========================================
// MODULE: Calculator (Multi-Mode)
// ==========================================
const Calculator = {
    currentMode: 'scientific',
    displayInput: '',
    is2ndActive: false,
    
    // Keypad Layouts
    keysSci: [
        {lbl: '2nd', cls: 'calc-btn-op'}, {lbl: 'π', sub: 'const', cls: 'calc-btn-op'}, {lbl: 'e', cls: 'calc-btn-op'}, {lbl: '[::]', cls: 'calc-btn-op'}, {lbl: 'x', cls: 'calc-btn-op'}, {lbl: '(', cls: 'calc-btn-op'}, {lbl: ',', cls: 'calc-btn-op'}, {lbl: ')', cls: 'calc-btn-op'}, {lbl: '⇄', cls: 'calc-btn-op'}, {lbl: '⌫', cls: 'calc-btn-op'},
        {lbl: 'sin', alt: 'asin', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'sinh', alt: 'asinh', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'cot', alt: 'acot', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'y√x', cls: 'calc-btn-op'}, {lbl: 'x^y', cls: 'calc-btn-op'}, {lbl: '7', cls: 'font-bold text-lg'}, {lbl: '8', cls: 'font-bold text-lg'}, {lbl: '9', cls: 'font-bold text-lg'}, {lbl: '÷', cls: 'calc-btn-op text-xl'}, {lbl: 'C', cls: 'calc-btn-op font-bold text-red-500'},
        {lbl: 'cos', alt: 'acos', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'cosh', alt: 'acosh', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'sec', alt: 'asec', sub: '-1', cls: 'calc-btn-op'}, {lbl: '³√x', cls: 'calc-btn-op'}, {lbl: 'x³', cls: 'calc-btn-op'}, {lbl: '4', cls: 'font-bold text-lg'}, {lbl: '5', cls: 'font-bold text-lg'}, {lbl: '6', cls: 'font-bold text-lg'}, {lbl: '×', cls: 'calc-btn-op text-xl'}, {lbl: '=', cls: 'calc-btn-equals text-2xl', rowSpan: 3},
        {lbl: 'tan', alt: 'atan', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'tanh', alt: 'atanh', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'csc', alt: 'acsc', sub: '-1', cls: 'calc-btn-op'}, {lbl: '√x', cls: 'calc-btn-op'}, {lbl: 'x²', cls: 'calc-btn-op'}, {lbl: '1', cls: 'font-bold text-lg'}, {lbl: '2', cls: 'font-bold text-lg'}, {lbl: '3', cls: 'font-bold text-lg'}, {lbl: '-', cls: 'calc-btn-op text-xl'}, {lbl: '', cls: 'hidden'},
        {lbl: 'ncr', cls: 'calc-btn-op'}, {lbl: 'npr', cls: 'calc-btn-op'}, {lbl: '%', cls: 'calc-btn-op font-bold text-lg'}, {lbl: 'log', cls: 'calc-btn-op font-bold text-lg'}, {lbl: '10^x', cls: 'calc-btn-op'}, {lbl: '0', cls: 'font-bold text-lg'}, {lbl: '±', cls: 'font-bold text-lg'}, {lbl: '.', cls: 'font-bold text-2xl pb-2'}, {lbl: '+', cls: 'calc-btn-op text-xl'}, {lbl: '', cls: 'hidden'} 
    ],

    keysProg: [
        {lbl: '2nd', cls: 'calc-btn-op'}, {lbl: 'π', sub: 'const', cls: 'calc-btn-op'}, {lbl: 'e', cls: 'calc-btn-op'}, {lbl: '[::]', cls: 'calc-btn-op'}, {lbl: 'x', cls: 'calc-btn-op'}, {lbl: '(', cls: 'calc-btn-op'}, {lbl: ',', cls: 'calc-btn-op'}, {lbl: ')', cls: 'calc-btn-op'}, {lbl: '⇄', cls: 'calc-btn-op'}, {lbl: '⌫', cls: 'calc-btn-op'},
        {lbl: 'sin', alt: 'asin', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'sinh', alt: 'asinh', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'cot', alt: 'acot', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'y√x', cls: 'calc-btn-op'}, {lbl: 'x^y', cls: 'calc-btn-op'}, {lbl: '7', cls: 'font-bold'}, {lbl: '8', cls: 'font-bold'}, {lbl: '9', cls: 'font-bold'}, {lbl: '÷', cls: 'calc-btn-op'}, {lbl: 'C', cls: 'calc-btn-op'},
        {lbl: 'cos', alt: 'acos', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'cosh', alt: 'acosh', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'sec', alt: 'asec', sub: '-1', cls: 'calc-btn-op'}, {lbl: '³√x', cls: 'calc-btn-op'}, {lbl: 'x³', cls: 'calc-btn-op'}, {lbl: '4', cls: 'font-bold'}, {lbl: '5', cls: 'font-bold'}, {lbl: '6', cls: 'font-bold'}, {lbl: '×', cls: 'calc-btn-op'}, {lbl: '=', cls: 'calc-btn-equals'},
        {lbl: 'tan', alt: 'atan', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'tanh', alt: 'atanh', sub: '-1', cls: 'calc-btn-op'}, {lbl: 'csc', alt: 'acsc', sub: '-1', cls: 'calc-btn-op'}, {lbl: '√x', cls: 'calc-btn-op'}, {lbl: 'x²', cls: 'calc-btn-op'}, {lbl: '1', cls: 'font-bold'}, {lbl: '2', cls: 'font-bold'}, {lbl: '3', cls: 'font-bold'}, {lbl: '-', cls: 'calc-btn-op'}, {lbl: '+', cls: 'calc-btn-op'},
        {lbl: 'ncr', cls: 'calc-btn-op'}, {lbl: 'npr', cls: 'calc-btn-op'}, {lbl: '%', cls: 'calc-btn-op'}, {lbl: 'log', cls: 'calc-btn-op'}, {lbl: '10^x', cls: 'calc-btn-op'}, {lbl: '0', cls: 'font-bold'}, {lbl: '±', cls: 'font-bold'}, {lbl: '.', cls: 'font-bold pb-2'}, {lbl: '+', cls: 'calc-btn-op opacity-50'}, {lbl: '=dec', cls: 'calc-btn-op text-[10px] font-bold'},
        {lbl: 'or', cls: 'calc-btn-op'}, {lbl: 'and', cls: 'calc-btn-op'}, {lbl: 'xor', cls: 'calc-btn-op'}, {lbl: 'ln', cls: 'calc-btn-op'}, {lbl: 'e^x', cls: 'calc-btn-op'}, {lbl: 'A', cls: 'calc-btn-op font-bold text-slate-500'}, {lbl: 'B', cls: 'calc-btn-op font-bold text-slate-500'}, {lbl: 'C', cls: 'calc-btn-op font-bold text-slate-500'}, {lbl: '0b', cls: 'calc-btn-op font-bold text-slate-500'}, {lbl: '=hex', cls: 'calc-btn-op text-[10px] font-bold'},
        {lbl: 'lsh', sub: 'rol', cls: 'calc-btn-op'}, {lbl: 'rsh', sub: 'ror', cls: 'calc-btn-op'}, {lbl: 'not', cls: 'calc-btn-op'}, {lbl: 'lg2', cls: 'calc-btn-op'}, {lbl: '2^x', cls: 'calc-btn-op'}, {lbl: 'D', cls: 'calc-btn-op font-bold text-slate-500'}, {lbl: 'E', cls: 'calc-btn-op font-bold text-slate-500'}, {lbl: 'F', cls: 'calc-btn-op font-bold text-slate-500'}, {lbl: '0x', cls: 'calc-btn-op font-bold text-slate-500'}, {lbl: '=bin', cls: 'calc-btn-op text-[10px] font-bold'}
    ],

    init() {
        const toggleBtn = document.getElementById('calc-mode-toggle');
        const dropdown = document.getElementById('calc-dropdown');
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });
        
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        document.querySelectorAll('.calc-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.getAttribute('data-mode');
                const label = e.target.textContent;
                document.getElementById('calc-current-mode-label').textContent = label;
                dropdown.classList.add('hidden');
                this.setMode(mode);
            });
        });
        
        document.getElementById('calc-display-main').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.calculate();
        });

        this.setMode('scientific');
    },

    setMode(mode) {
        this.currentMode = mode;
        const dynamicHeader = document.getElementById('calc-dynamic-header');
        const keypadArea = document.getElementById('calc-keypad-area');
        
        dynamicHeader.innerHTML = '';
        dynamicHeader.classList.add('hidden');
        
        document.getElementById('calc-display-main').value = '';
        this.displayInput = '';
        this.is2ndActive = false;

        if (mode === 'scientific') {
            this.renderKeypad(keypadArea, this.keysSci, 'calc-grid-sci');
        } else if (mode === 'programmer') {
            this.renderKeypad(keypadArea, this.keysProg, 'calc-grid-prog');
        } else if (mode === 'equations') {
            dynamicHeader.classList.remove('hidden');
            dynamicHeader.innerHTML = `
                <div class="flex justify-between items-center text-sm mb-1 px-1">
                    <span class="font-semibold text-slate-800 dark:text-slate-200 text-base">Equation Solver</span>
                    <select class="calc-inner-input text-xs py-1"><option>1 Variable, 1 Equation</option></select>
                </div>
                <div class="flex items-center gap-2 px-1 mb-2">
                    <input type="text" class="calc-inner-input flex-1 font-mono" placeholder="Example: x^2+2x-4">
                    <span class="font-bold text-slate-700 dark:text-slate-300">=</span>
                    <input type="text" class="calc-inner-input w-24 font-mono" value="0">
                </div>
            `;
            this.renderKeypad(keypadArea, this.keysSci, 'calc-grid-sci');
        } else if (mode === 'fractions') {
            dynamicHeader.classList.remove('hidden');
            dynamicHeader.innerHTML = `
                <div class="text-sm mb-2 px-1"><span class="font-semibold text-slate-800 dark:text-slate-200 text-base">Fractions Calculator</span></div>
                <div class="flex items-center justify-center gap-4 px-1 mb-2">
                    <div class="flex items-center gap-1">
                        <input type="text" class="calc-inner-input w-12 h-10 text-center font-bold">
                        <div class="flex flex-col gap-1">
                            <input type="text" class="calc-inner-input w-12 h-6 text-center font-bold text-sm">
                            <div class="h-px bg-black dark:bg-white w-full"></div>
                            <input type="text" class="calc-inner-input w-12 h-6 text-center font-bold text-sm">
                        </div>
                    </div>
                    <select class="calc-inner-input font-bold py-1 px-2"><option>+</option><option>-</option><option>*</option><option>/</option></select>
                    <div class="flex items-center gap-1">
                        <input type="text" class="calc-inner-input w-12 h-10 text-center font-bold">
                        <div class="flex flex-col gap-1">
                            <input type="text" class="calc-inner-input w-12 h-6 text-center font-bold text-sm">
                            <div class="h-px bg-black dark:bg-white w-full"></div>
                            <input type="text" class="calc-inner-input w-12 h-6 text-center font-bold text-sm">
                        </div>
                    </div>
                </div>
            `;
            this.renderKeypad(keypadArea, this.keysSci, 'calc-grid-sci');
        } else if (mode === 'vectors') {
            dynamicHeader.classList.remove('hidden');
            dynamicHeader.innerHTML = `
                <div class="text-sm mb-2 px-1"><span class="font-semibold text-slate-800 dark:text-slate-200 text-base">Vector/Matrix Calculator</span></div>
                <div class="flex items-center justify-center gap-2 mb-4">
                    <select class="calc-inner-input py-1 px-2 text-xs"><option>A</option></select>
                    <select class="calc-inner-input py-1 px-2 text-xs font-bold"><option>+</option><option>-</option><option>*</option><option>#</option></select>
                    <select class="calc-inner-input py-1 px-2 text-xs"><option>B</option></select>
                </div>
                <div class="flex justify-around items-start px-4 mb-2 gap-4">
                    <!-- Component A -->
                    <div class="flex items-start gap-2">
                        <div class="text-xs flex flex-col items-end">
                            <select class="calc-inner-input py-0 px-1 mb-1 vm-type" data-target="A"><option value="Vector">Vector</option><option value="Matrix">Matrix</option></select>
                            <div class="flex gap-1"><select class="calc-inner-input py-0 px-1"><option>3</option></select> A=</div>
                        </div>
                        <div id="vm-grid-A" class="grid grid-cols-1 gap-1 border-l-2 border-r-2 border-slate-400 dark:border-slate-500 rounded-sm px-1 py-1">
                            <input type="text" class="calc-inner-input w-16 text-center h-6" value="0">
                            <input type="text" class="calc-inner-input w-16 text-center h-6" value="0">
                            <input type="text" class="calc-inner-input w-16 text-center h-6" value="0">
                        </div>
                    </div>
                    <!-- Component B -->
                    <div class="flex items-start gap-2">
                        <div class="text-xs flex flex-col items-end">
                            <select class="calc-inner-input py-0 px-1 mb-1 vm-type" data-target="B"><option value="Vector">Vector</option><option value="Matrix">Matrix</option></select>
                            <div class="flex gap-1"><select class="calc-inner-input py-0 px-1"><option>3</option></select> B=</div>
                        </div>
                        <div id="vm-grid-B" class="grid grid-cols-1 gap-1 border-l-2 border-r-2 border-slate-400 dark:border-slate-500 rounded-sm px-1 py-1">
                            <input type="text" class="calc-inner-input w-16 text-center h-6" value="0">
                            <input type="text" class="calc-inner-input w-16 text-center h-6" value="0">
                            <input type="text" class="calc-inner-input w-16 text-center h-6" value="0">
                        </div>
                    </div>
                </div>
            `;
            
            // Add listeners for Matrix/Vector toggle
            document.querySelectorAll('.vm-type').forEach(sel => {
                sel.addEventListener('change', (e) => {
                    const type = e.target.value;
                    const targetId = e.target.getAttribute('data-target');
                    const grid = document.getElementById(`vm-grid-${targetId}`);
                    grid.innerHTML = '';
                    
                    if (type === 'Matrix') {
                        grid.className = "grid grid-cols-3 gap-1 border-l-2 border-r-2 border-slate-400 dark:border-slate-500 rounded-sm px-1 py-1";
                        for (let i=0; i<9; i++) {
                            grid.innerHTML += `<input type="text" class="calc-inner-input w-12 text-center h-6" value="0">`;
                        }
                    } else {
                        grid.className = "grid grid-cols-1 gap-1 border-l-2 border-r-2 border-slate-400 dark:border-slate-500 rounded-sm px-1 py-1";
                        for (let i=0; i<3; i++) {
                            grid.innerHTML += `<input type="text" class="calc-inner-input w-16 text-center h-6" value="0">`;
                        }
                    }
                });
            });

            this.renderKeypad(keypadArea, this.keysSci, 'calc-grid-sci');
        }
    },

    renderKeypad(container, keys, gridClass) {
        container.innerHTML = `<div class="w-full gap-1 p-1 ${gridClass}"></div>`;
        const grid = container.firstChild;
        
        keys.forEach(k => {
            const btn = document.createElement('div');
            btn.className = `calc-btn ${k.cls || ''}`;
            
            if (k.rowSpan) {
                btn.style.gridRow = `span ${k.rowSpan}`;
            }

            // Determine label based on 2nd state
            let lbl = k.lbl;
            if (this.is2ndActive && k.alt) {
                lbl = k.alt;
            }

            let innerHTML = '';
            if (k.sub && k.sub === '-1') {
                innerHTML = `<span class="calc-main-lbl">${lbl.replace('sin','sin<sup class="-mt-1">-1</sup>').replace('cos','cos<sup class="-mt-1">-1</sup>').replace('tan','tan<sup class="-mt-1">-1</sup>')}</span>`;
            } else if (k.sub) {
                innerHTML = `<span class="calc-sub">${k.sub}</span><span class="calc-main-lbl">${lbl}</span>`;
            } else {
                innerHTML = `<span class="calc-main-lbl">${lbl}</span>`;
            }
            btn.innerHTML = innerHTML;
            
            // Assign data-key to quickly find it when 2nd is toggled
            if (k.alt) {
                btn.setAttribute('data-base', k.lbl);
                btn.setAttribute('data-alt', k.alt);
                btn.classList.add('calc-togglable');
            }

            btn.addEventListener('click', () => this.handleInput(k.lbl, btn));
            grid.appendChild(btn);
        });
    },

    handleInput(val, btnEl) {
        if (!val || btnEl.classList.contains('hidden') || btnEl.classList.contains('opacity-0')) return;
        
        const display = document.getElementById('calc-display-main');
        
        // Handle 2nd toggle
        if (val === '2nd') {
            this.is2ndActive = !this.is2ndActive;
            btnEl.classList.toggle('ring-2');
            btnEl.classList.toggle('ring-brand-500');
            
            document.querySelectorAll('.calc-togglable').forEach(b => {
                const base = b.getAttribute('data-base');
                const alt = b.getAttribute('data-alt');
                const newLbl = this.is2ndActive ? alt : base;
                
                const span = b.querySelector('.calc-main-lbl');
                if (span) {
                    if (newLbl.includes('sin') || newLbl.includes('cos') || newLbl.includes('tan')) {
                        span.innerHTML = newLbl.replace('sin','sin<sup class="-mt-1">-1</sup>').replace('cos','cos<sup class="-mt-1">-1</sup>').replace('tan','tan<sup class="-mt-1">-1</sup>');
                    } else {
                        span.textContent = newLbl;
                    }
                }
            });
            return;
        }

        // Get actual value if 2nd is active
        let actualVal = val;
        if (this.is2ndActive && btnEl.getAttribute('data-alt')) {
            actualVal = btnEl.getAttribute('data-alt');
        }

        if (actualVal === 'C') {
            this.displayInput = '';
        } else if (actualVal === '⌫') {
            this.displayInput = this.displayInput.slice(0, -1);
        } else if (actualVal === '=') {
            this.calculate();
            return;
        } else if (actualVal === '÷') {
            this.displayInput += '/';
        } else if (actualVal === '×') {
            this.displayInput += '*';
        } else if (actualVal === 'π') {
            this.displayInput += 'pi';
        } else if (actualVal === 'y√x') {
            this.displayInput += 'nthRoot(';
        } else if (actualVal === 'x^y') {
            this.displayInput += '^';
        } else if (actualVal === 'x²') {
            this.displayInput += '^2';
        } else if (actualVal === 'x³') {
            this.displayInput += '^3';
        } else if (actualVal === '10^x') {
            this.displayInput += '10^';
        } else if (actualVal === 'e^x') {
            this.displayInput += 'e^';
        } else if (actualVal === '2^x') {
            this.displayInput += '2^';
        } else if (actualVal === '√x') {
            this.displayInput += 'sqrt(';
        } else if (actualVal === '³√x') {
            this.displayInput += 'cbrt(';
        } else if (actualVal.includes('sin') || actualVal.includes('cos') || actualVal.includes('tan') || actualVal === 'log' || actualVal === 'ln') {
            this.displayInput += actualVal + '(';
        } else {
            this.displayInput += actualVal;
        }
        
        display.value = this.displayInput;
    },

    calculate() {
        const display = document.getElementById('calc-display-main');
        if (!this.displayInput) return;
        
        try {
            if (window.math) {
                const angleRadio = document.querySelector('input[name="calc-angle"]:checked');
                const angleMode = angleRadio ? angleRadio.value : 'deg';
                
                let scope = {
                    log: (x) => math.log10(x) // Default log in math.js is ln, calc log is base 10
                };
                
                if (angleMode === 'deg') {
                    const toDeg = (x) => {
                       if (typeof x === 'number') return math.unit(x, 'deg');
                       return math.map(x, val => math.unit(val, 'deg'));
                    };
                    const toDegValue = (x) => x * 180 / Math.PI;
                    
                    scope.sin = (x) => math.sin(toDeg(x));
                    scope.cos = (x) => math.cos(toDeg(x));
                    scope.tan = (x) => math.tan(toDeg(x));
                    scope.sec = (x) => math.sec(toDeg(x));
                    scope.csc = (x) => math.csc(toDeg(x));
                    scope.cot = (x) => math.cot(toDeg(x));
                    
                    scope.asin = (x) => { let res = math.asin(x); return typeof res === 'number' ? toDegValue(res) : math.map(res, toDegValue); };
                    scope.acos = (x) => { let res = math.acos(x); return typeof res === 'number' ? toDegValue(res) : math.map(res, toDegValue); };
                    scope.atan = (x) => { let res = math.atan(x); return typeof res === 'number' ? toDegValue(res) : math.map(res, toDegValue); };
                    scope.asec = (x) => { let res = math.asec(x); return typeof res === 'number' ? toDegValue(res) : math.map(res, toDegValue); };
                    scope.acsc = (x) => { let res = math.acsc(x); return typeof res === 'number' ? toDegValue(res) : math.map(res, toDegValue); };
                    scope.acot = (x) => { let res = math.acot(x); return typeof res === 'number' ? toDegValue(res) : math.map(res, toDegValue); };
                }
                
                let res = math.evaluate(this.displayInput, scope);
                
                if (typeof res === 'number') {
                    // Precision format to avoid FP precision issues e.g., 0.49999999999999994
                    res = math.format(res, {precision: 14});
                }
                this.displayInput = String(res);
                display.value = this.displayInput;
            } else {
                let res = eval(this.displayInput.replace('^', '**'));
                this.displayInput = String(res);
                display.value = this.displayInput;
            }
        } catch(e) {
            console.error('Calc Error:', e);
            display.value = 'Error';
            setTimeout(() => { display.value = this.displayInput; }, 1000);
        }
    }
};

// ==========================================
// MODULE: Converter
// ==========================================
const Converter = {
    categories: {
        'Longitud': { m: 1, km: 0.001, cm: 100, mm: 1000, in: 39.3701, ft: 3.28084, mi: 0.000621371 },
        'Masa': { kg: 1, g: 1000, mg: 1e6, lb: 2.20462, oz: 35.274 },
        'Tiempo': { s: 1, min: 1/60, h: 1/3600, d: 1/86400 },
        'Velocidad': { 'm/s': 1, 'km/h': 3.6, 'mph': 2.23694 },
        'Sistemas Numéricos': { 'Decimal': 10, 'Binario': 2, 'Octal': 8, 'Hexadecimal': 16 },
        'Temperatura': { 'Celsius': 'C', 'Fahrenheit': 'F', 'Kelvin': 'K' }
    },
    currentCat: 'Longitud',
    input1: null, input2: null, sel1: null, sel2: null,

    init() {
        this.input1 = document.getElementById('conv-input-1');
        this.input2 = document.getElementById('conv-input-2');
        this.sel1 = document.getElementById('conv-select-1');
        this.sel2 = document.getElementById('conv-select-2');
        const tabsContainer = document.getElementById('conv-tabs');

        Object.keys(this.categories).forEach((cat, index) => {
            const btn = document.createElement('button');
            btn.className = `px-5 py-4 font-medium text-sm border-b-2 transition-colors focus:outline-none ${index === 0 ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`;
            btn.textContent = cat;
            btn.onclick = (e) => {
                Array.from(tabsContainer.children).forEach(c => {
                    c.classList.remove('border-brand-500', 'text-brand-500');
                    c.classList.add('border-transparent', 'text-slate-500', 'dark:text-slate-400');
                });
                btn.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400');
                btn.classList.add('border-brand-500', 'text-brand-500');
                this.loadCategory(cat);
            };
            tabsContainer.appendChild(btn);
        });

        document.getElementById('conv-swap').onclick = () => {
            const tempVal = this.input1.value;
            const tempSel = this.sel1.value;
            this.input1.value = this.input2.value;
            this.sel1.value = this.sel2.value;
            this.input2.value = tempVal;
            this.sel2.value = tempSel;
            this.convert(1);
        };

        this.input1.addEventListener('input', () => this.convert(1));
        this.input2.addEventListener('input', () => this.convert(2));
        this.sel1.addEventListener('change', () => this.convert(1));
        this.sel2.addEventListener('change', () => this.convert(2));

        this.loadCategory(this.currentCat);
    },

    loadCategory(cat) {
        this.currentCat = cat;
        const units = Object.keys(this.categories[cat]);
        
        this.sel1.innerHTML = '';
        this.sel2.innerHTML = '';
        
        units.forEach(unit => {
            this.sel1.add(new Option(unit, unit));
            this.sel2.add(new Option(unit, unit));
        });
        
        if (units.length > 1) this.sel2.selectedIndex = 1;
        
        if (cat === 'Sistemas Numéricos') {
            this.input1.type = 'text';
            this.input2.type = 'text';
        } else {
            this.input1.type = 'number';
            this.input2.type = 'number';
        }
        
        this.convert(1);
    },

    convert(sourceIndex) {
        const sourceInput = sourceIndex === 1 ? this.input1 : this.input2;
        const targetInput = sourceIndex === 1 ? this.input2 : this.input1;
        const sourceSel = sourceIndex === 1 ? this.sel1 : this.sel2;
        const targetSel = sourceIndex === 1 ? this.sel2 : this.sel1;

        const val = sourceInput.value;
        const u1 = sourceSel.value;
        const u2 = targetSel.value;

        if (val === '') {
            targetInput.value = '';
            return;
        }

        let result = 0;

        if (this.currentCat === 'Temperatura') {
            let tempC = 0;
            const v = parseFloat(val);
            if (u1 === 'C') tempC = v;
            else if (u1 === 'F') tempC = (v - 32) * 5/9;
            else if (u1 === 'K') tempC = v - 273.15;

            if (u2 === 'C') result = tempC;
            else if (u2 === 'F') result = (tempC * 9/5) + 32;
            else if (u2 === 'K') result = tempC + 273.15;
        } else if (this.currentCat === 'Sistemas Numéricos') {
            const base1 = this.categories[this.currentCat][u1];
            const base2 = this.categories[this.currentCat][u2];
            try {
                const dec = parseInt(val, base1);
                if (isNaN(dec)) throw new Error('Invalid');
                result = dec.toString(base2).toUpperCase();
            } catch (e) {
                targetInput.value = 'Error';
                return;
            }
        } else {
            const map = this.categories[this.currentCat];
            const v = parseFloat(val);
            const inBase = v / map[u1];
            result = inBase * map[u2];
        }

        if (typeof result === 'number') {
            result = Math.round(result * 1e6) / 1e6;
        }
        targetInput.value = result;
    }
};

// ==========================================
// MODULE: HTML Editor
// ==========================================
const HtmlEditor = {
    init() {
        const textarea = document.getElementById('editor-textarea');
        const iframe = document.getElementById('editor-preview');
        
        const updatePreview = () => {
            const content = textarea.value;
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(`
                <html>
                <head><style>body{font-family:sans-serif;margin:0;padding:15px;}</style></head>
                <body>${content}</body>
                </html>
            `);
            doc.close();
        };

        textarea.addEventListener('input', updatePreview);
        
        document.querySelectorAll('#editor-tags button').forEach(btn => {
            btn.onclick = () => {
                const tag = btn.getAttribute('data-tag');
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + tag + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + tag.length;
                textarea.focus();
                updatePreview();
            };
        });

        document.getElementById('editor-copy').onclick = () => app.copyToClipboard(textarea.value);

        document.getElementById('editor-download').onclick = () => {
            const blob = new Blob([textarea.value], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'codigo.html';
            a.click();
            URL.revokeObjectURL(url);
        };

        setTimeout(updatePreview, 100);
    }
};

// ==========================================
// MODULE: Mind Map
// ==========================================
const MindMap = {
    nodes: [],
    connections: [],
    container: null,
    svg: null,
    nodesContainer: null,
    toolbar: null,
    dragNode: null,
    offsetX: 0,
    offsetY: 0,
    selectedNodeId: null,
    nodeCounter: 1,

    init() {
        this.container = document.getElementById('mindmap-container');
        this.svg = document.getElementById('mindmap-svg');
        this.nodesContainer = document.getElementById('mindmap-nodes');
        this.toolbar = document.getElementById('mm-toolbar');

        document.getElementById('mm-add-root').onclick = () => this.addNode(null, true);
        document.getElementById('mm-clear').onclick = () => this.clearMap();
        document.getElementById('mm-export-json').onclick = () => this.exportJSON();
        
        const importBtn = document.getElementById('mm-import');
        const importInput = document.getElementById('mm-import-input');
        importBtn.onclick = () => importInput.click();
        importInput.onchange = (e) => this.importJSON(e);

        document.getElementById('mm-tool-add').onclick = () => this.addNode(this.selectedNodeId);
        document.getElementById('mm-tool-del').onclick = () => {
            if (this.selectedNodeId) this.deleteNode(this.selectedNodeId);
        };
        
        const colorBgInput = document.getElementById('mm-color-bg');
        const colorTextInput = document.getElementById('mm-color-text');
        
        colorBgInput.addEventListener('input', (e) => this.setNodeColors(e.target.value, null));
        colorTextInput.addEventListener('input', (e) => this.setNodeColors(null, e.target.value));
        
        document.getElementById('mm-size-up').onclick = () => this.setNodeScale(0.1);
        document.getElementById('mm-size-down').onclick = () => this.setNodeScale(-0.1);

        this.container.addEventListener('mousedown', (e) => {
            if (e.target === this.container || e.target === this.svg || e.target === this.nodesContainer) {
                this.selectNode(null);
            }
        });

        this.clearMap();
    },

    addNode(parentId = null, isRoot = false) {
        const id = 'node_' + this.nodeCounter++;
        let x, y;

        if (isRoot && this.nodes.length === 0) {
            x = this.container.clientWidth / 2 - 75;
            y = this.container.clientHeight / 2 - 25;
        } else if (parentId) {
            const parentNode = this.nodes.find(n => n.id === parentId);
            x = parentNode.x + 200;
            y = parentNode.y + (Math.random() * 100 - 50);
        } else {
            x = 100;
            y = 100;
        }

        const el = document.createElement('div');
        el.className = 'mindmap-node shadow';
        el.id = id;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.transform = 'scale(1)'; 
        
        const defaultBg = document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff';
        const defaultText = document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b';
        
        el.style.backgroundColor = defaultBg;
        el.style.color = defaultText;
        
        const content = document.createElement('div');
        content.className = 'node-content font-medium';
        content.innerHTML = isRoot ? 'Idea Principal' : 'Nuevo Nodo';
        content.contentEditable = false;
        
        el.appendChild(content);
        
        el.ondblclick = (e) => {
            e.stopPropagation();
            content.contentEditable = true;
            content.focus();
            document.execCommand('selectAll', false, null);
        };
        
        content.onblur = () => {
            content.contentEditable = false;
            this.updateNodeData(id, content.innerHTML);
            if (this.selectedNodeId === id) this.updateToolbarPosition();
        };

        el.onmousedown = (e) => this.startDrag(e, id, el);

        this.nodesContainer.appendChild(el);
        this.nodes.push({ id, text: content.innerHTML, x, y, bgColor: defaultBg, textColor: defaultText, scale: 1, el });

        if (parentId) {
            this.connections.push({ from: parentId, to: id });
        }

        this.selectNode(id);
        this.renderLines();
    },
    
    setNodeColors(bgHex, textHex) {
        if (!this.selectedNodeId) return;
        const node = this.nodes.find(n => n.id === this.selectedNodeId);
        if (node) {
            if (bgHex) {
                node.bgColor = bgHex;
                node.el.style.backgroundColor = bgHex;
            }
            if (textHex) {
                node.textColor = textHex;
                node.el.style.color = textHex;
            }
        }
    },
    
    setNodeScale(delta) {
        if (!this.selectedNodeId) return;
        const node = this.nodes.find(n => n.id === this.selectedNodeId);
        if (node) {
            node.scale = Math.max(0.5, Math.min(2, node.scale + delta));
            
            if(node.el.classList.contains('selected')) {
               node.el.style.transform = `scale(${node.scale})`;
            }
            this.renderLines(); 
        }
    },

    startDrag(e, id, el) {
        if (e.target.contentEditable === 'true') return;
        
        this.selectNode(id);
        this.dragNode = id;
        this.toolbar.classList.add('hidden');
        
        const rect = el.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;

        const mouseMoveHandler = (ev) => this.drag(ev);
        const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            this.dragNode = null;
            this.updateToolbarPosition();
            this.saveToCloud();
        };
        
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    },

    drag(e) {
        if (!this.dragNode) return;
        
        const el = document.getElementById(this.dragNode);
        const containerRect = this.container.getBoundingClientRect();
        
        const node = this.nodes.find(n => n.id === this.dragNode);
        const scale = node ? node.scale : 1;
        
        let newX = e.clientX - containerRect.left - this.offsetX;
        let newY = e.clientY - containerRect.top - this.offsetY;
        
        newX = Math.max(0, Math.min(newX, containerRect.width - (el.offsetWidth * scale)));
        newY = Math.max(0, Math.min(newY, containerRect.height - (el.offsetHeight * scale)));

        el.style.left = newX + 'px';
        el.style.top = newY + 'px';

        if (node) {
            node.x = newX;
            node.y = newY;
        }

        this.renderLines();
    },

    selectNode(id) {
        this.selectedNodeId = id;
        
        document.querySelectorAll('.mindmap-node').forEach(n => {
            n.classList.remove('selected');
            const nodeData = this.nodes.find(data => data.id === n.id);
            if(nodeData) {
                n.style.transform = `scale(${nodeData.scale})`;
            }
        });
        
        if (id) {
            const el = document.getElementById(id);
            const nodeData = this.nodes.find(data => data.id === id);
            
            if(el) {
                el.classList.add('selected');
                
                if(nodeData) {
                    document.getElementById('mm-color-bg').value = this.rgbToHex(nodeData.bgColor);
                    document.getElementById('mm-color-text').value = this.rgbToHex(nodeData.textColor);
                }
                
                this.updateToolbarPosition();
            }
        } else {
            this.toolbar.classList.add('hidden');
        }
    },
    
    rgbToHex(rgbStr) {
        if (rgbStr.startsWith('#')) return rgbStr;
        const rgb = rgbStr.match(/\d+/g);
        if (!rgb) return '#ffffff';
        return '#' + rgb.slice(0,3).map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },

    updateToolbarPosition() {
        if (!this.selectedNodeId) return;
        const el = document.getElementById(this.selectedNodeId);
        if (!el) return;

        this.toolbar.classList.remove('hidden');
        const x = parseInt(el.style.left);
        const y = parseInt(el.style.top);
        
        this.toolbar.style.left = x + 'px';
        this.toolbar.style.top = (y - 100) + 'px'; 
    },

    deleteNode(id) {
        const children = this.connections.filter(c => c.from === id).map(c => c.to);
        children.forEach(childId => this.deleteNode(childId));

        this.connections = this.connections.filter(c => c.from !== id && c.to !== id);
        this.nodes = this.nodes.filter(n => n.id !== id);
        
        const el = document.getElementById(id);
        if (el) el.remove();

        if (this.selectedNodeId === id) this.selectNode(null);
        this.renderLines();
        this.saveToCloud();
    },

    updateNodeData(id, text) {
        const node = this.nodes.find(n => n.id === id);
        if (node) {
            node.text = text;
            this.renderLines();
        }
    },

    renderLines() {
        this.svg.innerHTML = '';
        this.connections.forEach(conn => {
            const el1 = document.getElementById(conn.from);
            const el2 = document.getElementById(conn.to);
            if (!el1 || !el2) return;

            const r1 = el1.getBoundingClientRect();
            const r2 = el2.getBoundingClientRect();
            const cRect = this.container.getBoundingClientRect();

            const x1 = r1.left - cRect.left + r1.width / 2;
            const y1 = r1.top - cRect.top + r1.height / 2;
            const x2 = r2.left - cRect.left + r2.width / 2;
            const y2 = r2.top - cRect.top + r2.height / 2;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${x1} ${y1} C ${x1 + (x2 - x1) / 2} ${y1}, ${x1 + (x2 - x1) / 2} ${y2}, ${x2} ${y2}`;
            path.setAttribute('d', d);
            path.setAttribute('class', 'mindmap-path');
            this.svg.appendChild(path);
        });
    },

    clearMap(keepRoot = true) {
        this.nodes = [];
        this.connections = [];
        this.nodesContainer.innerHTML = '';
        this.svg.innerHTML = '';
        this.nodeCounter = 1;
        this.selectNode(null);
        if (keepRoot) {
            this.addNode(null, true);
        }
    },

    exportJSON() {
        const data = {
            nodes: this.nodes.map(n => ({ id: n.id, text: n.text, x: n.x, y: n.y, bgColor: n.bgColor, textColor: n.textColor, scale: n.scale })),
            connections: this.connections
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mapa_mental.json';
        a.click();
        URL.revokeObjectURL(url);
    },

    importJSON(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (!data.nodes || !data.connections) throw new Error("Invalid format");
                
                this.clearMap(false);
                
                data.nodes.forEach(n => {
                    this.nodeCounter = Math.max(this.nodeCounter, parseInt(n.id.split('_')[1]) + 1);
                    
                    const el = document.createElement('div');
                    const scale = n.scale || 1;
                    
                    el.className = `mindmap-node shadow`;
                    el.id = n.id;
                    el.style.left = n.x + 'px';
                    el.style.top = n.y + 'px';
                    el.style.transform = `scale(${scale})`;
                    el.style.backgroundColor = n.bgColor || '#ffffff';
                    el.style.color = n.textColor || '#1e293b';
                    
                    const content = document.createElement('div');
                    content.className = 'node-content font-medium';
                    content.innerHTML = n.text;
                    content.contentEditable = false;
                    
                    el.appendChild(content);
                    
                    el.ondblclick = (ev) => {
                        ev.stopPropagation();
                        content.contentEditable = true;
                        content.focus();
                        document.execCommand('selectAll', false, null);
                    };
                    
                    content.onblur = () => {
                        content.contentEditable = false;
                        this.updateNodeData(n.id, content.innerHTML);
                        if (this.selectedNodeId === n.id) this.updateToolbarPosition();
                    };

                    el.onmousedown = (ev) => this.startDrag(ev, n.id, el);

                    this.nodesContainer.appendChild(el);
                    this.nodes.push({ id: n.id, text: n.text, x: n.x, y: n.y, bgColor: n.bgColor || '#ffffff', textColor: n.textColor || '#1e293b', scale: scale, el });
                });

                this.connections = data.connections;
                this.renderLines();
                app.toast('Mapa mental importado');
                this.saveToCloud();
                
            } catch (err) {
                console.error(err);
                alert("Error al importar el archivo JSON. Formato inválido.");
            }
        };
        reader.readAsText(file);
        e.target.value = ''; 
    },
    
    getMapData() {
        return {
            nodes: this.nodes.map(n => ({ id: n.id, text: n.text, x: n.x, y: n.y, bgColor: n.bgColor, textColor: n.textColor, scale: n.scale })),
            connections: this.connections
        };
    },
    
    async saveToCloud() {
        if (!AuthManager.currentUser || !window.fb || !window.fb.db) return;
        const uid = AuthManager.currentUser.uid;
        const data = this.getMapData();
        try {
            await window.fb.setDoc(window.fb.doc(window.fb.db, 'mindmaps', uid), {
                data: JSON.stringify(data),
                updatedAt: new Date()
            });
            app.toast('Mapa guardado en la nube ☁️');
        } catch (e) {
            console.error(e);
        }
    },
    
    async loadFromCloud() {
        if (!AuthManager.currentUser || !window.fb || !window.fb.db) return;
        const uid = AuthManager.currentUser.uid;
        try {
            const docSnap = await window.fb.getDoc(window.fb.doc(window.fb.db, 'mindmaps', uid));
            if (docSnap.exists()) {
                const data = JSON.parse(docSnap.data().data);
                if (data.nodes && data.nodes.length > 0) {
                    this._loadData(data);
                    app.toast('Mapa cargado de la nube ☁️');
                }
            }
        } catch (e) {
            console.error(e);
        }
    },
    
    _loadData(data) {
        this.clearMap(false);
        data.nodes.forEach(n => {
            this.nodeCounter = Math.max(this.nodeCounter, parseInt(n.id.split('_')[1]) + 1);
            const el = document.createElement('div');
            const scale = n.scale || 1;
            el.className = 'mindmap-node shadow';
            el.id = n.id;
            el.style.left = n.x + 'px';
            el.style.top = n.y + 'px';
            el.style.transform = `scale(${scale})`;
            el.style.backgroundColor = n.bgColor || '#ffffff';
            el.style.color = n.textColor || '#1e293b';
            const content = document.createElement('div');
            content.className = 'node-content font-medium';
            content.innerHTML = n.text;
            content.contentEditable = false;
            el.appendChild(content);
            el.ondblclick = (ev) => {
                ev.stopPropagation();
                content.contentEditable = true;
                content.focus();
                document.execCommand('selectAll', false, null);
            };
            content.onblur = () => {
                content.contentEditable = false;
                this.updateNodeData(n.id, content.innerHTML);
                if (this.selectedNodeId === n.id) this.updateToolbarPosition();
                this.saveToCloud();
            };
            el.onmousedown = (ev) => this.startDrag(ev, n.id, el);
            this.nodesContainer.appendChild(el);
            this.nodes.push({ id: n.id, text: n.text, x: n.x, y: n.y, bgColor: n.bgColor || '#ffffff', textColor: n.textColor || '#1e293b', scale, el });
        });
        this.connections = data.connections;
        this.renderLines();
    }
};


// ==========================================
// MODULE: Pomodoro
// ==========================================
const Pomodoro = {
    timerId: null,
    timeLeft: 25 * 60,
    isWorking: true,
    workMin: 25,
    breakMin: 5,
    totalTime: 25 * 60,

    init() {
        const startBtn = document.getElementById('pomo-start');
        const pauseBtn = document.getElementById('pomo-pause');
        const resetBtn = document.getElementById('pomo-reset');
        
        if (!startBtn) return;
        
        const workInput = document.getElementById('pomo-work-val');
        const breakInput = document.getElementById('pomo-break-val');

        startBtn.onclick = () => {
            this.startTimer();
            startBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
        };
        
        pauseBtn.onclick = () => {
            this.pauseTimer();
            pauseBtn.classList.add('hidden');
            startBtn.classList.remove('hidden');
        };

        resetBtn.onclick = () => {
            this.pauseTimer();
            this.isWorking = true;
            this.timeLeft = this.workMin * 60;
            this.totalTime = this.timeLeft;
            this.updateDisplay();
            startBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
        };

        workInput.addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            this.workMin = val;
            if (this.isWorking && !this.timerId) {
                this.timeLeft = this.workMin * 60;
                this.totalTime = this.timeLeft;
                this.updateDisplay();
            }
        });

        breakInput.addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            this.breakMin = val;
            if (!this.isWorking && !this.timerId) {
                this.timeLeft = this.breakMin * 60;
                this.totalTime = this.timeLeft;
                this.updateDisplay();
            }
        });

        this.updateDisplay();
    },

    startTimer() {
        if (!this.timerId) {
            this.timerId = setInterval(() => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.playAlarm();
                    this.isWorking = !this.isWorking;
                    this.timeLeft = (this.isWorking ? this.workMin : this.breakMin) * 60;
                    this.totalTime = this.timeLeft;
                }
                this.updateDisplay();
            }, 1000);
        }
    },

    pauseTimer() {
        clearInterval(this.timerId);
        this.timerId = null;
    },

    updateDisplay() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        document.getElementById('pomo-time').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        const statusEl = document.getElementById('pomo-status-text');
        statusEl.textContent = this.isWorking ? 'Sesión de Estudio' : 'Descanso';
        statusEl.className = this.isWorking ? 'text-brand-500 font-bold mb-8 text-xl' : 'text-green-500 font-bold mb-8 text-xl';

        const circle = document.getElementById('pomo-progress');
        const circumference = 2 * Math.PI * 120;
        const offset = circumference - (this.timeLeft / this.totalTime) * circumference;
        circle.style.strokeDashoffset = offset;
        circle.classList.remove('text-brand-500', 'text-green-500');
        circle.classList.add(this.isWorking ? 'text-brand-500' : 'text-green-500');
    },

    playAlarm() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    }
};

// ==========================================
// MODULE: Text Analyzer
// ==========================================
const TextAnalyzer = {
    init() {
        const textInput = document.getElementById('text-input');
        if (!textInput) return;
        textInput.addEventListener('input', () => this.analyzeText(textInput.value));
        document.getElementById('text-copy').onclick = () => app.copyToClipboard(textInput.value);
    },

    analyzeText(text) {
        const chars = text.length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const paras = text.trim() === '' ? 0 : text.replace(/\n$/gm, '').split(/\n+/).length;
        
        const mins = words / 200;
        const readTime = Math.ceil(mins) + 'm';

        document.getElementById('text-chars').textContent = chars;
        document.getElementById('text-words').textContent = words;
        document.getElementById('text-paras').textContent = paras;
        document.getElementById('text-time').textContent = readTime;

        const wordArr = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const freq = {};
        wordArr.forEach(w => freq[w] = (freq[w] || 0) + 1);
        
        const sortedWords = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 5);
        
        const keywordsContainer = document.getElementById('text-keywords');
        keywordsContainer.innerHTML = '';
        if (sortedWords.length === 0) {
            keywordsContainer.innerHTML = '<span class="text-sm text-slate-400 italic">Escribe más texto para analizar...</span>';
        } else {
            sortedWords.forEach(w => {
                const badge = document.createElement('span');
                badge.className = 'px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700';
                badge.textContent = `${w} (${freq[w]})`;
                keywordsContainer.appendChild(badge);
            });
        }
    }
};

// ==========================================
// MODULE: Spell Checker
// ==========================================
const SpellChecker = {
    init() {
        this.btn = document.getElementById('spell-check-btn');
        this.langSelect = document.getElementById('spell-lang');
        this.editor = document.getElementById('spell-editor');
        this.menu = document.getElementById('spell-menu');
        this.suggestionsContainer = document.getElementById('spell-suggestions');
        
        if (!this.btn) return;
        
        this.btn.addEventListener('click', () => this.checkSpelling());
        
        // Hide menu on click outside
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target) && !e.target.classList.contains('spell-error')) {
                this.menu.classList.add('hidden');
            }
        });
    },

    async checkSpelling() {
        const text = this.editor.innerText.trim();
        if (!text) {
            app.toast('Por favor, escribe algo para revisar.');
            return;
        }

        const lang = this.langSelect.value;
        this.btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Revisando...';
        this.btn.disabled = true;

        try {
            // languagetool public API
            const response = await fetch('https://api.languagetool.org/v2/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    text: text,
                    language: lang
                })
            });

            const data = await response.json();
            
            if (data.matches && data.matches.length > 0) {
                this.highlightErrors(text, data.matches);
                app.toast(`Se encontraron ${data.matches.length} sugerencias.`);
            } else {
                this.editor.innerHTML = this.escapeHtml(text).replace(/\n/g, '<br>');
                app.toast('¡Texto impecable! No se encontraron errores.');
            }
        } catch (err) {
            console.error(err);
            app.toast('Hubo un error de conexión al revisar el texto.');
        } finally {
            this.btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Revisar';
            this.btn.disabled = false;
        }
    },

    highlightErrors(originalText, matches) {
        let resultHtml = '';
        let lastIndex = 0;

        matches.sort((a, b) => a.offset - b.offset);

        const validMatches = [];
        let endCursor = 0;
        for (const match of matches) {
            if (match.offset >= endCursor) {
                validMatches.push(match);
                endCursor = match.offset + match.length;
            }
        }

        validMatches.forEach(match => {
            const before = originalText.substring(lastIndex, match.offset);
            const errorText = originalText.substring(match.offset, match.offset + match.length);
            
            resultHtml += this.escapeHtml(before);
            
            const matchData = encodeURIComponent(JSON.stringify(match.replacements.slice(0, 5).map(r => r.value)));
            resultHtml += `<span class="spell-error" onclick="SpellChecker.showMenu(event, this, '${matchData}')">${this.escapeHtml(errorText)}</span>`;
            
            lastIndex = match.offset + match.length;
        });

        resultHtml += this.escapeHtml(originalText.substring(lastIndex));
        
        resultHtml = resultHtml.replace(/\n/g, '<br>');
        this.editor.innerHTML = resultHtml;
    },
    
    escapeHtml(text) {
        return text
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    },

    showMenu(e, spanEl, matchDataEncoded) {
        e.stopPropagation();
        const suggestions = JSON.parse(decodeURIComponent(matchDataEncoded));
        
        this.suggestionsContainer.innerHTML = '';
        if (suggestions.length === 0) {
            this.suggestionsContainer.innerHTML = '<div class="px-2 py-1 text-sm text-slate-500">No hay sugerencias</div>';
        } else {
            suggestions.forEach(sug => {
                const item = document.createElement('div');
                item.className = 'spell-suggestion-item text-brand-600 dark:text-brand-400';
                item.textContent = sug;
                item.onclick = (ev) => {
                    ev.stopPropagation();
                    spanEl.outerHTML = this.escapeHtml(sug);
                    this.menu.classList.add('hidden');
                };
                this.suggestionsContainer.appendChild(item);
            });
        }
        
        // Position menu inside relative container
        const rect = spanEl.getBoundingClientRect();
        const editorRect = this.editor.getBoundingClientRect();
        
        let top = rect.bottom - editorRect.top + this.editor.scrollTop + 5;
        let left = rect.left - editorRect.left;
        
        // Simple bounds check
        if (left + 256 > editorRect.width) left = editorRect.width - 266;
        
        this.menu.style.top = top + 'px';
        this.menu.style.left = left + 'px';
        this.menu.classList.remove('hidden');
    }
};

// ==========================================
// MODULE: Modal Manager
// ==========================================
const ModalManager = {
    modal: null,
    content: null,
    title: null,
    desc: null,
    body: null,
    btnCancel: null,
    btnConfirm: null,
    btnClose: null,
    
    init() {
        this.modal = document.getElementById('custom-modal');
        this.content = document.getElementById('custom-modal-content');
        this.title = document.getElementById('custom-modal-title');
        this.desc = document.getElementById('custom-modal-desc');
        this.body = document.getElementById('custom-modal-body');
        this.btnCancel = document.getElementById('custom-modal-cancel');
        this.btnConfirm = document.getElementById('custom-modal-confirm');
        this.btnClose = document.getElementById('custom-modal-close');
        
        if (!this.modal) return;
        
        this.btnCancel.onclick = () => this.close();
        this.btnClose.onclick = () => this.close();
    },
    
    show({ title, description, inputs, confirmText, onConfirm }) {
        this.title.textContent = title;
        if (description) {
            this.desc.textContent = description;
            this.desc.classList.remove('hidden');
        } else {
            this.desc.classList.add('hidden');
        }
        
        this.body.innerHTML = '';
        const inputElements = [];
        
        inputs.forEach((inp, idx) => {
            const wrapper = document.createElement('div');
            const label = document.createElement('label');
            label.className = 'block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1';
            label.textContent = inp.label;
            
            const field = document.createElement('input');
            field.type = inp.type || 'text';
            field.placeholder = inp.placeholder || '';
            field.className = 'w-full bg-slate-50 dark:bg-[#0f141e] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow';
            field.id = `modal-inp-${idx}`;
            
            wrapper.appendChild(label);
            wrapper.appendChild(field);
            this.body.appendChild(wrapper);
            inputElements.push(field);
        });
        
        this.btnConfirm.textContent = confirmText || 'Aceptar';
        this.btnConfirm.onclick = () => {
            const values = inputElements.map(el => el.value.trim());
            if (values.some(v => v === '')) {
                app.toast('Por favor, rellena los campos.');
                return;
            }
            onConfirm(values);
            this.close();
        };
        
        this.modal.classList.remove('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            this.content.classList.remove('scale-95');
            this.content.classList.add('scale-100');
            if (inputElements.length > 0) inputElements[0].focus();
        }, 10);
    },
    
    close() {
        this.content.classList.remove('scale-100');
        this.content.classList.add('scale-95');
        setTimeout(() => {
            this.modal.classList.add('opacity-0', 'pointer-events-none');
        }, 200);
    }
};

// ==========================================
// MODULE: Auth Manager
// ==========================================
const AuthManager = {
    currentUser: null,
    
    init() {
        const btnLogin = document.getElementById('btn-login');
        const btnLoginOverlay = document.getElementById('btn-login-overlay');
        const btnLogout = document.getElementById('btn-logout');
        
        if (btnLogin) btnLogin.onclick = () => this.signIn();
        if (btnLoginOverlay) btnLoginOverlay.onclick = () => this.signIn();
        if (btnLogout) btnLogout.onclick = () => this.signOut();
        
        if (window.fb && window.fb.auth) {
            window.fb.onAuthStateChanged(window.fb.auth, (user) => {
                this.currentUser = user;
                this.updateUI(user);
                
                if (['agenda', 'notebook'].includes(app.currentView)) {
                    app.navigate(app.currentView);
                }
            });
        }
    },
    
    async signIn() {
        if (!window.fb || !window.fb.auth) {
            app.toast('Error: Firebase no está configurado.');
            return;
        }
        try {
            await window.fb.signInWithPopup(window.fb.auth, window.fb.provider);
            app.toast('Sesión iniciada correctamente');
        } catch (error) {
            console.error(error);
            app.toast('Error al iniciar sesión');
        }
    },
    
    async signOut() {
        if (!window.fb || !window.fb.auth) return;
        try {
            await window.fb.signOut(window.fb.auth);
            
            // Clean up state
            Agenda.events = [];
            Agenda.renderEvents();
            
            Notebook.subjects = [];
            Notebook.topics = [];
            Notebook.currentSubjectId = null;
            Notebook.currentTopicId = null;
            Notebook.renderSubjects();
            Notebook.renderTopics();
            const nbEditor = document.getElementById('nb-editor');
            if (nbEditor) nbEditor.innerHTML = '';
            
            app.toast('Sesión cerrada');
            app.navigate('home');
        } catch (error) {
            console.error(error);
        }
    },
    
    updateUI(user) {
        const btnLogin = document.getElementById('btn-login');
        const userInfo = document.getElementById('user-info');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        
        if (user) {
            if (btnLogin) btnLogin.classList.add('hidden');
            if (userInfo) userInfo.classList.remove('hidden');
            if (userInfo) userInfo.classList.add('flex');
            if (userAvatar) userAvatar.src = user.photoURL || 'https://ui-avatars.com/api/?name=U';
            if (userName) userName.textContent = user.displayName || 'Usuario';
        } else {
            if (btnLogin) btnLogin.classList.remove('hidden');
            if (userInfo) userInfo.classList.add('hidden');
            if (userInfo) userInfo.classList.remove('flex');
        }
    }
};

// ==========================================
// MODULE: Agenda
// ==========================================
const Agenda = {
    currentDate: new Date(),
    selectedDate: new Date(),
    events: [],
    
    init() {
        this.prevBtn = document.getElementById('cal-prev');
        this.nextBtn = document.getElementById('cal-next');
        if (!this.prevBtn) return;
        
        this.prevBtn.onclick = () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        };
        this.nextBtn.onclick = () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        };
        
        document.getElementById('agenda-add-btn').onclick = () => this.addEvent();
        
        this.renderCalendar();
    },
    
    renderCalendar() {
        const monthEl = document.getElementById('cal-month');
        const daysEl = document.getElementById('cal-days');
        if (!monthEl) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        monthEl.textContent = `${monthNames[month]} ${year}`;
        
        daysEl.innerHTML = '';
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let startDay = firstDay === 0 ? 6 : firstDay - 1;
        
        for (let i = 0; i < startDay; i++) {
            daysEl.innerHTML += `<div></div>`;
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            const isSelected = this.selectedDate.getDate() === i && this.selectedDate.getMonth() === month && this.selectedDate.getFullYear() === year;
            const btn = document.createElement('button');
            btn.className = `w-full aspect-square flex items-center justify-center rounded-lg text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${isSelected ? 'bg-brand-500 text-white font-bold shadow-md hover:bg-brand-600 dark:hover:bg-brand-600' : 'text-slate-700 dark:text-slate-300'}`;
            btn.textContent = i;
            btn.onclick = () => {
                this.selectedDate = new Date(year, month, i);
                this.renderCalendar();
                this.renderEvents();
            };
            daysEl.appendChild(btn);
        }
    },
    
    async loadEvents() {
        if (!AuthManager.currentUser || !window.fb.db) return;
        
        const q = window.fb.query(
            window.fb.collection(window.fb.db, "agenda"), 
            window.fb.where("uid", "==", AuthManager.currentUser.uid)
        );
        
        window.fb.onSnapshot(q, (snapshot) => {
            this.events = [];
            snapshot.forEach((doc) => {
                this.events.push({ id: doc.id, ...doc.data() });
            });
            this.renderEvents();
        }, (error) => {
            console.error("Error cargando eventos:", error);
            app.toast("Error al cargar eventos. ¿Índices creados?");
        });
    },
    
    renderEvents() {
        const listEl = document.getElementById('agenda-events-list');
        const dateEl = document.getElementById('agenda-selected-date');
        if (!listEl) return;
        
        const year = this.selectedDate.getFullYear();
        const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(this.selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        dateEl.textContent = `Eventos del ${day}/${month}/${year}`;
        
        const dayEvents = this.events.filter(e => e.date === dateString);
        
        listEl.innerHTML = '';
        if (dayEvents.length === 0) {
            listEl.innerHTML = `<div class="flex items-center justify-center h-full text-slate-400 text-sm italic">No hay eventos para este día.</div>`;
            return;
        }
        
        dayEvents.forEach(ev => {
            const el = document.createElement('div');
            el.className = 'bg-white dark:bg-[#1a2233] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center group';
            el.innerHTML = `
                <div>
                    <div class="font-bold text-slate-800 dark:text-slate-200">${this.escapeHtml(ev.title)}</div>
                    <div class="text-xs text-slate-500">${ev.time || 'Todo el día'}</div>
                </div>
                <button class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-2" onclick="window.Agenda.deleteEvent('${ev.id}')"><i class="fa-solid fa-trash-can"></i></button>
            `;
            listEl.appendChild(el);
        });
    },
    
    addEvent() {
        if (!AuthManager.currentUser || !window.fb.db) {
            app.toast('Debes iniciar sesión para añadir eventos.');
            return;
        }
        
        ModalManager.show({
            title: 'Nuevo Evento',
            inputs: [
                { label: 'Título del evento', placeholder: 'Ej. Examen de Historia' },
                { label: 'Hora (Opcional)', placeholder: 'Ej. 10:00' }
            ],
            confirmText: 'Añadir',
            onConfirm: async (values) => {
                const title = values[0];
                const time = values[1];
                const year = this.selectedDate.getFullYear();
                const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(this.selectedDate.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${day}`;
                
                try {
                    await window.fb.addDoc(window.fb.collection(window.fb.db, "agenda"), {
                        uid: AuthManager.currentUser.uid,
                        title: title,
                        time: time,
                        date: dateString,
                        createdAt: new Date()
                    });
                    app.toast('Evento añadido');
                } catch (e) {
                    console.error(e);
                }
            }
        });
    },
    
    async deleteEvent(id) {
        if (!confirm('¿Eliminar este evento?')) return;
        try {
            await window.fb.deleteDoc(window.fb.doc(window.fb.db, "agenda", id));
            app.toast('Evento eliminado');
        } catch (e) {
            console.error(e);
        }
    },
    
    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
};

// ==========================================
// MODULE: Notebook
// ==========================================
const Notebook = {
    subjects: [],
    topics: [],
    currentSubjectId: null,
    currentTopicId: null,
    saveTimeout: null,
    
    init() {
        this.addSubjectBtn = document.getElementById('nb-add-subject');
        this.addTopicBtn = document.getElementById('nb-add-topic');
        this.editor = document.getElementById('nb-editor');
        this.imageInput = document.getElementById('nb-insert-image');
        this.linkMindmapBtn = document.getElementById('nb-link-mindmap');
        this.toolbar = document.getElementById('nb-toolbar');
        this.saveStatus = document.getElementById('nb-save-status');
        
        if (!this.addSubjectBtn) return;
        
        this.addSubjectBtn.onclick = () => this.addSubject();
        this.addTopicBtn.onclick = () => this.addTopic();
        
        this.editor.addEventListener('input', () => {
            if (this.currentTopicId) {
                this.saveStatus.textContent = 'Guardando...';
                this.saveStatus.classList.remove('text-green-500');
                this.saveStatus.classList.add('text-slate-400');
                clearTimeout(this.saveTimeout);
                this.saveTimeout = setTimeout(() => this.saveTopicContent(), 1500);
            }
            if (this.activeImage) this.updateResizerPosition();
        });
        
        this.editor.addEventListener('scroll', () => {
            if (this.activeImage) this.updateResizerPosition();
        });
        
        this.imageInput.addEventListener('change', (e) => this.insertImage(e));
        this.linkMindmapBtn.addEventListener('click', () => this.insertMindMapLink());
        
        this.initImageResizer();
    },
    
    async loadSubjects() {
        if (!AuthManager.currentUser || !window.fb.db) return;
        
        const q = window.fb.query(
            window.fb.collection(window.fb.db, "notebook_subjects"), 
            window.fb.where("uid", "==", AuthManager.currentUser.uid),
            window.fb.orderBy("createdAt", "asc")
        );
        
        window.fb.onSnapshot(q, (snapshot) => {
            this.subjects = [];
            snapshot.forEach((doc) => {
                this.subjects.push({ id: doc.id, ...doc.data() });
            });
            this.renderSubjects();
        }, (error) => {
            console.error("Error cargando asignaturas:", error);
            alert("Error cargando asignaturas: " + error.message);
        });
    },
    
    renderSubjects() {
        const listEl = document.getElementById('nb-subjects-list');
        listEl.innerHTML = '';
        
        if (this.subjects.length === 0) {
            listEl.innerHTML = `<div class="text-center text-slate-400 text-xs mt-4">Sin asignaturas</div>`;
            return;
        }
        
        this.subjects.forEach(sub => {
            const isSelected = this.currentSubjectId === sub.id;
            const el = document.createElement('div');
            el.className = `p-3 rounded-xl cursor-pointer transition-colors flex justify-between items-center group ${isSelected ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`;
            el.innerHTML = `
                <div class="font-bold truncate flex-1" onclick="window.Notebook.selectSubject('${sub.id}', '${this.escapeHtml(sub.name)}')">
                    ${this.escapeHtml(sub.name)}
                </div>
                <button class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1" onclick="window.Notebook.deleteSubject('${sub.id}')"><i class="fa-solid fa-xmark"></i></button>
            `;
            listEl.appendChild(el);
        });
    },
    
    addSubject() {
        if (!AuthManager.currentUser) return;
        ModalManager.show({
            title: 'Nueva Asignatura',
            inputs: [{ label: 'Nombre de la asignatura', placeholder: 'Ej. Matemáticas' }],
            confirmText: 'Crear',
            onConfirm: async (values) => {
                const name = values[0];
                try {
                    await window.fb.addDoc(window.fb.collection(window.fb.db, "notebook_subjects"), {
                        uid: AuthManager.currentUser.uid,
                        name: name,
                        createdAt: new Date()
                    });
                    app.toast('Asignatura creada');
                } catch (e) {
                    console.error(e);
                }
            }
        });
    },
    
    async deleteSubject(id) {
        if (!confirm('¿Eliminar asignatura y todos sus temas?')) return;
        try {
            await window.fb.deleteDoc(window.fb.doc(window.fb.db, "notebook_subjects", id));
            if (this.currentSubjectId === id) {
                this.currentSubjectId = null;
                this.currentTopicId = null;
                document.getElementById('nb-current-subject').textContent = 'Selecciona Asignatura';
                this.addTopicBtn.classList.add('hidden');
                document.getElementById('nb-topics-list').innerHTML = '<div class="text-center text-slate-400 text-xs mt-10">Selecciona una asignatura primero</div>';
                this.editor.innerHTML = '';
                this.toolbar.classList.add('opacity-50', 'pointer-events-none');
            }
        } catch (e) {
            console.error(e);
        }
    },
    
    selectSubject(id, name) {
        this.currentSubjectId = id;
        document.getElementById('nb-current-subject').textContent = name;
        this.addTopicBtn.classList.remove('hidden');
        this.currentTopicId = null;
        this.editor.innerHTML = '';
        this.toolbar.classList.add('opacity-50', 'pointer-events-none');
        this.loadTopics();
        this.renderSubjects();
    },
    
    async loadTopics() {
        if (!this.currentSubjectId || !window.fb.db) return;
        
        const q = window.fb.query(
            window.fb.collection(window.fb.db, "notebook_topics"), 
            window.fb.where("subjectId", "==", this.currentSubjectId),
            window.fb.orderBy("createdAt", "asc")
        );
        
        window.fb.onSnapshot(q, (snapshot) => {
            this.topics = [];
            snapshot.forEach((doc) => {
                this.topics.push({ id: doc.id, ...doc.data() });
            });
            this.renderTopics();
        }, (error) => {
            console.error("Error cargando temas:", error);
            alert("Error cargando temas: " + error.message);
        });
    },
    
    renderTopics() {
        const listEl = document.getElementById('nb-topics-list');
        listEl.innerHTML = '';
        
        if (this.topics.length === 0) {
            listEl.innerHTML = `<div class="text-center text-slate-400 text-xs mt-4">Sin temas</div>`;
            return;
        }
        
        this.topics.forEach(topic => {
            const isSelected = this.currentTopicId === topic.id;
            const el = document.createElement('div');
            el.className = `p-3 border-b border-slate-200 dark:border-slate-800 cursor-pointer transition-colors flex justify-between items-center group ${isSelected ? 'bg-slate-200 dark:bg-[#1a2233] border-l-4 border-l-brand-500' : 'hover:bg-slate-200 dark:hover:bg-[#1a2233] border-l-4 border-l-transparent'}`;
            el.innerHTML = `
                <div class="font-medium truncate flex-1 text-sm ${isSelected ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-400'}" onclick="window.Notebook.selectTopic('${topic.id}')">
                    ${this.escapeHtml(topic.title)}
                </div>
                <button class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1" onclick="window.Notebook.deleteTopic('${topic.id}')"><i class="fa-solid fa-trash-can text-xs"></i></button>
            `;
            listEl.appendChild(el);
        });
    },
    
    addTopic() {
        if (!this.currentSubjectId) return;
        ModalManager.show({
            title: 'Nuevo Tema',
            inputs: [{ label: 'Título del tema', placeholder: 'Ej. Tema 1: Ecuaciones' }],
            confirmText: 'Crear',
            onConfirm: async (values) => {
                const title = values[0];
                try {
                    await window.fb.addDoc(window.fb.collection(window.fb.db, "notebook_topics"), {
                        uid: AuthManager.currentUser.uid,
                        subjectId: this.currentSubjectId,
                        title: title,
                        content: '',
                        createdAt: new Date()
                    });
                    app.toast('Tema creado');
                } catch (e) {
                    console.error(e);
                }
            }
        });
    },
    
    async deleteTopic(id) {
        if (!confirm('¿Eliminar este tema?')) return;
        try {
            await window.fb.deleteDoc(window.fb.doc(window.fb.db, "notebook_topics", id));
            if (this.currentTopicId === id) {
                this.currentTopicId = null;
                this.editor.innerHTML = '';
                this.toolbar.classList.add('opacity-50', 'pointer-events-none');
            }
        } catch (e) {
            console.error(e);
        }
    },
    
    selectTopic(id) {
        this.currentTopicId = id;
        this.renderTopics();
        
        const topic = this.topics.find(t => t.id === id);
        if (topic) {
            this.editor.innerHTML = topic.content || '';
            this.toolbar.classList.remove('opacity-50', 'pointer-events-none');
            this.saveStatus.textContent = 'Guardado automático';
            this.saveStatus.classList.remove('text-slate-400');
            this.saveStatus.classList.add('text-green-500');
        }
    },
    
    async saveTopicContent() {
        if (!this.currentTopicId || !window.fb.db) return;
        try {
            await window.fb.updateDoc(window.fb.doc(window.fb.db, "notebook_topics", this.currentTopicId), {
                content: this.editor.innerHTML,
                updatedAt: new Date()
            });
            this.saveStatus.textContent = 'Guardado ✓';
            this.saveStatus.classList.remove('text-slate-400');
            this.saveStatus.classList.add('text-green-500');
        } catch (e) {
            console.error(e);
            this.saveStatus.textContent = 'Error al guardar';
            this.saveStatus.classList.add('text-red-500');
        }
    },
    
    insertImage(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                this.editor.focus();
                document.execCommand('insertImage', false, dataUrl);
                this.editor.dispatchEvent(new Event('input'));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    },
    
    insertMindMapLink() {
        ModalManager.show({
            title: 'Enlace a Mapa Mental',
            description: 'Se creará un enlace directo a los Mapas Mentales.',
            inputs: [{ label: 'Título del enlace', placeholder: 'Ej. Ver mapa de células' }],
            confirmText: 'Insertar',
            onConfirm: (values) => {
                const title = values[0];
                const html = `&nbsp;<span class="cursor-pointer text-brand-500 underline font-bold px-1 rounded hover:bg-brand-50 dark:hover:bg-brand-900/30" onclick="window.app.navigate('mindmap');" contenteditable="false"><i class="fa-solid fa-diagram-project text-xs"></i> ${this.escapeHtml(title)}</span>&nbsp;`;
                
                this.editor.focus();
                document.execCommand('insertHTML', false, html);
                this.editor.dispatchEvent(new Event('input'));
            }
        });
    },
    
    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    },
    
    initImageResizer() {
        this.resizerBox = document.createElement('div');
        this.resizerBox.style.cssText = 'position:absolute;border:2px solid #6366f1;display:none;pointer-events:none;z-index:10;box-shadow:0 0 0 3px rgba(99,102,241,0.2);transition:none;';
        
        this.resizeHandle = document.createElement('div');
        this.resizeHandle.style.cssText = 'position:absolute;bottom:-7px;right:-7px;width:14px;height:14px;background:white;border:2px solid #6366f1;border-radius:50%;cursor:se-resize;pointer-events:auto;box-shadow:0 2px 6px rgba(0,0,0,0.3);';
        this.resizerBox.appendChild(this.resizeHandle);
        
        const editorParent = this.editor.parentElement;
        editorParent.style.position = 'relative';
        editorParent.appendChild(this.resizerBox);
        
        this.activeImage = null;
        let isResizing = false;
        let startX, startWidth;
        
        this.editor.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                this.activeImage = e.target;
                this.activeImage.style.cursor = 'pointer';
                this.activeImage.style.display = 'block';
                this.updateResizerPosition();
                this.resizerBox.style.display = 'block';
            } else if (e.target !== this.resizeHandle) {
                this.resizerBox.style.display = 'none';
                this.activeImage = null;
            }
        });
        
        this.resizeHandle.addEventListener('mousedown', (e) => {
            if (!this.activeImage) return;
            isResizing = true;
            startX = e.clientX;
            startWidth = this.activeImage.clientWidth;
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing || !this.activeImage) return;
            const diffX = e.clientX - startX;
            const newWidth = Math.max(40, startWidth + diffX);
            this.activeImage.style.width = newWidth + 'px';
            this.activeImage.style.height = 'auto';
            this.updateResizerPosition();
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                this.editor.dispatchEvent(new Event('input'));
            }
        });
        
        // Keep resizer in sync while scrolling
        this.editor.addEventListener('scroll', () => {
            if (this.activeImage) this.updateResizerPosition();
        });
    },
    
    updateResizerPosition() {
        if (!this.activeImage || !this.resizerBox) return;
        const parentRect = this.editor.parentElement.getBoundingClientRect();
        const imgRect = this.activeImage.getBoundingClientRect();
        this.resizerBox.style.left = (imgRect.left - parentRect.left) + 'px';
        this.resizerBox.style.top = (imgRect.top - parentRect.top) + 'px';
        this.resizerBox.style.width = imgRect.width + 'px';
        this.resizerBox.style.height = imgRect.height + 'px';
    }
};


window.AuthManager = AuthManager;
window.Agenda = Agenda;
window.Notebook = Notebook;
window.MindMap = MindMap;
window.ModalManager = ModalManager;
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
