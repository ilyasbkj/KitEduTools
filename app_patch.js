const fs = require('fs');

let js = fs.readFileSync('app.js', 'utf8');

// Add import
if (!js.includes("import { I18n }")) {
    js = js.replace("import { Calculator } from './js/modules/calculator.js';", "import { Calculator } from './js/modules/calculator.js';\nimport { I18n } from './js/modules/i18n.js';");
}

// Add to init
if (!js.includes("I18n.init()")) {
    js = js.replace("Calculator.init();", "I18n.init();\n        Calculator.init();");
}

// Map the tools array to use keys
// I will just replace the whole tools array block
const toolsArrayStart = js.indexOf('tools: [');
const toolsArrayEnd = js.indexOf('],', toolsArrayStart) + 2;

const newToolsArray = `tools: [
        { id: 'calculator', nameKey: 'nav_calculator', catKey: 'cat_math', icon: 'fa-calculator', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_calc_desc' },
        { id: 'converter', nameKey: 'nav_converter', catKey: 'cat_math', icon: 'fa-scale-balanced', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_conv_desc' },
        { id: 'editor', nameKey: 'nav_editor', catKey: 'cat_dev', icon: 'fa-code', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_edit_desc' },
        { id: 'pomodoro', nameKey: 'nav_pomodoro', catKey: 'cat_study', icon: 'fa-stopwatch', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_pomo_desc' },
        { id: 'textanalyzer', nameKey: 'nav_textanalyzer', catKey: 'cat_study', icon: 'fa-chart-simple', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_text_desc' },
        { id: 'spellchecker', nameKey: 'nav_spellchecker', catKey: 'cat_study', icon: 'fa-spell-check', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_spell_desc' },
        { id: 'markdown', nameKey: 'nav_markdown', catKey: 'cat_dev', icon: 'fa-file-pen', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', descKey: 'tool_mark_desc' },
        { id: 'agenda', nameKey: 'nav_agenda', catKey: 'cat_study', icon: 'fa-calendar-days', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', descKey: 'tool_agen_desc', badgeKey: 'badge_account' },
        { id: 'notebook', nameKey: 'nav_notebook', catKey: 'cat_study', icon: 'fa-book-journal-whills', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', descKey: 'tool_note_desc', badgeKey: 'badge_account' },
        { id: 'mindmap', nameKey: 'nav_mindmap', catKey: 'cat_study', icon: 'fa-diagram-project', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', descKey: 'tool_mind_desc', badgeKey: 'badge_account' },
    ],`;

js = js.substring(0, toolsArrayStart) + newToolsArray + js.substring(toolsArrayEnd);

// Modify renderHomeCards
const renderFunctionStart = js.indexOf('renderHomeCards(searchFilter = \'\') {');
const renderFunctionEnd = js.indexOf('},', renderFunctionStart) + 2;

const newRenderFunction = `renderHomeCards(searchFilter = '') {
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

        // SORT BY CATEGORY THEN BY NAME
        filteredTools.sort((a, b) => {
            if (a.cat < b.cat) return -1;
            if (a.cat > b.cat) return 1;
            return a.name.localeCompare(b.name);
        });

        if (filteredTools.length === 0) {
            grid.innerHTML = \`<p class="col-span-full text-center text-slate-500 py-10" data-i18n="no_tools_found">\${I18n.get('no_tools_found')}</p>\`;
            return;
        }

        filteredTools.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-[#1a2233] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-800/80 transform hover:-translate-y-1 group';
            card.onclick = () => { this.navigate(tool.id); };
            
            const badgeHtml = tool.badge
                ? \`<span class="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1"><i class="fa-solid fa-cloud text-[9px]"></i>\${tool.badge}</span>\`
                : \`<span class="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">\${tool.cat}</span>\`;
            
            card.innerHTML = \`
                <div class="flex items-start justify-between mb-4">
                    <div class="w-14 h-14 rounded-2xl \${tool.bg} \${tool.color} flex items-center justify-center text-2xl transition-transform group-hover:scale-110">
                        <i class="fa-solid \${tool.icon}"></i>
                    </div>
                    \${badgeHtml}
                </div>
                <h3 class="text-xl font-bold mb-2">\${tool.name}</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">\${tool.desc}</p>
            \`;
            grid.appendChild(card);
        });
    },`;

js = js.substring(0, renderFunctionStart) + newRenderFunction + js.substring(renderFunctionEnd);

// Add languageChanged event listener in init()
if (!js.includes("'languageChanged'")) {
    js = js.replace("this.initRouting();", "this.initRouting();\n        document.addEventListener('languageChanged', () => {\n            this.renderHomeCards(document.getElementById('global-search').value);\n        });");
}

// In initFilters, currentCategory needs to be updated. It checks e.target.getAttribute('data-cat');
// We need to change 'Matemáticas' to 'cat_math' etc in index.html to match keys, or just keep them and compare with translations.
// Since we changed data-cat to be the same, wait, data-cat in index.html was 'all', 'Matemáticas', 'Desarrollo', 'Estudio'.
// Let's modify index.html to use the keys for data-cat instead.

fs.writeFileSync('app.js', js);
console.log("App Patched");

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('data-cat="Matemáticas"', 'data-cat="cat_math"');
html = html.replace('data-cat="Desarrollo"', 'data-cat="cat_dev"');
html = html.replace('data-cat="Estudio"', 'data-cat="cat_study"');
fs.writeFileSync('index.html', html);
console.log("HTML Patched for categories");
