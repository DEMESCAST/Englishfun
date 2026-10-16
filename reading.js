// reading.js - Historinhas: livro "The Lion and the Mouse" (virada de página)
// Copyright (c) 2026 DEMESCAST. Todos os direitos reservados.

// Cada pagina do livro: 1 ilustracao + trechos em ingles (en) e portugues (pt).
const READING_PAGES = [
    {
        img: 'assets/reading/page-1.png?v=20261016-3',
        alt: 'Ilustra\u00E7\u00E3o da hist\u00F3ria: o le\u00E3o dormindo na floresta e o ratinho por perto',
        lines: [
            { en: 'One day, a lion was sleeping in the forest.',
              pt: 'Um dia, um le\u00E3o estava dormindo na floresta.' },
            { en: 'A little mouse ran over his paw.',
              pt: 'Um ratinho passou correndo sobre sua pata.' },
            { en: 'The lion woke up and caught the mouse.',
              pt: 'O le\u00E3o acordou e capturou o ratinho.' },
            { en: '\u201CPlease let me go,\u201D said the mouse. \u201CI may help you one day.\u201D',
              pt: '\u201CPor favor, deixe-me ir\u201D, disse o ratinho. \u201CTalvez eu possa ajudar voc\u00EA um dia.\u201D' }
        ]
    },
    {
        img: 'assets/reading/page-2.png?v=20261016-3',
        alt: 'Ilustra\u00E7\u00E3o da hist\u00F3ria: o le\u00E3o preso na rede pedindo ajuda',
        lines: [
            { en: 'The lion laughed, but let the mouse go.',
              pt: 'O le\u00E3o riu, mas soltou o ratinho.' },
            { en: 'A few days later, the lion got caught in a net.',
              pt: 'Alguns dias depois, o le\u00E3o ficou preso em uma rede.' },
            { en: 'He roared for help.',
              pt: 'Ele rugiu pedindo ajuda.' }
        ]
    },
    {
        img: 'assets/reading/page-3.png?v=20261016-3',
        alt: 'Ilustra\u00E7\u00E3o da hist\u00F3ria: o ratinho roendo as cordas para libertar o le\u00E3o',
        lines: [
            { en: 'The mouse heard him and chewed the ropes with her little teeth.',
              pt: 'O ratinho o ouviu e roeu as cordas com seus dentinhos.' },
            { en: 'The lion was free.',
              pt: 'O le\u00E3o ficou livre.' },
            { en: '\u201CThank you, little friend!\u201D said the lion.',
              pt: '\u201CObrigado, pequeno amigo!\u201D, disse o le\u00E3o.' }
        ],
        moral: {
            en: '\u201CKindness can come from anyone.\u201D',
            pt: '\u201CA bondade pode vir de qualquer pessoa.\u201D'
        }
    }
];

let bookIndex = 0;
let bookBusy = false;
let bookTouchX = null;

function bookRenderPage() {
    const book = document.getElementById('book');
    if (!book) return;
    const total = READING_PAGES.length;
    const pg = READING_PAGES[bookIndex];

    let linesHtml = '';
    pg.lines.forEach(l => {
        linesHtml += '<div class="book-line">' +
            '<p class="book-en">' + l.en + '</p>' +
            '<p class="book-pt">' + l.pt + '</p>' +
            '</div>';
    });
    if (pg.moral) {
        linesHtml += '<div class="book-moral">' +
            '<span class="book-moral-label">Moral</span>' +
            '<p class="book-moral-en">' + pg.moral.en + '</p>' +
            '<p class="book-moral-pt">' + pg.moral.pt + '</p>' +
            '</div>';
    }

    book.innerHTML =
        '<div class="book-page">' +
            '<div class="book-illus"><img src="' + pg.img + '" alt="' + pg.alt + '"></div>' +
            '<div class="book-text">' + linesHtml + '</div>' +
            '<div class="book-pagenum">' + (bookIndex + 1) + ' / ' + total + '</div>' +
        '</div>';

    const ind = document.getElementById('book-indicator');
    if (ind) ind.textContent = 'P\u00E1gina ' + (bookIndex + 1) + ' de ' + total;
    const prev = document.getElementById('book-prev');
    const next = document.getElementById('book-next');
    if (prev) prev.disabled = bookIndex === 0;
    if (next) next.disabled = bookIndex === total - 1;
}

function bookGo(dir) {
    const total = READING_PAGES.length;
    const target = bookIndex + dir;
    if (bookBusy || target < 0 || target >= total) return;
    bookBusy = true;
    playSound('click');
    const book = document.getElementById('book');
    book.classList.remove('turn-next', 'turn-prev');
    void book.offsetWidth;
    book.classList.add(dir > 0 ? 'turn-next' : 'turn-prev');

    // troca o conteudo no meio da animacao (pagina "virando")
    setTimeout(() => {
        bookIndex = target;
        bookRenderPage();
    }, 220);

    book.addEventListener('animationend', function done() {
        book.removeEventListener('animationend', done);
        book.classList.remove('turn-next', 'turn-prev');
        bookBusy = false;
    });
}

function bookNext() { bookGo(1); }
function bookPrev() { bookGo(-1); }

function bookKeydown(e) {
    const scr = document.getElementById('reading-screen');
    if (!scr || getComputedStyle(scr).display === 'none') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); bookNext(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); bookPrev(); }
}

function bookTouchStart(e) {
    if (e.changedTouches && e.changedTouches.length) bookTouchX = e.changedTouches[0].clientX;
}
function bookTouchEnd(e) {
    if (bookTouchX === null || !e.changedTouches || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - bookTouchX;
    bookTouchX = null;
    if (Math.abs(dx) < 45) return;
    if (dx < 0) bookNext(); else bookPrev();
}

// Abre a tela "Historinhas" (a partir do menu principal)
function openReading() {
    playSound('click');
    initAudio();
    if (activeTrack) fadeOutTrack(activeTrack);
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('reading-screen').style.display = 'block';
    window.scrollTo(0, 0);
    const back = document.getElementById('reading-screen').querySelector('.back-mode-btn');
    if (back) back.focus();
}

// Volta para o menu principal
function closeReading() {
    playSound('click');
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    document.getElementById('reading-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    resumeMenuMusic();
    const btn = document.querySelector('.mode-stories');
    if (btn) btn.focus();
}

function readingInit() {
    const book = document.getElementById('book');
    if (!book) return;
    bookIndex = 0;
    bookRenderPage();

    const prev = document.getElementById('book-prev');
    const next = document.getElementById('book-next');
    if (prev) prev.addEventListener('click', bookPrev);
    if (next) next.addEventListener('click', bookNext);

    document.addEventListener('keydown', bookKeydown);
    book.addEventListener('touchstart', bookTouchStart, { passive: true });
    book.addEventListener('touchend', bookTouchEnd, { passive: true });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', readingInit);
} else {
    readingInit();
}
