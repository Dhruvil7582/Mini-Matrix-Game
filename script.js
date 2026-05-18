 // ── Card data ──────────────────────────────────────────────────────────────
    const CARDS = [
        { id: 'cpp',        label: 'C++',        src: './images/c++.png',        alt: 'C++' },
        { id: 'css',        label: 'CSS',         src: './images/css.png',        alt: 'CSS' },
        { id: 'html',       label: 'HTML5',       src: './images/html.png',       alt: 'HTML5' },
        { id: 'java',       label: 'Java',        src: './images/java.jpg',       alt: 'Java' },
        { id: 'javascript', label: 'JavaScript',  src: './images/javascript.png', alt: 'JavaScript' },
        { id: 'kotlin',     label: 'Kotlin',      src: './images/kotlin.jpg',     alt: 'Kotlin' },
        { id: 'php',        label: 'PHP',         src: './images/php.png',        alt: 'PHP' },
        { id: 'python',     label: 'Python',      src: './images/python.jpg',     alt: 'Python' },
    ];

    // ── State ──────────────────────────────────────────────────────────────────
    let firstCard = null, secondCard = null;
    let lock = false, isFlipped = false;
    let moves = 0, matched = 0, started = false;
    let timerInterval = null, seconds = 0;
    let hintActive = false;

    // ── Build board ────────────────────────────────────────────────────────────
    function buildBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';

        const deck = [...CARDS, ...CARDS];
        shuffle(deck);

        deck.forEach(card => {
            const el = document.createElement('div');
            el.className = 'card';
            el.dataset.image = card.id;
            el.innerHTML = `
                <div class="frontSide">
                    <img src="${card.src}" alt="${card.alt}">
                </div>
                <div class="backSide">
                    <img src="./images/back.jpg" alt="back">
                </div>
            `;
            el.addEventListener('click', flip);
            board.appendChild(el);
        });
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    // ── Flip logic ─────────────────────────────────────────────────────────────
    function flip() {
        if (lock || this === firstCard || this.classList.contains('matched')) return;

        if (!started) startTimer();

        this.classList.add('flip');

        if (!isFlipped) {
            isFlipped = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        moves++;
        updateMoves();
        check();
    }

    function check() {
        if (firstCard.dataset.image === secondCard.dataset.image) {
            success();
        } else {
            failed();
        }
    }

    function success() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.removeEventListener('click', flip);
        secondCard.removeEventListener('click', flip);

        spawnParticles(firstCard);
        spawnParticles(secondCard);

        matched++;
        document.getElementById('matches-val').textContent = `${matched}/8`;

        reset();

        if (matched === 8) {
            setTimeout(showWin, 600);
        }
    }

    function failed() {
        lock = true;
        firstCard.classList.add('wrong');
        secondCard.classList.add('wrong');

        setTimeout(() => {
            firstCard.classList.remove('flip', 'wrong');
            secondCard.classList.remove('flip', 'wrong');
            reset();
        }, 900);
    }

    function reset() {
        [isFlipped, lock] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // ── Stats ──────────────────────────────────────────────────────────────────
    function updateMoves() {
        const el = document.getElementById('moves-val');
        el.textContent = moves;
        el.classList.remove('moves-anim');
        void el.offsetWidth;
        el.classList.add('moves-anim');
    }

    function startTimer() {
        started = true;
        seconds = 0;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            seconds++;
            const m = Math.floor(seconds / 60);
            const s = String(seconds % 60).padStart(2, '0');
            document.getElementById('timer-val').textContent = `${m}:${s}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    // ── Win screen ─────────────────────────────────────────────────────────────
    function showWin() {
        stopTimer();
        document.getElementById('win-moves').textContent = moves;
        document.getElementById('win-time').textContent = formatTime(seconds);
        document.getElementById('winOverlay').classList.add('show');
        launchConfetti();
    }

    // ── Restart ────────────────────────────────────────────────────────────────
    function restartGame() {
        stopTimer();
        document.getElementById('winOverlay').classList.remove('show');
        firstCard = secondCard = null;
        lock = false; isFlipped = false;
        moves = 0; matched = 0; started = false; seconds = 0;
        document.getElementById('moves-val').textContent = '0';
        document.getElementById('timer-val').textContent = '0:00';
        document.getElementById('matches-val').textContent = '0/8';
        buildBoard();
    }

    // ── Hint ───────────────────────────────────────────────────────────────────
    function toggleHint() {
        if (hintActive) return;
        hintActive = true;
        const unmatched = [...document.querySelectorAll('.card:not(.matched):not(.flip)')];
        unmatched.forEach(c => c.classList.add('flip'));
        setTimeout(() => {
            unmatched.forEach(c => c.classList.remove('flip'));
            hintActive = false;
        }, 800);
    }

    // ── Particles on match ─────────────────────────────────────────────────────
    function spawnParticles(card) {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const colors = ['#00f5ff', '#bf00ff', '#ffd700', '#ff006e', '#00ff88'];

        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const angle = (i / 12) * 360;
            const dist = 40 + Math.random() * 60;
            const dx = Math.cos(angle * Math.PI / 180) * dist;
            const dy = Math.sin(angle * Math.PI / 180) * dist;
            p.style.cssText = `
                left:${cx - 3}px; top:${cy - 3}px;
                background:${colors[Math.floor(Math.random() * colors.length)]};
                --dx:${dx}px; --dy:${dy}px;
                box-shadow: 0 0 6px currentColor;
            `;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 1000);
        }
    }

    // ── Confetti ───────────────────────────────────────────────────────────────
    function launchConfetti() {
        const colors = ['#00f5ff','#bf00ff','#ffd700','#ff006e','#00ff88','#ffffff'];
        for (let i = 0; i < 60; i++) {
            const c = document.createElement('div');
            c.className = 'confetti-piece';
            c.style.cssText = `
                left:${Math.random() * 100}vw;
                top:-10px;
                background:${colors[Math.floor(Math.random() * colors.length)]};
                border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
                width:${4 + Math.random() * 8}px;
                height:${4 + Math.random() * 8}px;
                animation-duration:${1.5 + Math.random() * 2}s;
                animation-delay:${Math.random() * 1}s;
            `;
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 4000);
        }
    }

    // ── Init ───────────────────────────────────────────────────────────────────
    buildBoard();