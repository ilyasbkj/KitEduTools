import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { MarkdownEditor } from './js/modules/markdown.js';
import { Calculator } from './js/modules/calculator.js';
import { I18n } from './js/modules/i18n.js';
import { Guides } from './js/modules/guides.js';
import { PythonIDE } from './js/modules/python_ide.js';
import { Flashcards } from './js/modules/flashcards.js';

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

window.fb = { auth, db, provider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, setDoc, getDoc };

const app = {
    currentView: 'home',
    currentCategory: 'all',
    tools: [
        { id: 'calculator', nameKey: 'nav_calculator', catKey: 'cat_math', icon: 'fa-calculator', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_calc_desc' },
        { id: 'converter', nameKey: 'nav_converter', catKey: 'cat_math', icon: 'fa-scale-balanced', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_conv_desc' },
        { id: 'editor', nameKey: 'nav_editor', catKey: 'cat_dev', icon: 'fa-code', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_edit_desc' },
        { id: 'pomodoro', nameKey: 'nav_pomodoro', catKey: 'cat_study', icon: 'fa-stopwatch', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_pomo_desc' },
        { id: 'textanalyzer', nameKey: 'nav_textanalyzer', catKey: 'cat_study', icon: 'fa-chart-simple', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_text_desc' },
        { id: 'spellchecker', nameKey: 'nav_spellchecker', catKey: 'cat_study', icon: 'fa-spell-check', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_spell_desc' },
        { id: 'flashcards', nameKey: 'nav_flashcards', catKey: 'cat_study', icon: 'fa-clone', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_flash_desc' },
        { id: 'markdown', nameKey: 'nav_markdown', catKey: 'cat_dev', icon: 'fa-file-pen', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_mark_desc' },
        { id: 'python', nameKey: 'nav_python', catKey: 'cat_dev', icon: 'fa-brands fa-python', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', descKey: 'tool_py_desc' },
        { id: 'guides', nameKey: 'nav_guides', catKey: 'cat_dev', icon: 'fa-book', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_gui_desc' },
        { id: 'agenda', nameKey: 'nav_agenda', catKey: 'cat_study', icon: 'fa-calendar-days', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', descKey: 'tool_agen_desc', badgeKey: 'badge_account' },
        { id: 'notebook', nameKey: 'nav_notebook', catKey: 'cat_study', icon: 'fa-book-journal-whills', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', descKey: 'tool_note_desc', badgeKey: 'badge_account' },
        { id: 'mindmap', nameKey: 'nav_mindmap', catKey: 'cat_study', icon: 'fa-diagram-project', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', descKey: 'tool_mind_desc', badgeKey: 'badge_account' },
    ],

    init() {
        I18n.init();
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
        Flashcards.init();
        MarkdownEditor.init();
        PythonIDE.init();
        Guides.init();
        ModalManager.init();
        AuthManager.init();
        ThemeManager.init();
        Agenda.init();
        Notebook.init();
        
        this.initMobileMenu();
        this.initRouting();
        document.addEventListener('languageChanged', () => {
            this.renderHomeCards(document.getElementById('global-search').value);
        });

        const startView = (location.hash || '').replace('#', '');
        const validStart = startView && document.getElementById(`view-${startView}`) ? startView : 'home';
        this.navigate(validStart, { replace: true });
    },

    initRouting() {
        window.addEventListener('popstate', (e) => {
            const viewId = (e.state && e.state.view) || 'home';
            this.navigate(viewId, { fromPopState: true });
        });
    },

    initTheme() {
        const themeToggleBtn = document.getElementById('theme-toggle');

        // Resuelve el modo inicial (claro / oscuro / personalizado) de forma
        // centralizada para que nunca queden fondo y texto de modos distintos mezclados.
        ThemeManager.resolveInitialMode();

        themeToggleBtn.addEventListener('click', () => {
            // Cambiar manualmente entre claro/oscuro sale siempre del modo Personalizado,
            // así se evita el conflicto de colores que aparecía al alternar modos.
            const goingToDark = ThemeManager.mode === 'custom'
                ? !document.documentElement.classList.contains('dark')
                : ThemeManager.mode !== 'dark';
            ThemeManager.setMode(goingToDark ? 'dark' : 'light');
        });
    },

    navigate(viewId, opts = {}) {
        const { fromPopState = false, replace = false } = opts;

        // Update browser history so the back button moves between
        // in-app views instead of leaving the site.
        if (!fromPopState) {
            const url = viewId === 'home' ? (location.pathname + location.search) : `#${viewId}`;
            if (replace || !history.state) {
                history.replaceState({ view: viewId }, '', url);
            } else if (history.state.view !== viewId) {
                history.pushState({ view: viewId }, '', url);
            }
        }

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
                if (viewId === 'agenda') { Agenda.loadEvents(); Notebook.loadSubjects(); }
                if (viewId === 'notebook') Notebook.loadSubjects();
                if (viewId === 'mindmap') MindMap.loadFromCloud();
            }
        } else {
            overlay.classList.add('hidden');
        }
        
        this.currentView = viewId;
        if (typeof Pomodoro !== 'undefined') Pomodoro.onNavigate(viewId);
        
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
        
        let filteredTools = this.tools.map(tool => ({
            ...tool,
            name: I18n.get(tool.nameKey),
            cat: I18n.get(tool.catKey),
            desc: I18n.get(tool.descKey),
            badge: tool.badgeKey ? I18n.get(tool.badgeKey) : null
        })).filter(tool => {
            const matchSearch = tool.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                                tool.desc.toLowerCase().includes(searchFilter.toLowerCase());
            // matchCat uses the actual key comparison to avoid translation mismatch
            const matchCat = this.currentCategory === 'all' || I18n.get(tool.catKey) === this.currentCategory || tool.catKey === this.currentCategory;
            return matchSearch && matchCat;
        });

        // SORT BY CUSTOM CATEGORY ORDER AND BADGE
        const catOrder = { 'cat_study': 1, 'cat_math': 2, 'cat_dev': 3 };
        
        filteredTools.sort((a, b) => {
            const aIsAccount = a.badgeKey === 'badge_account';
            const bIsAccount = b.badgeKey === 'badge_account';
            
            if (aIsAccount && !bIsAccount) return 1;
            if (!aIsAccount && bIsAccount) return -1;
            
            const orderA = catOrder[a.catKey] || 99;
            const orderB = catOrder[b.catKey] || 99;
            
            if (orderA !== orderB) return orderA - orderB;
            
            return a.name.localeCompare(b.name);
        });

        if (filteredTools.length === 0) {
            grid.innerHTML = `<p class="col-span-full text-center text-slate-500 py-10" data-i18n="no_tools_found">${I18n.get('no_tools_found')}</p>`;
            return;
        }

        filteredTools.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-[#1a2233] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-800/80 transform hover:-translate-y-1 group';
            card.onclick = () => { this.navigate(tool.id); };
            
            const badgeHtml = tool.badge
                ? `<span class="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1"><i class="fa-solid fa-cloud text-[9px]"></i>${tool.badge}</span>`
                : `<span class="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">${tool.cat}</span>`;
            
            card.innerHTML = `
                <div class="flex items-start justify-between mb-4">
                    <div class="w-14 h-14 rounded-2xl ${tool.bg} ${tool.color} flex items-center justify-center text-2xl transition-transform group-hover:scale-110">
                        <i class="fa-solid ${tool.icon}"></i>
                    </div>
                    ${badgeHtml}
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
    // Multi-map state
    maps: [],
    currentMapId: null,

    init() {
        this.container = document.getElementById('mindmap-container');
        this.svg = document.getElementById('mindmap-svg');
        this.nodesContainer = document.getElementById('mindmap-nodes');
        this.toolbar = document.getElementById('mm-toolbar');

        document.getElementById('mm-add-root').onclick = () => this.addNode(null, true);
        document.getElementById('mm-clear').onclick = () => { if (confirm('\u00bfVaciar el mapa actual?')) { this.clearMap(false); this.saveToCloud(); } };
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
        
        const fontSelectInput = document.getElementById('mm-font-select');
        if (fontSelectInput) {
            fontSelectInput.addEventListener('change', (e) => this.setNodeFontFamily(e.target.value));
        }

        document.getElementById('mm-size-up').onclick = () => this.setNodeScale(0.1);
        document.getElementById('mm-size-down').onclick = () => this.setNodeScale(-0.1);

        this.initPanZoom();

        // Don't auto-clearMap; wait for user to select/create a map
    },

    // ---- Pan & Zoom (estilo MindMeister) ----

    initPanZoom() {
        this.panX = 0;
        this.panY = 0;
        this.zoom = 1;
        this.MIN_ZOOM = 0.2;
        this.MAX_ZOOM = 3;
        this._activePointers = new Map();
        this._pinchStartDist = null;
        this._pinchStartZoom = 1;
        this._isPanning = false;
        this._panMoved = false;
        this.nodesContainer.style.transformOrigin = '0 0';

        const zoomInBtn = document.getElementById('mm-zoom-in');
        const zoomOutBtn = document.getElementById('mm-zoom-out');
        const zoomResetBtn = document.getElementById('mm-zoom-reset');
        if (zoomInBtn) zoomInBtn.onclick = () => this.zoomAtCenter(1.2);
        if (zoomOutBtn) zoomOutBtn.onclick = () => this.zoomAtCenter(1 / 1.2);
        if (zoomResetBtn) zoomResetBtn.onclick = () => this.fitToContent();

        // Mouse wheel = zoom centrado en el cursor (como MindMeister)
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
            this.zoomAt(e.clientX, e.clientY, factor);
        }, { passive: false });

        // Pointer events unificados (ratón + táctil) para pan y pinch-zoom
        this.container.addEventListener('pointerdown', (e) => {
            this._activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (this._activePointers.size === 2) {
                // Empieza gesto de pellizco
                this.dragNode = null;
                this._isPanning = false;
                const pts = Array.from(this._activePointers.values());
                this._pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                this._pinchStartZoom = this.zoom;
                return;
            }

            const isBackground = (e.target === this.container || e.target === this.svg || e.target === this.nodesContainer);
            if (isBackground && this._activePointers.size === 1) {
                this._isPanning = true;
                this._panMoved = false;
                this._panStart = { x: e.clientX, y: e.clientY, panX: this.panX, panY: this.panY };
                this.container.setPointerCapture(e.pointerId);
                this.container.classList.add('mm-panning');
            }
        });

        this.container.addEventListener('pointermove', (e) => {
            if (!this._activePointers.has(e.pointerId)) return;
            this._activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (this._activePointers.size === 2 && this._pinchStartDist) {
                const pts = Array.from(this._activePointers.values());
                const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                const factor = dist / this._pinchStartDist;
                const midX = (pts[0].x + pts[1].x) / 2;
                const midY = (pts[0].y + pts[1].y) / 2;
                const targetZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this._pinchStartZoom * factor));
                this.zoomAt(midX, midY, targetZoom / this.zoom);
                return;
            }

            if (this._isPanning && this._panStart) {
                const dx = e.clientX - this._panStart.x;
                const dy = e.clientY - this._panStart.y;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._panMoved = true;
                this.panX = this._panStart.panX + dx;
                this.panY = this._panStart.panY + dy;
                this.applyTransform();
            }
        });

        const endPointer = (e) => {
            this._activePointers.delete(e.pointerId);
            if (this._activePointers.size < 2) {
                this._pinchStartDist = null;
            }
            if (this._isPanning && this._activePointers.size === 0) {
                this._isPanning = false;
                this.container.classList.remove('mm-panning');
                if (!this._panMoved) {
                    // Fue un simple clic en el fondo: deseleccionar nodo
                    this.selectNode(null);
                }
            }
        };
        this.container.addEventListener('pointerup', endPointer);
        this.container.addEventListener('pointercancel', endPointer);

        this.applyTransform();
    },

    screenToWorld(clientX, clientY) {
        const rect = this.container.getBoundingClientRect();
        return {
            x: (clientX - rect.left - this.panX) / this.zoom,
            y: (clientY - rect.top - this.panY) / this.zoom
        };
    },

    applyTransform() {
        this.nodesContainer.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
        const label = document.getElementById('mm-zoom-level');
        if (label) label.textContent = Math.round(this.zoom * 100) + '%';
        this.renderLines();
        if (this.selectedNodeId) this.updateToolbarPosition();
    },

    zoomAt(clientX, clientY, factor) {
        const rect = this.container.getBoundingClientRect();
        const px = clientX - rect.left;
        const py = clientY - rect.top;
        const worldX = (px - this.panX) / this.zoom;
        const worldY = (py - this.panY) / this.zoom;

        const newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoom * factor));
        this.panX = px - worldX * newZoom;
        this.panY = py - worldY * newZoom;
        this.zoom = newZoom;
        this.applyTransform();
    },

    zoomAtCenter(factor) {
        const rect = this.container.getBoundingClientRect();
        this.zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
    },

    fitToContent() {
        if (this.nodes.length === 0) {
            this.panX = 0; this.panY = 0; this.zoom = 1;
            this.applyTransform();
            return;
        }
        const padding = 80;
        const xs = this.nodes.map(n => n.x);
        const ys = this.nodes.map(n => n.y);
        const widths = this.nodes.map(n => (n.el ? n.el.offsetWidth : 150) * n.scale);
        const heights = this.nodes.map(n => (n.el ? n.el.offsetHeight : 44) * n.scale);

        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs.map((x, i) => x + widths[i]));
        const maxY = Math.max(...ys.map((y, i) => y + heights[i]));

        const contentW = Math.max(1, maxX - minX);
        const contentH = Math.max(1, maxY - minY);
        const rect = this.container.getBoundingClientRect();

        const scale = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM,
            Math.min((rect.width - padding * 2) / contentW, (rect.height - padding * 2) / contentH, 1.5)
        ));

        this.zoom = scale;
        this.panX = (rect.width - contentW * scale) / 2 - minX * scale;
        this.panY = (rect.height - contentH * scale) / 2 - minY * scale;
        this.applyTransform();
    },

    // ---- Multi-map management ----
    
    addMap() {
        if (!AuthManager.currentUser) return;
        ModalManager.show({
            title: 'Nuevo Mapa Mental',
            inputs: [{ label: 'Nombre del mapa', placeholder: 'Ej. Tema 1: C\u00e9lulas' }],
            confirmText: 'Crear',
            onConfirm: async (values) => {
                const name = values[0];
                try {
                    const docRef = await window.fb.addDoc(window.fb.collection(window.fb.db, 'mindmaps'), {
                        uid: AuthManager.currentUser.uid,
                        name: name,
                        data: JSON.stringify({ nodes: [], connections: [] }),
                        createdAt: new Date()
                    });
                    app.toast('Mapa creado');
                    this.selectMap(docRef.id, name);
                } catch (e) {
                    console.error(e);
                    app.toast('Error al crear mapa');
                }
            }
        });
    },

    async loadFromCloud() {
        if (!AuthManager.currentUser || !window.fb.db) return;
        
        const q = window.fb.query(
            window.fb.collection(window.fb.db, 'mindmaps'),
            window.fb.where('uid', '==', AuthManager.currentUser.uid)
        );

        window.fb.onSnapshot(q, (snapshot) => {
            this.maps = [];
            snapshot.forEach(doc => this.maps.push({ id: doc.id, ...doc.data() }));
            this.maps.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            this.renderMapList();
        }, (err) => { console.error(err); app.toast('Error al cargar los mapas'); });
    },

    renderMapList() {
        const listEl = document.getElementById('mm-maps-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        if (this.maps.length === 0) {
            listEl.innerHTML = '<div class="text-center text-slate-400 text-xs mt-6 px-2">Crea tu primer mapa con el bot\u00f3n +</div>';
            return;
        }

        this.maps.forEach(map => {
            const isSelected = this.currentMapId === map.id;
            const el = document.createElement('div');
            el.className = `p-2 rounded-lg cursor-pointer transition-colors flex justify-between items-center group text-sm ${isSelected ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`;
            el.innerHTML = `
                <span class="truncate flex-1" onclick="window.MindMap.selectMap('${map.id}', '${map.name.replace(/'/g, "\\'")}')"><i class="fa-solid fa-diagram-project mr-2 opacity-50"></i>${map.name}</span>
                <button class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity pl-1 flex-shrink-0" onclick="window.MindMap.deleteMap('${map.id}')"><i class="fa-solid fa-trash-can text-xs"></i></button>
            `;
            listEl.appendChild(el);
        });
    },

    async selectMap(id, name) {
        this.currentMapId = id;
        document.getElementById('mm-current-name').textContent = '— ' + name;
        
        // Show canvas, hide empty state
        document.getElementById('mm-empty-state').classList.add('hidden');
        document.getElementById('mm-canvas-wrapper').classList.remove('hidden');
        document.getElementById('mm-canvas-wrapper').classList.add('flex');

        this.renderMapList();

        // Load data
        const map = this.maps.find(m => m.id === id);
        if (map && map.data) {
            const data = JSON.parse(map.data);
            this._loadData(data);
        } else {
            this.clearMap(false);
        }
    },

    async deleteMap(id) {
        if (!confirm('\u00bfEliminar este mapa?')) return;
        try {
            await window.fb.deleteDoc(window.fb.doc(window.fb.db, 'mindmaps', id));
            if (this.currentMapId === id) {
                this.currentMapId = null;
                this.clearMap(false);
                document.getElementById('mm-empty-state').classList.remove('hidden');
                document.getElementById('mm-canvas-wrapper').classList.add('hidden');
                document.getElementById('mm-canvas-wrapper').classList.remove('flex');
                document.getElementById('mm-current-name').textContent = '';
            }
            app.toast('Mapa eliminado');
        } catch (e) { console.error(e); }
    },

    async saveToCloud() {
        if (!AuthManager.currentUser || !window.fb.db || !this.currentMapId) return;
        const data = this.getMapData();
        try {
            await window.fb.updateDoc(window.fb.doc(window.fb.db, 'mindmaps', this.currentMapId), {
                data: JSON.stringify(data),
                updatedAt: new Date()
            });
            app.toast('Mapa guardado \u2713');
        } catch (e) { console.error(e); }
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

        el.addEventListener('pointerdown', (e) => this.startDrag(e, id, el));

        this.nodesContainer.appendChild(el);
        this.nodes.push({ id, text: content.innerHTML, x, y, bgColor: defaultBg, textColor: defaultText, scale: 1, fontFamily: '', el });

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
    
    setNodeFontFamily(fontFamily) {
        if (!this.selectedNodeId) return;
        const node = this.nodes.find(n => n.id === this.selectedNodeId);
        if (node) {
            node.fontFamily = fontFamily;
            node.el.style.fontFamily = fontFamily;
            this.saveToCloud();
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
        if (this._activePointers && this._activePointers.size >= 1 && e.pointerType === 'touch') {
            // Evita conflicto si ya hay un gesto de pellizco en curso sobre el fondo
            if (this._activePointers.size >= 2) return;
        }

        // Selecciona el nodo (resalta el borde) pero NO muestra el mini menú
        // todavía: solo debe aparecer si esto termina siendo un clic, no un arrastre.
        this.selectNode(id, { showToolbar: false });
        this.dragNode = id;
        this.toolbar.classList.add('hidden');

        // Umbral de movimiento para distinguir un clic de un arrastre real.
        this._dragStartClientX = e.clientX;
        this._dragStartClientY = e.clientY;
        this._dragMoved = false;
        const DRAG_THRESHOLD = 4; // px

        const node = this.nodes.find(n => n.id === id);
        const worldPointer = this.screenToWorld(e.clientX, e.clientY);
        this.dragOffsetX = worldPointer.x - (node ? node.x : 0);
        this.dragOffsetY = worldPointer.y - (node ? node.y : 0);

        el.setPointerCapture(e.pointerId);

        const moveHandler = (ev) => {
            if (!this._dragMoved) {
                const dx = ev.clientX - this._dragStartClientX;
                const dy = ev.clientY - this._dragStartClientY;
                if (Math.hypot(dx, dy) > DRAG_THRESHOLD) this._dragMoved = true;
            }
            this.drag(ev);
        };
        const upHandler = (ev) => {
            el.removeEventListener('pointermove', moveHandler);
            el.removeEventListener('pointerup', upHandler);
            el.removeEventListener('pointercancel', upHandler);
            this.dragNode = null;

            if (this._dragMoved) {
                // Fue un arrastre real: guarda la nueva posición pero mantiene
                // el mini menú oculto, tal y como pasaba mientras se arrastraba.
                this.saveToCloud();
            } else {
                // Fue un clic (sin arrastre real): muestra el mini menú de configuración.
                this.updateToolbarPosition();
            }
            this._dragMoved = false;
        };

        el.addEventListener('pointermove', moveHandler);
        el.addEventListener('pointerup', upHandler);
        el.addEventListener('pointercancel', upHandler);
    },

    drag(e) {
        if (!this.dragNode) return;
        if (!this._dragMoved) return; // no mover hasta superar el umbral de arrastre

        const el = document.getElementById(this.dragNode);
        const node = this.nodes.find(n => n.id === this.dragNode);
        if (!el || !node) return;

        const worldPointer = this.screenToWorld(e.clientX, e.clientY);
        const newX = worldPointer.x - this.dragOffsetX;
        const newY = worldPointer.y - this.dragOffsetY;

        el.style.left = newX + 'px';
        el.style.top = newY + 'px';

        node.x = newX;
        node.y = newY;

        this.renderLines();
    },

    selectNode(id, opts = {}) {
        const { showToolbar = true } = opts;
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
                    const fontSelect = document.getElementById('mm-font-select');
                    if (fontSelect) fontSelect.value = nodeData.fontFamily || '';
                }
                
                if (showToolbar) {
                    this.updateToolbarPosition();
                } else {
                    this.toolbar.classList.add('hidden');
                }
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

        // Posicionar en espacio de pantalla (funciona con cualquier pan/zoom)
        const elRect = el.getBoundingClientRect();
        const refEl = this.toolbar.offsetParent || document.getElementById('view-mindmap');
        const refRect = refEl.getBoundingClientRect();
        const gap = 8;

        // Medir el tamaño real del menú (ya está visible, así que offsetWidth/Height son fiables)
        const tbWidth = this.toolbar.offsetWidth || 200;
        const tbHeight = this.toolbar.offsetHeight || 180;

        const nodeTop = elRect.top - refRect.top;
        const nodeBottom = elRect.bottom - refRect.top;
        const nodeLeft = elRect.left - refRect.left;

        // Preferir encima del nodo; si no hay espacio suficiente arriba, colocar debajo.
        let y;
        if (nodeTop - tbHeight - gap >= 0) {
            y = nodeTop - tbHeight - gap;
        } else {
            y = nodeBottom + gap;
            // Si tampoco cabe debajo (nodo muy alto en un lienzo pequeño), ajusta al límite inferior visible.
            const maxY = refRect.height - tbHeight - gap;
            if (y > maxY && maxY > 0) y = maxY;
            if (y < 0) y = gap;
        }

        // Ajustar horizontalmente para que el menú no se salga del lienzo.
        let x = nodeLeft;
        const maxX = refRect.width - tbWidth - gap;
        if (x > maxX) x = Math.max(gap, maxX);
        if (x < gap) x = gap;

        this.toolbar.style.left = x + 'px';
        this.toolbar.style.top = y + 'px';
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
        this.panX = 0;
        this.panY = 0;
        this.zoom = 1;
        if (this.nodesContainer) this.applyTransform();
        this.selectNode(null);
        if (keepRoot) {
            this.addNode(null, true);
        }
    },

    exportJSON() {
        const data = {
            nodes: this.nodes.map(n => ({ id: n.id, text: n.text, x: n.x, y: n.y, bgColor: n.bgColor, textColor: n.textColor, scale: n.scale, fontFamily: n.fontFamily })),
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
                    if (n.fontFamily) el.style.fontFamily = n.fontFamily;
                    
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

                    el.addEventListener('pointerdown', (ev) => this.startDrag(ev, n.id, el));

                    this.nodesContainer.appendChild(el);
                    this.nodes.push({ id: n.id, text: n.text, x: n.x, y: n.y, bgColor: n.bgColor || '#ffffff', textColor: n.textColor || '#1e293b', scale: scale, fontFamily: n.fontFamily || '', el });
                });

                this.connections = data.connections;
                this.renderLines();
                this.fitToContent();
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
            nodes: this.nodes.map(n => ({ id: n.id, text: n.text, x: n.x, y: n.y, bgColor: n.bgColor, textColor: n.textColor, scale: n.scale, fontFamily: n.fontFamily })),
            connections: this.connections
        };
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
            if (n.fontFamily) el.style.fontFamily = n.fontFamily;
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
            el.addEventListener('pointerdown', (ev) => this.startDrag(ev, n.id, el));
            this.nodesContainer.appendChild(el);
            this.nodes.push({ id: n.id, text: n.text, x: n.x, y: n.y, bgColor: n.bgColor || '#ffffff', textColor: n.textColor || '#1e293b', scale, fontFamily: n.fontFamily || '', el });
        });
        this.connections = data.connections;
        this.renderLines();
        this.fitToContent();
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
    // Floating widget state
    floatingEl: null,
    floatingCollapsed: false,
    floatingHiddenByUser: false,
    _dragInfo: null,

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
            this.refreshFloatingVisibility();
        };
        
        pauseBtn.onclick = () => {
            this.pauseTimer();
            pauseBtn.classList.add('hidden');
            startBtn.classList.remove('hidden');
            this.refreshFloatingVisibility();
        };

        resetBtn.onclick = () => {
            this.pauseTimer();
            this.isWorking = true;
            this.timeLeft = this.workMin * 60;
            this.totalTime = this.timeLeft;
            this.updateDisplay();
            startBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
            this.refreshFloatingVisibility();
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
        this.initFloatingWidget();
    },

    // ---- Floating / minimized widget ----

    initFloatingWidget() {
        this.floatingEl = document.getElementById('pomo-floating');
        if (!this.floatingEl) return;

        const expandedBox = document.getElementById('pomo-floating-expanded');
        const collapsedBox = document.getElementById('pomo-floating-collapsed');
        const toggleBtn = document.getElementById('pomo-floating-toggle');
        const closeBtn = document.getElementById('pomo-floating-close');
        const playPauseBtn = document.getElementById('pomo-floating-playpause');
        const dragHandle = document.getElementById('pomo-floating-handle');

        // Restore saved position
        try {
            const saved = JSON.parse(localStorage.getItem('pomoFloatingPos') || 'null');
            if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
                this.floatingEl.style.left = saved.left + 'px';
                this.floatingEl.style.top = saved.top + 'px';
                this.floatingEl.style.right = 'auto';
                this.floatingEl.style.bottom = 'auto';
            }
        } catch (e) { /* ignore */ }

        toggleBtn.addEventListener('click', () => {
            this.floatingCollapsed = true;
            this.renderFloatingMode();
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.floatingHiddenByUser = true;
            this.refreshFloatingVisibility();
        });

        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.timerId) {
                this.pauseTimer();
            } else {
                this.startTimer();
            }
            this.updateDisplay();
            document.getElementById('pomo-start')?.classList.toggle('hidden', !!this.timerId);
            document.getElementById('pomo-pause')?.classList.toggle('hidden', !this.timerId);
        });

        // Clicking the collapsed bubble (not dragging) expands it back
        collapsedBox.addEventListener('click', () => {
            if (this._dragInfo && this._dragInfo.moved) return;
            this.floatingCollapsed = false;
            this.renderFloatingMode();
        });

        this.initFloatingDrag(dragHandle);
        this.initFloatingDrag(collapsedBox);
        this.renderFloatingMode();
    },

    initFloatingDrag(handleEl) {
        handleEl.addEventListener('pointerdown', (e) => {
            const rect = this.floatingEl.getBoundingClientRect();
            this._dragInfo = {
                startX: e.clientX, startY: e.clientY,
                origLeft: rect.left, origTop: rect.top,
                moved: false
            };
            handleEl.setPointerCapture(e.pointerId);
        });

        handleEl.addEventListener('pointermove', (e) => {
            if (!this._dragInfo) return;
            const dx = e.clientX - this._dragInfo.startX;
            const dy = e.clientY - this._dragInfo.startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._dragInfo.moved = true;
            if (!this._dragInfo.moved) return;

            const margin = 8;
            const maxLeft = window.innerWidth - this.floatingEl.offsetWidth - margin;
            const maxTop = window.innerHeight - this.floatingEl.offsetHeight - margin;
            const newLeft = Math.max(margin, Math.min(this._dragInfo.origLeft + dx, maxLeft));
            const newTop = Math.max(margin, Math.min(this._dragInfo.origTop + dy, maxTop));

            this.floatingEl.style.left = newLeft + 'px';
            this.floatingEl.style.top = newTop + 'px';
            this.floatingEl.style.right = 'auto';
            this.floatingEl.style.bottom = 'auto';
        });

        const endDrag = (e) => {
            if (!this._dragInfo) return;
            if (this._dragInfo.moved) {
                const rect = this.floatingEl.getBoundingClientRect();
                localStorage.setItem('pomoFloatingPos', JSON.stringify({ left: rect.left, top: rect.top }));
            }
            // Keep _dragInfo.moved briefly so the click handler can suppress a click-through
            setTimeout(() => { this._dragInfo = null; }, 0);
        };
        handleEl.addEventListener('pointerup', endDrag);
        handleEl.addEventListener('pointercancel', endDrag);
    },

    renderFloatingMode() {
        const expandedBox = document.getElementById('pomo-floating-expanded');
        const collapsedBox = document.getElementById('pomo-floating-collapsed');
        if (!expandedBox || !collapsedBox) return;
        expandedBox.classList.toggle('hidden', this.floatingCollapsed);
        collapsedBox.classList.toggle('hidden', !this.floatingCollapsed);
    },

    onNavigate(viewId) {
        if (viewId === 'pomodoro') {
            // Re-arm visibility: leaving the tab again should show the widget
            this.floatingHiddenByUser = false;
        }
        this.refreshFloatingVisibility();
    },

    refreshFloatingVisibility() {
        if (!this.floatingEl) return;
        const active = !!this.timerId || this.timeLeft !== this.totalTime; // corriendo o en pausa a medias
        const shouldShow = active && app.currentView !== 'pomodoro' && !this.floatingHiddenByUser;
        this.floatingEl.classList.toggle('hidden', !shouldShow);
        if (shouldShow) this.updateFloatingDisplay();
    },

    updateFloatingDisplay() {
        if (!this.floatingEl || this.floatingEl.classList.contains('hidden')) return;
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const bigTime = document.getElementById('pomo-floating-time');
        const smallTime = document.getElementById('pomo-floating-mini-time');
        if (bigTime) bigTime.textContent = timeStr;
        if (smallTime) smallTime.textContent = timeStr;

        const statusEl = document.getElementById('pomo-floating-status');
        if (statusEl) statusEl.textContent = this.isWorking ? 'Estudio' : 'Descanso';

        const playPauseBtn = document.getElementById('pomo-floating-playpause');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = this.timerId
                ? '<i class="fa-solid fa-pause"></i>'
                : '<i class="fa-solid fa-play"></i>';
        }

        const ring = document.getElementById('pomo-floating-ring');
        if (ring) {
            const circumference = 2 * Math.PI * 26;
            const offset = circumference - (this.timeLeft / this.totalTime) * circumference;
            ring.style.strokeDasharray = circumference;
            ring.style.strokeDashoffset = offset;
        }
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
        this.refreshFloatingVisibility();
    },

    pauseTimer() {
        clearInterval(this.timerId);
        this.timerId = null;
        this.refreshFloatingVisibility();
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

        this.updateFloatingDisplay();
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
            
            const matchData = encodeURIComponent(JSON.stringify(match.replacements.slice(0, 5).map(r => r.value))).replace(/'/g, '%27');
            resultHtml += `<span class="spell-error" onclick="window.SpellChecker.showMenu(event, this, '${matchData}')">${this.escapeHtml(errorText)}</span>`;
            
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

            let field;
            if (inp.type === 'select') {
                field = document.createElement('select');
                field.className = 'w-full bg-slate-50 dark:bg-[#0f141e] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow';
                (inp.options || []).forEach(opt => {
                    const optionEl = document.createElement('option');
                    optionEl.value = opt.value;
                    optionEl.textContent = opt.label;
                    if (inp.value !== undefined && inp.value === opt.value) optionEl.selected = true;
                    field.appendChild(optionEl);
                });
            } else if (inp.type === 'color') {
                field = document.createElement('input');
                field.type = 'color';
                field.value = inp.value || '#f64b31';
                field.className = 'w-14 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent p-0';
            } else {
                field = document.createElement('input');
                field.type = inp.type || 'text';
                field.placeholder = inp.placeholder || '';
                if (inp.value !== undefined) field.value = inp.value;
                field.className = 'w-full bg-slate-50 dark:bg-[#0f141e] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow';
            }
            field.id = `modal-inp-${idx}`;
            
            wrapper.appendChild(label);
            wrapper.appendChild(field);
            this.body.appendChild(wrapper);
            inputElements.push(field);
        });
        
        this.btnConfirm.textContent = confirmText || 'Aceptar';
        this.btnConfirm.onclick = () => {
            const values = inputElements.map((el, idx) => {
                const type = inputs[idx].type;
                return (type === 'select' || type === 'color') ? el.value : el.value.trim();
            });
            const missing = inputs.some((inp, idx) => !inp.optional && values[idx] === '');
            if (missing) {
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
// ==========================================
// MODULE: Theme Manager (color personalizado por cuenta)
// ==========================================
const ThemeManager = {
    DEFAULT_HEX: '#f64b31',
    presets: ['#f64b31', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#0f172a', '#dc2626', '#14b8a6'],
    currentHex: null,

    bgPresets: ['#f8fafc', '#eef2ff', '#fef9c3', '#dcfce7', '#fee2e2', '#e0f2fe', '#f5f5f4', '#0f172a', '#111827', '#1e293b', '#18181b', '#312e81'],
    currentBgHex: null,

    // Modo activo: 'light' | 'dark' | 'custom'. En 'custom' se recalcula
    // automáticamente si conviene texto/tarjetas claras u oscuras según el
    // fondo elegido, para que nunca queden colores ilegibles al mezclarse
    // con el modo claro/oscuro.
    mode: 'dark',
    lastPlainMode: 'dark',

    // Se llama muy pronto (antes de que exista el resto de la UI) para fijar
    // clase 'dark' / fondo personalizado sin parpadeos al cargar la página.
    resolveInitialMode() {
        this.navEl = this.navEl || document.querySelector('nav');
        const savedMode = localStorage.getItem('siteMode');
        const savedBg = localStorage.getItem('pageBgColor');
        if (savedMode === 'custom' && savedBg) {
            this.applyMode('custom', savedBg, { persist: false, updateIcon: true });
        } else if (localStorage.theme === 'light') {
            this.applyMode('light', null, { persist: false, updateIcon: true });
        } else {
            this.applyMode('dark', null, { persist: false, updateIcon: true });
        }
    },

    init() {
        this.btn = document.getElementById('btn-theme-color');
        this.popover = document.getElementById('theme-color-popover');
        this.swatchesEl = document.getElementById('theme-color-swatches');
        this.customInput = document.getElementById('theme-color-custom');
        this.resetBtn = document.getElementById('theme-color-reset');
        this.bgSwatchesEl = document.getElementById('bg-color-swatches');
        this.bgCustomInput = document.getElementById('bg-color-custom');
        this.bgResetBtn = document.getElementById('bg-color-reset');
        this.navEl = document.querySelector('nav');
        if (!this.btn) return;

        this.renderSwatches();
        this.renderBgSwatches();
        this.updateModeButtonsUI();

        document.querySelectorAll('#site-mode-toggle button[data-mode]').forEach(btn => {
            btn.onclick = () => this.setMode(btn.dataset.mode);
        });

        this.btn.onclick = (e) => {
            e.stopPropagation();
            this.popover.classList.toggle('hidden');
        };
        document.addEventListener('click', (e) => {
            if (!this.popover.classList.contains('hidden') && !this.popover.contains(e.target) && e.target !== this.btn) {
                this.popover.classList.add('hidden');
            }
        });

        this.customInput.addEventListener('input', (e) => this.setColor(e.target.value));
        this.resetBtn.onclick = () => this.setColor(this.DEFAULT_HEX);

        if (this.bgCustomInput) this.bgCustomInput.addEventListener('input', (e) => this.setMode('custom', e.target.value));
        if (this.bgResetBtn) this.bgResetBtn.onclick = () => this.setMode(this.lastPlainMode || 'light');

        // Aplica una preferencia guardada localmente mientras se resuelve el login,
        // para evitar parpadeos de color al cargar.
        const cached = localStorage.getItem('accentColor');
        if (cached) this.applyColor(cached, { persist: false });
    },

    renderSwatches() {
        this.swatchesEl.innerHTML = '';
        this.presets.forEach(hex => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 shadow ring-1 ring-slate-200 dark:ring-slate-700 hover:scale-110 transition-transform';
            btn.style.backgroundColor = hex;
            btn.title = hex;
            btn.onclick = () => this.setColor(hex);
            this.swatchesEl.appendChild(btn);
        });
    },

    renderBgSwatches() {
        if (!this.bgSwatchesEl) return;
        this.bgSwatchesEl.innerHTML = '';
        this.bgPresets.forEach(hex => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 shadow ring-1 ring-slate-200 dark:ring-slate-700 hover:scale-110 transition-transform';
            btn.style.backgroundColor = hex;
            btn.title = hex;
            btn.onclick = () => this.setMode('custom', hex);
            this.bgSwatchesEl.appendChild(btn);
        });
    },

    setColor(hex) {
        this.applyColor(hex, { persist: true });
    },

    applyColor(hex, opts = {}) {
        const { persist = false } = opts;
        const palette = this.generatePalette(hex);
        Object.entries(palette).forEach(([stop, rgb]) => {
            document.documentElement.style.setProperty(`--brand-${stop}`, rgb);
        });
        this.currentHex = hex;
        if (this.customInput) this.customInput.value = hex;
        localStorage.setItem('accentColor', hex);

        if (persist) this.saveToAccount(hex);
    },

    // Cambia de modo. 'light' y 'dark' son los modos normales de Tailwind;
    // 'custom' aplica un fondo elegido por el usuario y decide automáticamente
    // si usar texto/tarjetas de estilo claro u oscuro según ese color, para
    // que no se mezclen (eso era lo que "bugueaba" los colores al alternar).
    setMode(mode, bgHex) {
        if (mode === 'custom') {
            const hex = bgHex || this.currentBgHex || localStorage.getItem('pageBgColor') || this.bgPresets[0];
            this.applyMode('custom', hex, { persist: true, updateIcon: true });
        } else {
            this.applyMode(mode, null, { persist: true, updateIcon: true });
        }
    },

    applyMode(mode, bgHex, opts = {}) {
        const { persist = false, updateIcon = false } = opts;
        const themeIcon = document.getElementById('theme-icon');
        let isDarkClass;

        if (mode === 'custom' && bgHex) {
            isDarkClass = !this.isColorLight(bgHex);
            document.documentElement.classList.toggle('dark', isDarkClass);
            document.body.style.backgroundColor = bgHex;
            const { r, g, b } = this.hexToRgb(bgHex);
            if (this.navEl) this.navEl.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
            this.currentBgHex = bgHex;
            if (this.bgCustomInput) this.bgCustomInput.value = bgHex;
            localStorage.setItem('pageBgColor', bgHex);
            localStorage.setItem('siteMode', 'custom');
            localStorage.theme = isDarkClass ? 'dark' : 'light';
        } else {
            isDarkClass = mode === 'dark';
            document.documentElement.classList.toggle('dark', isDarkClass);
            document.body.style.backgroundColor = '';
            if (this.navEl) this.navEl.style.backgroundColor = '';
            this.currentBgHex = null;
            localStorage.setItem('siteMode', mode);
            localStorage.theme = mode;
            localStorage.removeItem('pageBgColor');
            this.lastPlainMode = mode;
        }

        if (updateIcon && themeIcon) {
            themeIcon.classList.remove('fa-sun', 'fa-moon');
            themeIcon.classList.add(isDarkClass ? 'fa-sun' : 'fa-moon');
        }

        this.mode = mode;
        this.updateModeButtonsUI();

        if (persist) this.savePageBgToAccount(mode === 'custom' ? bgHex : null, mode);
    },

    updateModeButtonsUI() {
        ['light', 'dark', 'custom'].forEach(m => {
            const btn = document.getElementById(`site-mode-${m}`);
            if (!btn) return;
            const active = ['bg-white', 'dark:bg-[#1a2233]', 'shadow-sm', 'text-brand-600', 'dark:text-brand-400'];
            const inactive = ['text-slate-500', 'dark:text-slate-400'];
            btn.classList.remove(...active, ...inactive);
            btn.classList.add(...(m === this.mode ? active : inactive));
        });
    },

    // Determina si un color de fondo es percibido como "claro" para poder elegir
    // automáticamente texto/tarjetas legibles en modo Personalizado.
    isColorLight(hex) {
        const { r, g, b } = this.hexToRgb(hex);
        const perceived = (r * 299 + g * 587 + b * 114) / 1000;
        return perceived > 150;
    },

    async savePageBgToAccount(hex, mode) {
        if (!AuthManager.currentUser) {
            app.toast('Inicia sesión para guardar tu modo de cuenta');
            return;
        }
        if (!window.fb || !window.fb.db) return;
        try {
            await window.fb.setDoc(
                window.fb.doc(window.fb.db, 'userPrefs', AuthManager.currentUser.uid),
                { pageBgColor: hex || null, siteMode: mode },
                { merge: true }
            );
            app.toast('Preferencia guardada en tu cuenta ✓');
        } catch (e) {
            console.error(e);
            app.toast('No se pudo guardar la preferencia');
        }
    },

    async saveToAccount(hex) {
        if (!AuthManager.currentUser) {
            app.toast('Inicia sesión para guardar tu color de cuenta');
            return;
        }
        if (!window.fb || !window.fb.db) return;
        try {
            await window.fb.setDoc(
                window.fb.doc(window.fb.db, 'userPrefs', AuthManager.currentUser.uid),
                { accentColor: hex },
                { merge: true }
            );
            app.toast('Color guardado en tu cuenta ✓');
        } catch (e) {
            console.error(e);
            app.toast('No se pudo guardar el color');
        }
    },

    async loadForUser(uid) {
        if (!window.fb || !window.fb.db) return;
        try {
            const snap = await window.fb.getDoc(window.fb.doc(window.fb.db, 'userPrefs', uid));
            if (snap.exists()) {
                const data = snap.data();
                if (data.accentColor) this.applyColor(data.accentColor, { persist: false });
                if (data.siteMode === 'custom' && data.pageBgColor) {
                    this.applyMode('custom', data.pageBgColor, { persist: false, updateIcon: true });
                } else if (data.siteMode === 'light' || data.siteMode === 'dark') {
                    this.applyMode(data.siteMode, null, { persist: false, updateIcon: true });
                }
            }
        } catch (e) { console.error(e); }
    },

    resetToDefault() {
        this.applyColor(this.DEFAULT_HEX, { persist: false });
        localStorage.removeItem('accentColor');
        this.applyMode(this.lastPlainMode || 'dark', null, { persist: false, updateIcon: true });
        localStorage.removeItem('siteMode');
        localStorage.removeItem('pageBgColor');
    },

    // ---- Generación de paleta a partir de un color base (tono 500) ----
    generatePalette(hex) {
        const { r, g, b } = this.hexToRgb(hex);
        const { h, s } = this.rgbToHsl(r, g, b);

        const stops = {
            50:  { l: 96, sMul: 0.55 },
            100: { l: 91, sMul: 0.65 },
            200: { l: 82, sMul: 0.75 },
            300: { l: 71, sMul: 0.85 },
            400: { l: 60, sMul: 1 },
            500: { l: 50, sMul: 1 },
            600: { l: 40, sMul: 1 },
            900: { l: 22, sMul: 0.9 },
        };

        const palette = {};
        Object.entries(stops).forEach(([stop, cfg]) => {
            const sat = Math.max(20, Math.min(95, s * cfg.sMul));
            const { r: rr, g: gg, b: bb } = this.hslToRgb(h, sat, cfg.l);
            palette[stop] = `${rr} ${gg} ${bb}`;
        });
        return palette;
    },

    hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const num = parseInt(hex, 16) || 0;
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    },

    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                default: h = (r - g) / d + 4;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    },

    hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }
};

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

                if (user) {
                    ThemeManager.loadForUser(user.uid);
                } else {
                    ThemeManager.resetToDefault();
                }

                if (['agenda', 'notebook', 'mindmap'].includes(app.currentView)) {
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
            // Los dominios de centro educativo suelen bloquear el popup: reintenta con redirect
            if (['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error.code)) {
                try {
                    await window.fb.signInWithRedirect(window.fb.auth, window.fb.provider);
                    return;
                } catch (redirectErr) {
                    console.error(redirectErr);
                }
            }
            app.toast('Error al iniciar sesión: ' + (error.code || ''));
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
            
            MindMap.maps = [];
            MindMap.currentMapId = null;
            MindMap.clearMap(false);
            MindMap.renderMapList();
            const emptyState = document.getElementById('mm-empty-state');
            const canvasWrapper = document.getElementById('mm-canvas-wrapper');
            if (emptyState) emptyState.classList.remove('hidden');
            if (canvasWrapper) { canvasWrapper.classList.add('hidden'); canvasWrapper.classList.remove('flex'); }
            const mmName = document.getElementById('mm-current-name');
            if (mmName) mmName.textContent = '';
            
            app.toast('Sesión cerrada');
            if (ThemeManager.popover) ThemeManager.popover.classList.add('hidden');
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
    viewMode: 'month',
    
    init() {
        this.prevBtn = document.getElementById('cal-prev');
        this.nextBtn = document.getElementById('cal-next');
        if (!this.prevBtn) return;

        this.calendarCol = document.getElementById('agenda-calendar-col');

        this.viewMode = localStorage.getItem('agendaViewMode') === 'week' ? 'week' : 'month';

        const monthBtn = document.getElementById('agenda-view-month');
        const weekBtn = document.getElementById('agenda-view-week');
        if (monthBtn && weekBtn) {
            monthBtn.onclick = () => this.setViewMode('month');
            weekBtn.onclick = () => this.setViewMode('week');
        }
        this.updateViewToggleUI();
        this.updateLayoutForMode();
        
        this.prevBtn.onclick = () => {
            if (this.viewMode === 'week') {
                this.currentDate.setDate(this.currentDate.getDate() - 7);
            } else {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            }
            this.renderCalendar();
        };
        this.nextBtn.onclick = () => {
            if (this.viewMode === 'week') {
                this.currentDate.setDate(this.currentDate.getDate() + 7);
            } else {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            }
            this.renderCalendar();
        };
        
        document.getElementById('agenda-add-btn').onclick = () => this.addEvent();
        
        this.renderCalendar();
    },

    setViewMode(mode) {
        this.viewMode = mode;
        localStorage.setItem('agendaViewMode', mode);
        this.updateViewToggleUI();
        this.updateLayoutForMode();
        this.renderCalendar();
    },

    // La vista semanal no necesita una columna tan alta como la mensual
    // (antes se estiraba a la altura de toda la tarjeta y quedaba muy alargada).
    updateLayoutForMode() {
        if (!this.calendarCol) return;
        if (this.viewMode === 'week') {
            this.calendarCol.classList.add('md:self-start');
        } else {
            this.calendarCol.classList.remove('md:self-start');
        }
    },

    updateViewToggleUI() {
        const monthBtn = document.getElementById('agenda-view-month');
        const weekBtn = document.getElementById('agenda-view-week');
        if (!monthBtn || !weekBtn) return;
        const active = ['bg-brand-500', 'text-white', 'shadow-sm'];
        const inactive = ['text-slate-600', 'dark:text-slate-300'];
        const isMonth = this.viewMode === 'month';
        monthBtn.classList.remove(...active, ...inactive);
        monthBtn.classList.add(...(isMonth ? active : inactive));
        weekBtn.classList.remove(...active, ...inactive);
        weekBtn.classList.add(...(isMonth ? inactive : active));
    },

    isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    },

    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    },
    
    renderCalendar() {
        if (this.viewMode === 'week') {
            this.renderWeekView();
        } else {
            this.renderMonthView();
        }
    },

    renderMonthView() {
        const monthEl = document.getElementById('cal-month');
        const daysEl = document.getElementById('cal-days');
        if (!monthEl) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        monthEl.textContent = `${monthNames[month]} ${year}`;
        
        daysEl.innerHTML = '';
        daysEl.className = 'grid grid-cols-7 gap-1 text-sm';
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let startDay = firstDay === 0 ? 6 : firstDay - 1;
        
        for (let i = 0; i < startDay; i++) {
            daysEl.innerHTML += `<div></div>`;
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            const isSelected = this.selectedDate.getDate() === i && this.selectedDate.getMonth() === month && this.selectedDate.getFullYear() === year;
            const isToday = this.isSameDay(new Date(year, month, i), new Date());
            const dateString = this.toDateString(new Date(year, month, i));
            const dots = this.getDayDotColors(dateString);
            const btn = document.createElement('button');
            btn.className = `w-full aspect-square flex flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${isSelected ? 'bg-brand-500 text-white font-bold shadow-md hover:bg-brand-600 dark:hover:bg-brand-600' : (isToday ? 'ring-2 ring-brand-400 text-slate-700 dark:text-slate-300' : 'text-slate-700 dark:text-slate-300')}`;
            btn.innerHTML = `
                <span>${i}</span>
                ${this.renderDots(dots, isSelected)}
            `;
            btn.onclick = () => {
                this.selectedDate = new Date(year, month, i);
                this.renderCalendar();
                this.renderEvents();
            };
            daysEl.appendChild(btn);
        }
    },

    // Devuelve los colores (de asignatura) de los eventos de ese día, sin duplicados.
    // Si hay eventos pero ninguno tiene asignatura, devuelve ['default'] para mostrar un punto genérico.
    getDayDotColors(dateString) {
        const dayEvents = this.events.filter(ev => ev.date === dateString);
        if (dayEvents.length === 0) return [];
        const colors = [];
        dayEvents.forEach(ev => {
            const c = ev.subjectColor || 'default';
            if (!colors.includes(c)) colors.push(c);
        });
        return colors.slice(0, 3);
    },

    renderDots(colors, isSelected) {
        if (!colors || colors.length === 0) return '<span class="h-1.5"></span>';
        return `<span class="flex items-center justify-center gap-0.5">${colors.map(c => {
            const style = c === 'default'
                ? (isSelected ? 'background-color:#ffffff' : '')
                : `background-color:${c}`;
            const cls = c === 'default' && !isSelected ? 'bg-brand-500' : '';
            return `<span class="w-1.5 h-1.5 rounded-full ${cls}" style="${style}"></span>`;
        }).join('')}</span>`;
    },

    renderWeekView() {
        const monthEl = document.getElementById('cal-month');
        const daysEl = document.getElementById('cal-days');
        if (!monthEl) return;

        const monthNamesShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const monday = this.getMonday(this.currentDate);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        monthEl.textContent = monday.getMonth() === sunday.getMonth()
            ? `${monday.getDate()} – ${sunday.getDate()} ${monthNamesShort[sunday.getMonth()]} ${sunday.getFullYear()}`
            : `${monday.getDate()} ${monthNamesShort[monday.getMonth()]} – ${sunday.getDate()} ${monthNamesShort[sunday.getMonth()]} ${sunday.getFullYear()}`;

        daysEl.innerHTML = '';
        // Sin flex-1/h-full: las celdas ya no se estiran a lo alto de toda la tarjeta,
        // así la vista semanal queda compacta en vez de muy alargada.
        daysEl.className = 'grid grid-cols-7 gap-1.5 text-sm';
        const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const isSelected = this.isSameDay(d, this.selectedDate);
            const isToday = this.isSameDay(d, new Date());
            const dots = this.getDayDotColors(this.toDateString(d));

            const btn = document.createElement('button');
            btn.className = `w-full aspect-square flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${isSelected ? 'bg-brand-500 text-white font-bold shadow-md hover:bg-brand-600 dark:hover:bg-brand-600' : (isToday ? 'ring-2 ring-brand-400 text-slate-700 dark:text-slate-300' : 'text-slate-700 dark:text-slate-300')}`;
            btn.innerHTML = `
                <span class="text-[10px] uppercase opacity-70">${dayLabels[i]}</span>
                <span class="font-bold text-sm">${d.getDate()}</span>
                ${this.renderDots(dots, isSelected)}
            `;
            btn.onclick = () => {
                this.selectedDate = new Date(d);
                this.currentDate = new Date(d);
                this.renderCalendar();
                this.renderEvents();
            };
            daysEl.appendChild(btn);
        }
    },

    toDateString(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
            this.renderCalendar();
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
        const dateString = this.toDateString(this.selectedDate);
        
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
            const subjectBadge = ev.subjectName
                ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold mt-1 px-1.5 py-0.5 rounded-full" style="background-color:${ev.subjectColor || '#94a3b8'}22; color:${ev.subjectColor || '#64748b'}">
                       <span class="w-1.5 h-1.5 rounded-full" style="background-color:${ev.subjectColor || '#94a3b8'}"></span>${this.escapeHtml(ev.subjectName)}
                   </span>`
                : '';
            el.innerHTML = `
                <div>
                    <div class="font-bold text-slate-800 dark:text-slate-200">${this.escapeHtml(ev.title)}</div>
                    <div class="text-xs text-slate-500">${ev.time || 'Todo el día'}</div>
                    ${subjectBadge}
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
        
        const subjectOptions = [{ value: '', label: 'Sin asignatura (evento general)' }]
            .concat((Notebook.subjects || []).map(s => ({ value: s.id, label: s.name })));

        ModalManager.show({
            title: 'Nuevo Evento',
            inputs: [
                { label: 'Título del evento', placeholder: 'Ej. Examen de Historia' },
                { label: 'Hora (Opcional)', placeholder: 'Ej. 10:00', optional: true },
                { label: 'Asignatura (para deberes/exámenes)', type: 'select', options: subjectOptions, optional: true }
            ],
            confirmText: 'Añadir',
            onConfirm: async (values) => {
                const title = values[0];
                const time = values[1];
                const subjectId = values[2];
                const subject = subjectId ? Notebook.subjects.find(s => s.id === subjectId) : null;

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
                        subjectId: subject ? subject.id : null,
                        subjectName: subject ? subject.name : null,
                        subjectColor: subject ? subject.color : null,
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
    subjectColorPalette: ['#f64b31', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#dc2626'],

    nextSuggestedColor() {
        return this.subjectColorPalette[this.subjects.length % this.subjectColorPalette.length];
    },
    
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
            window.fb.where("uid", "==", AuthManager.currentUser.uid)
        );
        
        window.fb.onSnapshot(q, (snapshot) => {
            this.subjects = [];
            snapshot.forEach((doc) => {
                this.subjects.push({ id: doc.id, ...doc.data() });
            });
            this.subjects.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            this.renderSubjects();
        }, (error) => {
            console.error("Error cargando asignaturas:", error);
            app.toast("Error al cargar las asignaturas");
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
                <div class="font-bold truncate flex-1 flex items-center gap-2" onclick="window.Notebook.selectSubject('${sub.id}', '${this.escapeHtml(sub.name)}')">
                    <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color:${sub.color || '#94a3b8'}"></span>
                    <span class="truncate">${this.escapeHtml(sub.name)}</span>
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
            inputs: [
                { label: 'Nombre de la asignatura', placeholder: 'Ej. Matemáticas' },
                { label: 'Color de la asignatura (obligatorio)', type: 'color', value: this.nextSuggestedColor() }
            ],
            confirmText: 'Crear',
            onConfirm: async (values) => {
                const name = values[0];
                const color = values[1];
                try {
                    await window.fb.addDoc(window.fb.collection(window.fb.db, "notebook_subjects"), {
                        uid: AuthManager.currentUser.uid,
                        name: name,
                        color: color,
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
            window.fb.where("subjectId", "==", this.currentSubjectId)
        );
        
        window.fb.onSnapshot(q, (snapshot) => {
            this.topics = [];
            snapshot.forEach((doc) => {
                this.topics.push({ id: doc.id, ...doc.data() });
            });
            this.topics.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            this.renderTopics();
        }, (error) => {
            console.error("Error cargando temas:", error);
            app.toast("Error al cargar los temas");
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
window.SpellChecker = SpellChecker;
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// -- FONT SELECTOR LOGIC --
document.addEventListener('DOMContentLoaded', () => {
    let savedSelection = null;

    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const node = sel.anchorNode;
            if (node) {
                const nbEditor = document.getElementById('nb-editor');
                if (nbEditor && nbEditor.contains(node)) {
                    savedSelection = sel.getRangeAt(0);
                } else if (node.nodeType === 1 && node.closest('.mindmap-node')) {
                    savedSelection = sel.getRangeAt(0);
                } else if (node.parentElement && node.parentElement.closest('.mindmap-node')) {
                    savedSelection = sel.getRangeAt(0);
                }
            }
        }
    });

    const applyFont = (selectEl, editorEl) => {
        const font = selectEl.value;
        if (font && savedSelection) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedSelection);
            document.execCommand('fontName', false, font);
            selectEl.selectedIndex = 0;
            if (editorEl) editorEl.focus();
        }
    };

    const nbSelect = document.getElementById('nb-font-select');
    if (nbSelect) {
        nbSelect.addEventListener('change', () => applyFont(nbSelect, document.getElementById('nb-editor')));
    }

    // mmSelect font logic for MindMap is handled within MindMap.init()
});
