// reading.js - Historinhas: livros com virada de página (inglês + português)
// Copyright (c) 2026 DEMESCAST. Todos os direitos reservados.

// Cada historia tem paginas; cada pagina tem 1 ilustracao + trechos (en/pt).
// A ultima pagina traz a moral.
const READING_STORIES = [
    {
        id: 'lion',
        emoji: '\uD83E\uDD81',
        title: 'The Lion and the Mouse',
        pages: [
            {
                img: 'assets/reading/page-1.png?v=20261016-3',
                alt: 'Ilustra\u00E7\u00E3o da hist\u00F3ria: o le\u00E3o dormindo na floresta e o ratinho por perto',
                lines: [
                    { en: 'One day, a lion was sleeping in the forest.',
                      pt: 'Um dia, um le\u00E3o estava dormindo na floresta.' },
                    { en: 'A little mouse ran over his paw.',
                      pt: 'Um ratinho correu sobre a pata dele.' },
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
                    { en: 'The mouse heard him and chewed the ropes with his little teeth.',
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
        ]
    },
    {
        id: 'tortoise',
        emoji: '\uD83D\uDC22',
        title: 'The Tortoise and the Hare',
        pages: [
            {
                img: 'assets/reading/tortoise-1.png',
                alt: 'Ilustra\u00E7\u00E3o da hist\u00F3ria: a lebre e a tartaruga na trilha da floresta combinando uma corrida',
                lines: [
                    { en: 'One sunny morning, Hare saw Tortoise on the forest path.',
                      pt: 'Numa manh\u00E3 ensolarada, a Lebre viu a Tartaruga na trilha da floresta.' },
                    { en: '\u201CLet\u2019s have a race!\u201D said Hare.',
                      pt: '\u201CVamos apostar uma corrida!\u201D, disse a Lebre.' },
                    { en: '\u201CLet\u2019s go!\u201D said Tortoise.',
                      pt: '\u201CVamos!\u201D, disse a Tartaruga.' },
                    { en: 'They chose the big oak tree as the finish line.',
                      pt: 'Eles escolheram o grande carvalho como linha de chegada.' }
                ]
            },
            {
                img: 'assets/reading/tortoise-2.png',
                alt: 'Ilustra\u00E7\u00E3o da hist\u00F3ria: a lebre correndo na frente e a tartaruga andando devagar',
                lines: [
                    { en: 'Hare ran very fast and soon was far ahead.',
                      pt: 'A Lebre correu muito r\u00E1pido e logo ficou bem \u00E0 frente.' },
                    { en: '\u201CI have plenty of time,\u201D he said.',
                      pt: '\u201CTenho bastante tempo\u201D, ele disse.' },
                    { en: 'He lay down under an oak tree and fell asleep.',
                      pt: 'Ele se deitou debaixo de um carvalho e adormeceu.' },
                    { en: 'Tortoise kept walking, one step at a time.',
                      pt: 'A Tartaruga continuou andando, um passo de cada vez.' }
                ]
            },
            {
                img: 'assets/reading/tortoise-3.png',
                alt: 'Ilustra\u00E7\u00E3o da hist\u00F3ria: a tartaruga chegando vencedora e a lebre surpresa',
                lines: [
                    { en: 'When Hare woke up, he ran to the finish.',
                      pt: 'Quando a Lebre acordou, correu at\u00E9 a chegada.' },
                    { en: 'But Tortoise was already there!',
                      pt: 'Mas a Tartaruga j\u00E1 estava l\u00E1!' },
                    { en: 'Tortoise won the race.',
                      pt: 'A Tartaruga ganhou a corrida.' },
                    { en: '\u201CI kept going,\u201D said Tortoise.',
                      pt: '\u201CEu continuei indo\u201D, disse a Tartaruga.' },
                    { en: 'Hare smiled. \u201CWell done, my friend!\u201D',
                      pt: 'A Lebre sorriu. \u201CMuito bem, meu amigo!\u201D' }
                ],
                moral: {
                    en: 'Keep going, and you can reach your goal.',
                    pt: 'Continue em frente, e voc\u00EA alcan\u00E7ar\u00E1 seu objetivo.'
                }
            }
        ]
    }
];

let currentStory = null;
let bookIndex = 0;
let bookBusy = false;
let bookTouchX = null;

function readingGetStory(id) {
    return READING_STORIES.find(s => s.id === id) || null;
}

function readingRenderLibrary() {
    const list = document.getElementById('reading-story-list');
    if (!list) return;
    list.innerHTML = '';
    READING_STORIES.forEach(s => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'reading-story-card';
        b.setAttribute('aria-label', 'Ler a hist\u00F3ria ' + s.title);
        b.innerHTML = '<span class="reading-story-emoji" aria-hidden="true">' + s.emoji + '</span>' +
            '<span class="reading-story-name">' + s.title + '</span>' +
            '<span class="reading-story-arrow" aria-hidden="true">\u203A</span>';
        b.addEventListener('click', () => readingOpenStory(s.id));
        list.appendChild(b);
    });
}

// Mostra a lista de historinhas
function readingShowLibrary() {
    currentStory = null;
    const lib = document.getElementById('reading-library');
    const view = document.getElementById('reading-book-view');
    if (lib) lib.style.display = 'block';
    if (view) view.style.display = 'none';
    const title = document.getElementById('reading-title');
    if (title) title.textContent = '\uD83D\uDCD6 Historinhas';
    const back = document.getElementById('reading-back');
    if (back) { back.textContent = '\u2190 Voltar'; back.setAttribute('aria-label', 'Voltar ao menu principal'); }
}

// Abre uma historinha especifica
function readingOpenStory(id) {
    const story = readingGetStory(id);
    if (!story) return;
    playSound('click');
    currentStory = story;
    bookIndex = 0;
    bookBusy = false;
    const lib = document.getElementById('reading-library');
    const view = document.getElementById('reading-book-view');
    if (lib) lib.style.display = 'none';
    if (view) view.style.display = 'block';
    const title = document.getElementById('reading-title');
    if (title) title.textContent = '\uD83D\uDCD6 ' + story.title;
    const back = document.getElementById('reading-back');
    if (back) { back.textContent = '\u2190 Historinhas'; back.setAttribute('aria-label', 'Voltar \u00E0s historinhas'); }
    bookRenderPage();
    window.scrollTo(0, 0);
}

// Botao "Voltar" do topo: do livro volta pra lista; da lista volta pro menu
function readingBack() {
    playSound('click');
    const view = document.getElementById('reading-book-view');
    if (view && view.style.display !== 'none' && currentStory) {
        readingShowLibrary();
        window.scrollTo(0, 0);
    } else {
        closeReading();
    }
}

function bookRenderPage() {
    const book = document.getElementById('book');
    if (!book || !currentStory) return;
    const total = currentStory.pages.length;
    const pg = currentStory.pages[bookIndex];

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
    if (!currentStory) return;
    const total = currentStory.pages.length;
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
    const view = document.getElementById('reading-book-view');
    if (!scr || getComputedStyle(scr).display === 'none') return;
    if (!view || view.style.display === 'none' || !currentStory) return;
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
    readingShowLibrary();
    window.scrollTo(0, 0);
    const back = document.getElementById('reading-back');
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
    const screen = document.getElementById('reading-screen');
    if (!screen) return;
    readingRenderLibrary();
    readingShowLibrary();

    const prev = document.getElementById('book-prev');
    const next = document.getElementById('book-next');
    if (prev) prev.addEventListener('click', bookPrev);
    if (next) next.addEventListener('click', bookNext);

    const book = document.getElementById('book');
    if (book) {
        book.addEventListener('touchstart', bookTouchStart, { passive: true });
        book.addEventListener('touchend', bookTouchEnd, { passive: true });
    }
    document.addEventListener('keydown', bookKeydown);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', readingInit);
} else {
    readingInit();
}
