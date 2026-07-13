export const Calculator = {
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
                throw new Error("Librería math.js no cargada.");
            }
        } catch(e) {
            console.error('Calc Error:', e);
            display.value = 'Error';
            setTimeout(() => { display.value = this.displayInput; }, 1000);
        }
    }
};
