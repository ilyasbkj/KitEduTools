const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Language selector
html = html.replace('<div class="flex items-center gap-2">', 
`<div class="flex items-center gap-2">
                    <select id="lang-select" class="text-xs text-slate-500 bg-transparent outline-none font-medium p-1 cursor-pointer hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <option value="es">ES</option>
                        <option value="en">EN</option>
                        <option value="ca">CA</option>
                    </select>`);

// 2. Button Conectar
html = html.replace('<span class="hidden xs:inline">Conectar</span>', '<span class="hidden xs:inline" data-i18n="btn_connect">Conectar</span>');

// 3. Sidebar Volver al inicio
html = html.replace('<i class="fa-solid fa-arrow-left mr-2"></i> Volver al Inicio', '<i class="fa-solid fa-arrow-left mr-2"></i> <span data-i18n="nav_back_home">Volver al Inicio</span>');

// 4. Sidebar Herramientas
html = html.replace('>Herramientas</p>', ' data-i18n="nav_tools">Herramientas</p>');

// 5. Sidebar items
const sidebars = {
    'Calculadora': 'nav_calculator',
    'Conversor': 'nav_converter',
    'Editor HTML': 'nav_editor',
    'Editor Markdown': 'nav_markdown',
    'Pomodoro': 'nav_pomodoro',
    'Analizador Texto': 'nav_textanalyzer',
    'Ortografía': 'nav_spellchecker',
    'Agenda Personal': 'nav_agenda',
    'Libreta Apuntes': 'nav_notebook',
    'Mapas Mentales': 'nav_mindmap'
};
for (const [text, key] of Object.entries(sidebars)) {
    // We target the exact text inside the button, after the icon `</i> Text`
    const regex = new RegExp(`</i> ${text}(\\s*)</button>`, 'g');
    html = html.replace(regex, `</i> <span data-i18n="${key}">${text}</span>$1</button>`);
}

// 6. Con Cuenta
html = html.replace('> Con Cuenta</p>', '> <span data-i18n="nav_with_account">Con Cuenta</span></p>');

// 7. Home texts
html = html.replace('✨ Herramientas gratuitas para estudiantes', '<span data-i18n="home_badge">✨ Herramientas gratuitas para estudiantes</span>');
html = html.replace('Tu caja de herramientas<br/>', '<span data-i18n="home_title_1">Tu caja de herramientas</span><br/>');
html = html.replace('<span class="text-brand-500">académicas</span> en un solo lugar', '<span class="text-brand-500" data-i18n="home_title_2">académicas</span> <span data-i18n="home_title_3">en un solo lugar</span>');
html = html.replace('Calculadoras, conversores, editores, mapas mentales y más. Todo en tu navegador.', '<span data-i18n="home_subtitle">Calculadoras, conversores, editores, mapas mentales y más. Todo en tu navegador.</span>');

// 8. Search
html = html.replace('placeholder="Busca una herramienta: calculadora, conversor..."', 'data-i18n-placeholder="home_search" placeholder="Busca una herramienta: calculadora, conversor..."');

// 9. Categories
html = html.replace('>Todas</button>', ' data-i18n="cat_all">Todas</button>');
html = html.replace('>Matemáticas</button>', ' data-i18n="cat_math">Matemáticas</button>');
html = html.replace('>Desarrollo</button>', ' data-i18n="cat_dev">Desarrollo</button>');
html = html.replace('>Estudio</button>', ' data-i18n="cat_study">Estudio</button>');

fs.writeFileSync('index.html', html);
console.log("HTML Patched");
