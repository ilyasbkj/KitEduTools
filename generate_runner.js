const fs = require('fs');

const appJs = fs.readFileSync('app.js', 'utf8');
const i18nJs = fs.readFileSync('js/modules/i18n.js', 'utf8');

global.window = {
    addEventListener: () => {},
    location: { hash: '' },
    fb: {}
};
global.document = {
    addEventListener: () => {},
    getElementById: (id) => {
        return {
            addEventListener: () => {},
            classList: { toggle: () => {}, add: () => {}, remove: () => {} },
            innerHTML: '',
            value: '',
            contains: () => false
        };
    },
    querySelectorAll: () => [],
    createElement: () => {
        return {
            classList: { toggle: () => {}, add: () => {}, remove: () => {} },
            style: {}
        };
    },
    documentElement: {}
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.navigator = { language: 'es-ES' };
global.CustomEvent = class {};

let combined = i18nJs.replace('export const I18n', 'const I18n') + '\n\n';
let cleanApp = appJs.split('\n').filter(l => !l.startsWith('import ')).join('\n');

combined += `
const Calculator = { init: () => {} };
const Converter = { init: () => {} };
const HtmlEditor = { init: () => {} };
const MindMap = { init: () => {} };
const Pomodoro = { init: () => {} };
const TextAnalyzer = { init: () => {} };
const SpellChecker = { init: () => {} };
const MarkdownEditor = { init: () => {} };
const PythonIde = { init: () => {} };
const Guides = { init: () => {} };
`;

// Important: write files safely without template literal interpolation that evaluates escapes
fs.writeFileSync('test_runner.js', combined);
fs.appendFileSync('test_runner.js', cleanApp);
fs.appendFileSync('test_runner.js', `\ntry {
    app.init();
    console.log("App initialized successfully in mock");
} catch(e) {
    console.error("Error during init:", e.stack);
}\n`);

console.log("Runner generated. Executing it...");
require('child_process').execSync('node test_runner.js', {stdio: 'inherit'});
