const fs = require('fs');

let js = fs.readFileSync('app.js', 'utf8');

const targetInit = `    init() {
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
        MarkdownEditor.init();
        PythonIde.init();
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
        const validStart = startView && document.getElementById(\`view-\${startView}\`) ? startView : 'home';
        this.navigate(validStart, { replace: true });
    },`;

// We find `init() {` and replace everything until `initRouting() {`
const startIdx = js.indexOf('    init() {');
const endIdx = js.indexOf('    initRouting() {');
if (startIdx !== -1 && endIdx !== -1) {
    js = js.substring(0, startIdx) + targetInit + '\n\n' + js.substring(endIdx);
    fs.writeFileSync('app.js', js);
    console.log("Fixed init");
} else {
    console.log("Could not find blocks");
}
