export const Flashcards = {
    cards: [],
    currentIndex: 0,
    isFlipped: false,

    init() {
        this.loadCards();
        this.cacheDOM();
        this.bindEvents();
        this.renderList();
        this.renderStudyCard();
    },

    cacheDOM() {
        this.frontInput = document.getElementById('flash-front-input');
        this.backInput = document.getElementById('flash-back-input');
        this.btnAdd = document.getElementById('flash-btn-add');
        this.btnClear = document.getElementById('flash-btn-clear');
        this.counterEl = document.getElementById('flash-counter');

        this.studyCard = document.getElementById('flash-study-card');
        this.studyCardInner = document.getElementById('flash-study-inner');
        this.studyFront = document.getElementById('flash-study-front');
        this.studyBack = document.getElementById('flash-study-back');

        this.btnPrev = document.getElementById('flash-btn-prev');
        this.btnNext = document.getElementById('flash-btn-next');
        this.btnShuffle = document.getElementById('flash-btn-shuffle');
        this.studyCounter = document.getElementById('flash-study-counter');
    },

    bindEvents() {
        if (!this.btnAdd) return;
        this.btnAdd.addEventListener('click', () => this.addCard());
        this.btnClear.addEventListener('click', () => this.clearCards());
        
        this.studyCard.addEventListener('click', () => this.flipCard());
        this.btnPrev.addEventListener('click', () => this.prevCard());
        this.btnNext.addEventListener('click', () => this.nextCard());
        this.btnShuffle.addEventListener('click', () => this.shuffleCards());
    },

    loadCards() {
        const data = localStorage.getItem('kitedutools-flashcards');
        if (data) {
            try {
                this.cards = JSON.parse(data);
            } catch (e) {
                this.cards = [];
            }
        }
    },

    saveCards() {
        localStorage.setItem('kitedutools-flashcards', JSON.stringify(this.cards));
    },

    addCard() {
        const front = this.frontInput.value.trim();
        const back = this.backInput.value.trim();

        if (!front || !back) {
            if (window.ModalManager) {
                window.ModalManager.show({ title: 'Error', body: 'Debes rellenar tanto el anverso como el reverso de la ficha.'});
            } else {
                alert('Debes rellenar anverso y reverso.');
            }
            return;
        }

        this.cards.push({ front, back, id: Date.now() });
        this.saveCards();
        this.frontInput.value = '';
        this.backInput.value = '';
        
        if (this.cards.length === 1) {
            this.currentIndex = 0;
        }

        this.renderList();
        this.renderStudyCard();
    },

    clearCards() {
        if (this.cards.length === 0) return;
        
        const confirmClear = confirm('¿Estás seguro de que quieres borrar todas las fichas?');
        if (confirmClear) {
            this.cards = [];
            this.currentIndex = 0;
            this.isFlipped = false;
            this.saveCards();
            this.renderList();
            this.renderStudyCard();
        }
    },

    flipCard() {
        if (this.cards.length === 0) return;
        this.isFlipped = !this.isFlipped;
        if (this.isFlipped) {
            this.studyCardInner.classList.add('rotate-y-180');
        } else {
            this.studyCardInner.classList.remove('rotate-y-180');
        }
    },

    prevCard() {
        if (this.cards.length <= 1) return;
        this.isFlipped = false;
        this.studyCardInner.classList.remove('rotate-y-180');
        
        setTimeout(() => {
            this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
            this.renderStudyCard();
        }, 150);
    },

    nextCard() {
        if (this.cards.length <= 1) return;
        this.isFlipped = false;
        this.studyCardInner.classList.remove('rotate-y-180');
        
        setTimeout(() => {
            this.currentIndex = (this.currentIndex + 1) % this.cards.length;
            this.renderStudyCard();
        }, 150);
    },

    shuffleCards() {
        if (this.cards.length <= 1) return;
        
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        
        this.currentIndex = 0;
        this.isFlipped = false;
        this.studyCardInner.classList.remove('rotate-y-180');
        this.saveCards();
        this.renderStudyCard();
    },

    renderList() {
        if (!this.counterEl) return;
        this.counterEl.textContent = `${this.cards.length} ficha${this.cards.length !== 1 ? 's' : ''} creada${this.cards.length !== 1 ? 's' : ''}`;
    },

    renderStudyCard() {
        if (!this.studyFront || !this.studyBack) return;

        if (this.cards.length === 0) {
            this.studyFront.innerHTML = '<div class="text-slate-400 text-center flex flex-col items-center"><i class="fa-solid fa-layer-group text-4xl mb-4 opacity-30"></i><p>No hay fichas en el mazo.<br>¡Crea la primera para empezar a estudiar!</p></div>';
            this.studyBack.innerHTML = '';
            this.studyCounter.textContent = '0 / 0';
            this.isFlipped = false;
            this.studyCardInner.classList.remove('rotate-y-180');
            return;
        }

        const card = this.cards[this.currentIndex];
        this.studyFront.innerHTML = `<div class="text-xl md:text-3xl font-medium text-center break-words w-full px-4">${this.escapeHtml(card.front).replace(/\n/g, '<br>')}</div>`;
        this.studyBack.innerHTML = `<div class="text-xl md:text-3xl font-medium text-center break-words w-full px-4 text-brand-600 dark:text-brand-400">${this.escapeHtml(card.back).replace(/\n/g, '<br>')}</div>`;
        
        this.studyCounter.textContent = `${this.currentIndex + 1} / ${this.cards.length}`;
    },

    escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
};

window.Flashcards = Flashcards;
