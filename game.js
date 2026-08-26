// ==================== ENGLISH FUN - GAME LOGIC ====================
// Copyright (c) 2026 DEMESCAST. Todos os direitos reservados.
// Autor: DEMESCAST - https://github.com/DEMESCAST

// Estado do jogo
let currentCategory = null;
let currentMode = null;
let learnWords = [];
let quizWords = [];
let currentLearnIndex = 0;
let currentQuizIndex = 0;
let score = 0;
let combo = 0;
let maxCombo = 0;
let correctAnswers = 0;
let wrongAnswersList = [];
const DEFAULT_TOTAL_QUESTIONS = 15;
let totalQuestions = DEFAULT_TOTAL_QUESTIONS;
let difficulty = 'medium';
let audioEnabled = true;
let audioCtx = null;
let bgMusic = null;
let bgMusicReady = false;
let achievements = [];
let wordStats = {};
let isReviewSession = false;
let playerName = '';
let playerUid = null;

// ==================== FIREBASE CONFIG ====================
const firebaseConfig = {
    apiKey: "AIzaSyDlaI77a3nbonR7ixl_BgePCiXWgzScoAA",
    authDomain: "englishfun-ranking.firebaseapp.com",
    databaseURL: "https://englishfun-ranking-default-rtdb.firebaseio.com",
    projectId: "englishfun-ranking",
    storageBucket: "englishfun-ranking.firebasestorage.app",
    messagingSenderId: "424548644810",
    appId: "1:424548644810:web:227546b109ffaad98c0133",
    measurementId: "G-HGZR7JSTNB"
};

let db = null;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    EFAuth.init();
} catch(e) {
    console.log('Firebase não configurado, usando ranking local');
}

// Categorias disponíveis
const categoryData = {
    animals:   { emoji: '🐾', name: 'Animais' },
    food:      { emoji: '🍎', name: 'Comidas' },
    colors:    { emoji: '🎨', name: 'Cores' },
    numbers:   { emoji: '🔢', name: 'Números' },
    body:      { emoji: '🦴', name: 'Corpo' },
    objects:   { emoji: '⚽', name: 'Objetos' },
    family:    { emoji: '👨‍👩‍👧', name: 'Família' },
    clothes:   { emoji: '👕', name: 'Roupas' },
    weather:   { emoji: '☀️', name: 'Clima' },
    actions:   { emoji: '🏃', name: 'Ações' },
    sentences: { emoji: '💬', name: 'Frases' }
};

// Configurações de dificuldade
const difficultyConfig = {
    easy: { options: 3, time: 15, points: 8 },
    medium: { options: 4, time: 10, points: 10 },
    hard: { options: 6, time: 7, points: 15 }
};

// Conquistas disponíveis
const achievementList = [
    { id: 'first_correct', name: 'Primeiro Acerto!', icon: '🎯', condition: (s) => s.correctAnswers >= 1 },
    { id: 'combo_3', name: 'Sequência de 3!', icon: '🔥', condition: (s) => s.maxCombo >= 3 },
    { id: 'combo_5', name: 'Sequência de 5!', icon: '💥', condition: (s) => s.maxCombo >= 5 },
    { id: 'combo_10', name: 'Sequência de 10!', icon: '⚡', condition: (s) => s.maxCombo >= 10 },
    { id: 'score_50', name: '50 Pontos!', icon: '⭐', condition: (s) => s.score >= 50 },
    { id: 'score_100', name: '100 Pontos!', icon: '🏆', condition: (s) => s.score >= 100 },
    { id: 'score_150', name: '150 Pontos!', icon: '👑', condition: (s) => s.score >= 150 },
    { id: 'perfect', name: 'Perfeito! 15/15!', icon: '💯', condition: (s) => s.correctAnswers >= 15 },
    { id: 'no_mistakes', name: 'Sem Erros!', icon: '✨', condition: (s) => s.correctAnswers >= 10 && s.wrongAnswers === 0 }
];

// Inicializar áudio
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Falar palavra
function speakWord() {
    if (!audioEnabled) return;
    const word = dictationMode && currentDictationWord ? currentDictationWord : learnWords[currentLearnIndex];
    if (!word) return;
    
    speechSynthesis.cancel();
    const rate = currentCategory === 'sentences' ? 0.7 : 0.8;
    
    // Falar a palavra primeiro
    const utteranceWord = new SpeechSynthesisUtterance(word.english);
    utteranceWord.lang = 'en-US';
    utteranceWord.rate = rate;
    speechSynthesis.speak(utteranceWord);
    
    // Depois falar a frase (com delay)
    if (word.sentence && word.sentence !== word.english) {
        setTimeout(() => {
            const utteranceSentence = new SpeechSynthesisUtterance(word.sentence);
            utteranceSentence.lang = 'en-US';
            utteranceSentence.rate = 0.75;
            speechSynthesis.speak(utteranceSentence);
        }, 1200);
    }
}

// Tocar som
function playSound(type) {
    if (!audioEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.value = 0.08;
    
    switch(type) {
        case 'correct':
            osc.frequency.value = 523;
            setTimeout(() => playTone(659, 0.15), 80);
            setTimeout(() => playTone(784, 0.2), 160);
            break;
        case 'wrong':
            osc.frequency.value = 200;
            osc.type = 'sawtooth';
            break;
        case 'click':
            osc.frequency.value = 800;
            break;
        case 'combo':
            osc.frequency.value = 880;
            setTimeout(() => playTone(1100, 0.1), 60);
            break;
        case 'achievement':
            osc.frequency.value = 523;
            setTimeout(() => playTone(659, 0.1), 100);
            setTimeout(() => playTone(784, 0.1), 200);
            setTimeout(() => playTone(1047, 0.3), 300);
            break;
        case 'timer':
            osc.frequency.value = 440;
            break;
        default:
            osc.frequency.value = 440;
    }
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.stop(audioCtx.currentTime + 0.15);
}

function playTone(freq, dur) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.value = 0.08;
    osc.frequency.value = freq;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur);
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
    document.getElementById('audio-btn').textContent = audioEnabled ? '🔊' : '🔇';
    if (bgMusic) {
        bgMusic.muted = !audioEnabled;
    }
}

function playBgMusic() {
    if (!bgMusic) {
        bgMusic = new Audio('bg-music.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        bgMusic.muted = !audioEnabled;
    }
    if (!bgMusicReady) {
        bgMusic.play().then(() => {
            bgMusicReady = true;
        }).catch(() => {});
    }
}

function stopBgMusic() {
    if (bgMusic) {
        bgMusic.pause();
        bgMusic = null;
    }
}

function pauseMenuMusic() {
    if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
    }
}

function resumeMenuMusic() {
    if (bgMusic && bgMusic.paused && audioEnabled) {
        bgMusic.play().catch(() => {});
    }
}

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}


function startGame(category) {
    initAudio();
    playSound('click');
    pauseMenuMusic();
    
    currentCategory = category;
    isReviewSession = false;
    score = 0;
    combo = 0;
    maxCombo = 0;
    correctAnswers = 0;
    wrongAnswersList = [];
    currentLearnIndex = 0;
    currentQuizIndex = 0;
    
    const allWords = vocabulary[category].words;
    totalQuestions = Math.min(DEFAULT_TOTAL_QUESTIONS, allWords.length);
    learnWords = getWordsForReview(allWords, totalQuestions);
    quizWords = shuffle([...learnWords]);
    
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('category-title').textContent = vocabulary[category].title;
    document.getElementById('score').textContent = '0';
    document.getElementById('combo').textContent = '0';
    document.getElementById('current-num').textContent = '1';
    document.getElementById('total-num').textContent = totalQuestions;
    
    showLearnMode();
}

function showLearnMode() {
    document.getElementById('learn-card').style.display = 'block';
    document.getElementById('quiz-card').style.display = 'none';
    
    const word = learnWords[currentLearnIndex];
    const isSentence = currentCategory === 'sentences';
    
    document.getElementById('learn-emoji').textContent = word.emoji;
    document.getElementById('learn-english').textContent = word.english;
    document.getElementById('learn-phonetic').textContent = word.phonetic;
    document.getElementById('learn-portuguese').textContent = word.portuguese;
    
    if (isSentence) {
        document.getElementById('learn-sentence').style.display = 'none';
    } else {
        document.getElementById('learn-sentence').textContent = `"${word.sentence}"`;
        document.getElementById('learn-sentence').style.fontSize = '16px';
        document.getElementById('learn-sentence').style.background = '#f5f5f5';
        document.getElementById('learn-sentence').style.display = 'block';
    }
    
    // Mostrar tradução da frase
    const sentenceTranslationEl = document.getElementById('learn-sentence-translation');
    if (isSentence || !word.sentenceTranslation) {
        sentenceTranslationEl.style.display = 'none';
    } else {
        sentenceTranslationEl.textContent = word.sentenceTranslation;
        sentenceTranslationEl.style.display = 'block';
    }
    
    // Mostrar/esconder botão voltar
    const backBtn = document.getElementById('back-learn-btn');
    if (currentLearnIndex === 0) {
        backBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'block';
    }
    
    document.getElementById('current-num').textContent = currentLearnIndex + 1;
    document.getElementById('progress-fill').style.width = `${((currentLearnIndex + 1) / totalQuestions) * 100}%`;
    
    const emoji = document.getElementById('learn-emoji');
    emoji.classList.remove('animate');
    void emoji.offsetWidth;
    emoji.classList.add('animate');
    
    setTimeout(() => speakWord(), 400);
}

function previousLearnWord() {
    playSound('click');
    if (currentLearnIndex > 0) {
        currentLearnIndex--;
        showLearnMode();
    }
}

function nextLearnWord() {
    playSound('click');
    currentLearnIndex++;
    
    if (currentLearnIndex >= learnWords.length) {
        showLearnComplete();
    } else {
        showLearnMode();
    }
}

function showQuizQuestion() {
    if (currentQuizIndex >= quizWords.length) {
        showResult();
        return;
    }
    
    const word = quizWords[currentQuizIndex];
    const config = difficultyConfig[difficulty];
    const isSentence = currentCategory === 'sentences';
    
    document.getElementById('quiz-emoji').textContent = word.emoji;
    
    if (isSentence) {
        document.getElementById('quiz-word').textContent = `"${word.english}"`;
        document.getElementById('quiz-hint').textContent = `Pronúncia: ${word.phonetic}`;
    } else {
        document.getElementById('quiz-word').textContent = `O que significa "${word.english}"?`;
        document.getElementById('quiz-hint').textContent = `Pronúncia: ${word.phonetic}`;
    }
    
    document.getElementById('current-num').textContent = currentQuizIndex + 1;
    document.getElementById('progress-fill').style.width = `${((currentQuizIndex + 1) / totalQuestions) * 100}%`;
    
    // Gerar opções
    const correctAnswer = word.portuguese;
    let options = [correctAnswer];
    const allTranslations = learnWords.map(w => w.portuguese);
    const otherTranslations = allTranslations.filter(t => t !== correctAnswer);
    const shuffledOthers = shuffle(otherTranslations);
    
    while (options.length < config.options && shuffledOthers.length > 0) {
        options.push(shuffledOthers.pop());
    }
    
    options = shuffle(options);
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = options.map(opt => 
        `<button class="option-btn" onclick="checkAnswer('${opt.replace(/'/g, "\\'")}', '${correctAnswer.replace(/'/g, "\\'")}')">${opt}</button>`
    ).join('');
    
    document.getElementById('quiz-card').style.animation = 'none';
    void document.getElementById('quiz-card').offsetWidth;
    document.getElementById('quiz-card').style.animation = 'slideUp 0.4s ease-out';
}

function startTimer() {
    // Timer removido - sem pressão de tempo
}

function stopTimer() {
    // Timer removido - sem pressão de tempo
}

function checkAnswer(selected, correct) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    const word = quizWords[currentQuizIndex];
    const config = difficultyConfig[difficulty];
    
    if (selected === correct) {
        correctAnswers++;
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        
        let points = config.points;
        if (combo >= 3) points += combo * 2;
        
        score += points;
        document.getElementById('score').textContent = score;
        updateComboDisplay();
        
        playSound(combo >= 3 ? 'combo' : 'correct');
        showFeedback(`✓ +${points} pontos!`, '#38ef7d');
        
        buttons.forEach(btn => {
            if (btn.textContent === correct) {
                btn.classList.add('correct', 'correct-animation');
            }
        });
        
        if (combo >= 3) {
            celebrateCombo();
        } else {
            celebrateCorrect();
        }
        
        checkAchievements();
        updateWordStat(word, true);
        currentQuizIndex++;
        setTimeout(showQuizQuestion, 1000);
    } else {
        wrongAnswersList.push(word);
        combo = 0;
        updateWordStat(word, false);
        updateComboDisplay();
        playSound('wrong');
        showFeedback('✗ Errado!', '#f45c43');
        
        buttons.forEach(btn => {
            if (btn.textContent === selected) btn.classList.add('wrong', 'wrong-animation');
            if (btn.textContent === correct) btn.classList.add('correct');
        });
        
        setTimeout(() => showModal(word, true), 800);
    }
}

function updateComboDisplay() {
    document.getElementById('combo').textContent = combo;
    const comboBox = document.querySelector('.combo-box');
    if (combo >= 5) comboBox.style.background = 'rgba(255,100,100,0.7)';
    else if (combo >= 3) comboBox.style.background = 'rgba(255,150,0,0.6)';
    else comboBox.style.background = 'rgba(255,100,100,0.4)';
}

function showModal(word, showCorrection) {
    document.getElementById('modal-emoji').textContent = word.emoji;
    document.getElementById('modal-title').textContent = showCorrection ? 'A resposta correta é:' : 'Resposta correta:';
    document.getElementById('modal-word').textContent = word.english;
    document.getElementById('modal-translation').textContent = word.portuguese;
    document.getElementById('modal-sentence').textContent = `"${word.sentence}"`;
    document.getElementById('answer-modal').style.display = 'flex';
    
    // Falar a palavra/frase
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(word.english);
        utterance.lang = 'en-US';
        utterance.rate = currentCategory === 'sentences' ? 0.7 : 0.8;
        speechSynthesis.speak(utterance);
    }, 500);
}

function closeModal() {
    playSound('click');
    document.getElementById('answer-modal').style.display = 'none';
    currentQuizIndex++;
    if (dictationMode) {
        showDictationQuestion();
    } else {
        showQuizQuestion();
    }
}

function showFeedback(text, color, duration = 1000) {
    const fb = document.getElementById('feedback');
    fb.textContent = text;
    fb.style.color = color;
    fb.className = 'show';
    setTimeout(() => fb.className = '', duration);
}

function checkAchievements() {
    const state = { score, correctAnswers, maxCombo, wrongAnswers: wrongAnswersList.length };
    
    achievementList.forEach(ach => {
        if (!achievements.includes(ach.id) && ach.condition(state)) {
            achievements.push(ach.id);
            showAchievement(ach);
        }
    });
}

function showAchievement(ach) {
    playSound('achievement');
    const container = document.getElementById('achievements');
    const el = document.createElement('div');
    el.className = 'achievement';
    el.innerHTML = `${ach.icon} ${ach.name}`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

// ==================== RANKING ====================

// Normalizar chave do apelido (para agrupar jogadores)
function normalizeNicknameKey(name) {
    if (typeof name !== 'string') return '';
    return name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Calcular generalPoints a partir de um registro
function getGeneralPoints(entry) {
    if (!entry) return 0;
    if (typeof entry.generalPoints === 'number' && entry.generalPoints >= 0) {
        return entry.generalPoints;
    }
    // Fallback para registros antigos
    if (entry.mode === 'learn') return 50;
    if (entry.mode === 'memory') {
        const maxMemory = 500;
        return Math.round(((entry.score || 0) / maxMemory) * 400);
    }
    if (entry.correct != null && entry.total != null && entry.total > 0) {
        return Math.round((entry.correct / entry.total) * 400);
    }
    return 0;
}

// Converter score da memória para 0-400
function calculateMemoryGeneralPoints(memoryScore) {
    const maxMemory = 500;
    const pts = Math.round((memoryScore / maxMemory) * 400);
    return Math.max(0, Math.min(400, pts));
}

// Construir ranking geral agrupado por jogador
function buildGeneralRanking(entries) {
    const players = {};
    
    entries.forEach(entry => {
        const safe = normalizeRankingEntry(entry);
        if (!safe) return;
        
        const key = normalizeNicknameKey(safe.name);
        if (!key) return;
        
        if (!players[key]) {
            players[key] = {
                name: safe.name,
                totalGeneralPoints: 0,
                combinations: 0,
                lastDate: safe.date,
                bestPerCombo: {}
            };
        }
        
        const player = players[key];
        const comboKey = `${safe.mode}_${safe.category}`;
        const gp = getGeneralPoints(safe);
        
        if (!player.bestPerCombo[comboKey] || gp > player.bestPerCombo[comboKey]) {
            player.bestPerCombo[comboKey] = gp;
        }
        
        if (safe.date > player.lastDate) player.lastDate = safe.date;
    });
    
    // Somar melhores resultados
    const result = [];
    Object.values(players).forEach(player => {
        let total = 0;
        let combos = 0;
        Object.values(player.bestPerCombo).forEach(pts => {
            total += pts;
            combos++;
        });
        result.push({
            name: player.name,
            generalPoints: total,
            combinations: combos,
            lastDate: player.lastDate
        });
    });
    
    // Ordenar: maior pontuação, mais combos, data mais recente
    result.sort((a, b) => {
        if (b.generalPoints !== a.generalPoints) return b.generalPoints - a.generalPoints;
        if (b.combinations !== a.combinations) return b.combinations - a.combinations;
        return (b.lastDate || '').localeCompare(a.lastDate || '');
    });
    
    return result;
}

// Normalizar e validar entrada do ranking
function normalizeRankingEntry(entry) {
    if (!entry || typeof entry !== 'object') return null;
    
    // Validar apelido
    let name = typeof entry.name === 'string' ? entry.name.trim() : '';
    name = name.replace(/\s+/g, ' ');
    if (name.length < 2 || name.length > 16) name = 'Jogador';
    
    // Validar score
    const score = Number(entry.score);
    if (!Number.isFinite(score) || score < 0 || score > 10000) return null;
    
    // Validar outros campos numéricos
    const correct = Number(entry.correct);
    const total = Number(entry.total);
    const maxCombo = Number(entry.maxCombo);
    if (!Number.isFinite(correct) || correct < 0) return null;
    if (!Number.isFinite(total) || total < 1 || total > 100) return null;
    if (!Number.isFinite(maxCombo) || maxCombo < 0 || maxCombo > 100) return null;
    
    return {
        name: name,
        score: Math.round(score),
        generalPoints: typeof entry.generalPoints === 'number' && entry.generalPoints >= 0 && entry.generalPoints <= 400
            ? entry.generalPoints
            : undefined,
        correct: Math.round(correct),
        total: Math.round(total),
        maxCombo: Math.round(maxCombo),
        category: typeof entry.category === 'string' ? entry.category : 'unknown',
        mode: typeof entry.mode === 'string' ? entry.mode : 'unknown',
        date: typeof entry.date === 'string' ? entry.date : new Date().toISOString()
    };
}

// ==================== AUTH FLOW ====================
function showWelcomeScreen() {
    hideAllScreens();
    document.getElementById('landing-screen').style.display = 'flex';
    resumeMenuMusic();
}

function showLoginScreen() {
    hideAllScreens();
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-nickname').value = '';
    document.getElementById('login-pin').value = '';
    document.getElementById('login-error').textContent = '';
    document.getElementById('login-nickname').focus();
}

function showCreateScreen() {
    hideAllScreens();
    document.getElementById('create-screen').style.display = 'flex';
    document.getElementById('create-nickname').value = '';
    document.getElementById('create-pin').value = '';
    document.getElementById('create-error').textContent = '';
    document.getElementById('create-nickname').focus();
}

function hideAllScreens() {
    const screens = ['landing-screen', 'welcome-screen', 'create-screen', 'created-screen', 'login-screen', 'start-screen', 'category-screen', 'game-screen', 'memory-screen', 'result-screen', 'progress-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

async function handleCreatePlayer() {
    const nickInput = document.getElementById('create-nickname');
    const pinInput = document.getElementById('create-pin');
    const errorEl = document.getElementById('create-error');

    const nickResult = EFPlayer.validateNickname(nickInput.value);
    if (!nickResult.valid) {
        errorEl.textContent = nickResult.error;
        nickInput.focus();
        return;
    }

    const pinResult = EFPlayer.validatePin(pinInput.value);
    if (!pinResult.valid) {
        errorEl.textContent = pinResult.error;
        pinInput.focus();
        return;
    }

    errorEl.textContent = '';
    const loadingEl = document.createElement('div');
    loadingEl.className = 'auth-loading';
    loadingEl.textContent = 'Criando jogador...';
    errorEl.parentNode.insertBefore(loadingEl, errorEl.nextSibling);

    try {
        const normalized = EFAuth.normalizeNickname(nickResult.value);

        const user = await EFAuth.createAccount(normalized, pinInput.value);
        try {
            await EFPlayer.createPlayer(user.uid, nickResult.value, normalized, pinInput.value, db);
        } catch(dbError) {
            console.error('Erro ao salvar dados do jogador:', dbError);
            try { await user.delete(); } catch(delErr) { console.error('Falha ao rollback:', delErr); }
            errorEl.textContent = 'Erro ao criar jogador. Tente novamente.';
            loadingEl.remove();
            return;
        }

        playerUid = user.uid;
        playerName = nickResult.value;

        document.getElementById('created-nickname').textContent = nickResult.value;

        hideAllScreens();
        document.getElementById('created-screen').style.display = 'flex';
    } catch(e) {
        console.error('Erro ao criar jogador:', e);
        if (e.code === 'auth/email-already-in-use') {
            errorEl.textContent = 'ESSE APELIDO JÁ ESTÁ SENDO USADO. TENTE OUTRO.';
        } else {
            errorEl.textContent = 'Erro ao criar jogador. Tente novamente.';
        }
    } finally {
        loadingEl.remove();
    }
}

function startPlaying() {
    hideAllScreens();
    document.getElementById('start-screen').style.display = 'block';
    updatePlayerBar();
    displayHomeRanking();
    resumeMenuMusic();
}

async function handleLogin() {
    const nickInput = document.getElementById('login-nickname');
    const pinInput = document.getElementById('login-pin');
    const errorEl = document.getElementById('login-error');

    const nickResult = EFPlayer.validateNickname(nickInput.value);
    if (!nickResult.valid) {
        errorEl.textContent = nickResult.error;
        nickInput.focus();
        return;
    }

    const pinResult = EFPlayer.validatePin(pinInput.value);
    if (!pinResult.valid) {
        errorEl.textContent = pinResult.error;
        pinInput.focus();
        return;
    }

    errorEl.textContent = '';
    const loadingEl = document.createElement('div');
    loadingEl.className = 'auth-loading';
    loadingEl.textContent = 'Entrando...';
    errorEl.parentNode.insertBefore(loadingEl, errorEl.nextSibling);

    try {
        const normalized = EFAuth.normalizeNickname(nickResult.value);
        const user = await EFAuth.signIn(normalized, pinInput.value);
        playerUid = user.uid;

        const profile = await EFPlayer.getProfile(playerUid, db);
        if (profile) {
            playerName = profile.nickname;
        } else {
            playerName = nickResult.value;
        }

        hideAllScreens();
        document.getElementById('start-screen').style.display = 'block';
        updatePlayerBar();
        displayHomeRanking();
        resumeMenuMusic();
    } catch(e) {
        console.error('Erro ao entrar:', e);
        errorEl.textContent = 'APELIDO OU PIN INCORRETO. TENTE NOVAMENTE.';
    } finally {
        loadingEl.remove();
    }
}

async function handleLogout() {
    try {
        await EFAuth.signOut();
    } catch(e) {}
    playerUid = null;
    playerName = '';
    localStorage.removeItem('englishFunPlayerNickname');
    hideAllScreens();
    document.getElementById('landing-screen').style.display = 'flex';
    resumeMenuMusic();
}

function updatePlayerBar() {
    const bar = document.getElementById('player-bar');
    const nameEl = document.getElementById('player-bar-name');
    if (bar && nameEl && playerName) {
        nameEl.textContent = playerName;
        bar.style.display = 'flex';
    } else if (bar) {
        bar.style.display = 'none';
    }
}

// Validar apelido do jogador
function validateNickname(value) {
    if (typeof value !== 'string') return { valid: false, error: 'Escolha um apelido de 2 a 16 caracteres.' };
    
    let nick = value.trim().replace(/\s+/g, ' ');
    
    // Remover caracteres de controle
    nick = nick.replace(/[\x00-\x1f\x7f]/g, '');
    
    // Remover tags HTML
    nick = nick.replace(/<[^>]*>/g, '');
    
    if (nick.length < 2) return { valid: false, error: 'Escolha um apelido de 2 a 16 caracteres.' };
    if (nick.length > 16) nick = nick.substring(0, 16);
    
    // Permitir apenas letras, números, espaço, hífen, underscore
    if (!/^[a-zA-ZÀ-ÿ0-9 _\-]+$/.test(nick)) {
        return { valid: false, error: 'Use apenas letras, números, espaço, hífen ou underscore.' };
    }
    
    return { valid: true, value: nick };
}

async function saveRanking() {
    const correctCount = totalQuestions - wrongAnswersList.length;
    
    let generalPoints = 0;
    if (currentMode === 'quiz' || currentMode === 'dictation') {
        generalPoints = Math.round((correctCount / totalQuestions) * 400);
        generalPoints = Math.max(0, Math.min(400, generalPoints));
    }
    
    const entry = {
        uid: playerUid,
        name: playerName,
        score: score,
        generalPoints: generalPoints,
        correct: correctCount,
        total: totalQuestions,
        maxCombo: maxCombo,
        category: currentCategory,
        mode: currentMode,
        date: new Date().toISOString()
    };
    
    let firebaseSaved = false;

    if (db && playerUid) {
        try {
            await db.ref('gameHistory/' + playerUid).push(entry);
            await updatePlayerRankingData(playerUid, entry);
            firebaseSaved = true;
        } catch (error) {
            console.error('Erro ao salvar ranking:', error.code, error.message);
        }
    }
    
    try {
        const key = 'englishFunRanking';
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        data.push(entry);
        data.sort((a, b) => b.score - a.score);
        localStorage.setItem(key, JSON.stringify(data.slice(0, 50)));
    } catch(e) {}
    
    return firebaseSaved;
}

async function updatePlayerRankingData(uid, entry) {
    try {
        const profile = await EFPlayer.getProfile(uid, db);
        if (!profile) return;

        const rankRef = db.ref('ranking/' + uid);
        const snap = await rankRef.once('value');
        const existing = snap.val() || {};

        const comboKey = entry.mode + '_' + entry.category;
        if (!existing.bestPerCombo) existing.bestPerCombo = {};
        const prev = existing.bestPerCombo[comboKey] || 0;
        if (entry.generalPoints > prev) {
            existing.bestPerCombo[comboKey] = entry.generalPoints;
        }

        let totalGeneral = 0;
        Object.values(existing.bestPerCombo).forEach(pts => { totalGeneral += pts; });

        await rankRef.set({
            uid: uid,
            nickname: profile.nickname,
            totalScore: existing.totalScore || 0,
            totalGeneral: totalGeneral,
            bestPerCombo: existing.bestPerCombo,
            updatedAt: Date.now()
        });
    } catch(e) {
        console.error('Erro ao atualizar ranking do jogador:', e);
    }
}

async function displayRanking() {
    const section = document.getElementById('ranking-section');
    const table = document.getElementById('ranking-table');
    
    if (db) {
        try {
            const snapshot = await db.ref('ranking').once('value');
            const rawData = [];
            snapshot.forEach((child) => {
                const val = child.val();
                if (val && val.nickname) {
                    rawData.push({
                        uid: child.key,
                        name: val.nickname,
                        generalPoints: val.totalGeneral || 0,
                        bestPerCombo: val.bestPerCombo || {},
                        updatedAt: val.updatedAt || 0
                    });
                }
            });
            
            rawData.sort((a, b) => b.generalPoints - a.generalPoints);
            renderRankingTable(rawData.slice(0, 10), table, section);
        } catch (error) {
            renderRankingLocal(table, section);
        }
    } else {
        renderRankingLocal(table, section);
    }
}

function renderRankingLocal(table, section) {
    try {
        const data = JSON.parse(localStorage.getItem('englishFunRanking') || '[]');
        const generalRanking = buildGeneralRanking(data);
        renderRankingTable(generalRanking.slice(0, 10), table, section);
    } catch(e) { section.style.display = 'none'; }
}

function renderRankingTable(data, table, section) {
    if (!data || data.length === 0) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    table.innerHTML = '';
    
    data.forEach((entry, i) => {
        const name = entry.name || 'Jogador';
        const gp = entry.generalPoints || 0;
        const isYou = entry.uid && entry.uid === playerUid;
        
        const pos = i + 1;
        const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}º`;
        
        const row = document.createElement('div');
        row.className = 'ranking-row';
        
        const posSpan = document.createElement('span');
        posSpan.className = 'ranking-pos';
        posSpan.textContent = medal;
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'ranking-name';
        nameSpan.textContent = name;
        
        if (isYou) {
            const youSpan = document.createElement('span');
            youSpan.className = 'ranking-you';
            youSpan.textContent = ' (você)';
            nameSpan.appendChild(youSpan);
        }
        
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'ranking-score';
        scoreSpan.textContent = `${gp} pts`;
        
        row.appendChild(posSpan);
        row.appendChild(nameSpan);
        row.appendChild(scoreSpan);
        table.appendChild(row);
    });
}

async function showResult() {
    playSound('correct');
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    
    const correctCount = totalQuestions - wrongAnswersList.length;
    const pct = Math.round((correctCount / totalQuestions) * 100);
    
    document.getElementById('result-score').textContent = `Pontuação: ${score}`;
    document.getElementById('result-stats').textContent = `Acertos: ${correctCount}/${totalQuestions} | Sequência máxima: ${maxCombo}x`;
    
    // Calcular generalPoints desta partida
    let matchGeneralPoints = 0;
    if (currentMode === 'quiz' || currentMode === 'dictation') {
        matchGeneralPoints = Math.round((correctCount / totalQuestions) * 400);
        matchGeneralPoints = Math.max(0, Math.min(400, matchGeneralPoints));
    } else if (currentMode === 'learn') {
        matchGeneralPoints = 50;
    }
    
    // Buscar pontuação geral anterior do jogador
    let previousGeneral = 0;
    let previousBestForCombo = 0;
    const comboKey = `${currentMode}_${currentCategory}`;
    
    try {
        if (db && playerUid) {
            try {
                const rankSnap = await db.ref('ranking/' + playerUid).once('value');
                const rankData = rankSnap.val();
                if (rankData) {
                    previousGeneral = rankData.totalGeneral || 0;
                    if (rankData.bestPerCombo && rankData.bestPerCombo[comboKey]) {
                        previousBestForCombo = rankData.bestPerCombo[comboKey];
                    }
                }
            } catch(e) {
                const entries = JSON.parse(localStorage.getItem('englishFunRanking') || '[]');
                const generalRanking = buildGeneralRanking(entries);
                const currentPlayer = generalRanking.find(p => p.uid === playerUid);
                previousGeneral = currentPlayer ? currentPlayer.generalPoints : 0;
                entries.forEach(entry => {
                    if (entry.uid === playerUid) {
                        const ek = entry.mode + '_' + entry.category;
                        if (ek === comboKey) {
                            previousBestForCombo = Math.max(previousBestForCombo, getGeneralPoints(entry));
                        }
                    }
                });
            }
        } else {
            const entries = JSON.parse(localStorage.getItem('englishFunRanking') || '[]');
            const generalRanking = buildGeneralRanking(entries);
            const currentPlayer = generalRanking.find(p => p.uid === playerUid);
            previousGeneral = currentPlayer ? currentPlayer.generalPoints : 0;
            entries.forEach(entry => {
                if (entry.uid === playerUid) {
                    const ek = entry.mode + '_' + entry.category;
                    if (ek === comboKey) {
                        previousBestForCombo = Math.max(previousBestForCombo, getGeneralPoints(entry));
                    }
                }
            });
        }
    } catch(e) {}
    
    const newBest = matchGeneralPoints > previousBestForCombo;
    const gained = newBest ? matchGeneralPoints - previousBestForCombo : 0;
    const newGeneral = previousGeneral + gained;
    
    // Mostrar pontuação geral na tela
    const generalEl = document.getElementById('result-general');
    if (generalEl) {
        if (currentMode !== 'review') {
            let html = `<div class="general-score-box">`;
            html += `<div class="general-label">PONTUAÇÃO GERAL</div>`;
            html += `<div class="general-value">${newGeneral.toLocaleString('pt-BR')} pts</div>`;
            if (newBest && gained > 0) {
                html += `<div class="general-gain">+${gained} pontos no ranking</div>`;
            } else if (matchGeneralPoints > 0) {
                html += `<div class="general-neutral">Seu recorde nesta atividade foi mantido.</div>`;
            }
            html += `</div>`;
            generalEl.innerHTML = html;
            generalEl.style.display = 'block';
        } else {
            generalEl.style.display = 'none';
        }
    }
    
    if (pct >= 90) {
        document.getElementById('result-emoji').textContent = '🏆';
        document.getElementById('result-message').textContent = 'Incrível! Você é um mestre!';
        celebratePerfect();
    } else if (pct >= 70) {
        document.getElementById('result-emoji').textContent = '⭐';
        document.getElementById('result-message').textContent = 'Muito bem! Continue assim!';
        createConfetti(80);
    } else if (pct >= 50) {
        document.getElementById('result-emoji').textContent = '👍';
        document.getElementById('result-message').textContent = 'Bom trabalho! Pratique mais!';
    } else {
        document.getElementById('result-emoji').textContent = '💪';
        document.getElementById('result-message').textContent = 'Não desista! Tente novamente!';
    }
    
    // Mostrar erros
    const wrongContainer = document.getElementById('wrong-answers');
    const wrongList = document.getElementById('wrong-list');
    if (wrongAnswersList.length > 0) {
        wrongContainer.style.display = 'block';
        wrongList.innerHTML = wrongAnswersList.map(w => `
            <div class="wrong-item">
                <span class="wrong-emoji">${w.emoji}</span>
                <div class="wrong-info">
                    <span class="wrong-english">${w.english}</span>
                    <span class="wrong-portuguese">${w.portuguese}</span>
                </div>
            </div>
        `).join('');
    } else {
        wrongContainer.style.display = 'none';
    }
    
    // Salvar e mostrar ranking
    if (!isReviewSession) {
        const firebaseSaved = await saveRanking();
        if (firebaseSaved) {
            await displayRanking();
        } else {
            const section = document.getElementById('ranking-section');
            const table = document.getElementById('ranking-table');
            renderRankingLocal(table, section);
        }
    } else {
        document.getElementById('ranking-section').style.display = 'none';
    }
    
    saveProgress();
}

function playAgain() {
    playSound('click');
    document.getElementById('result-screen').style.display = 'none';
    
    if (isReviewSession) {
        startReviewMode();
        return;
    }
    
    if (currentMode === 'quiz') {
        startModeWithCategory(currentCategory);
    } else if (currentMode === 'dictation') {
        startModeWithCategory(currentCategory);
    } else {
        startGame(currentCategory);
    }
}

function goToMenu() {
    playSound('click');
    stopTimer();
    if (memoryTimerInterval) clearInterval(memoryTimerInterval);
    dictationMode = false;
    currentMode = null;
    isReviewSession = false;
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('answer-modal').style.display = 'none';
    document.getElementById('memory-screen').style.display = 'none';
    document.getElementById('category-screen').style.display = 'none';
    document.getElementById('learn-complete-card').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    displayHomeRanking();
    resumeMenuMusic();
}

// ==================== SELEÇÃO DE MODO E CATEGORIA ====================
function selectMode(mode) {
    playSound('click');
    initAudio();
    currentMode = mode;
    
    document.getElementById('start-screen').style.display = 'none';
    
    const titles = {
        learn: '📚 Aprender',
        quiz: '🎯 Quiz',
        dictation: '🔊 Ouvir e Escrever',
        review: '⭐ Revisar Meus Erros'
    };
    
    if (mode === 'review') {
        startReviewMode();
        return;
    }
    
    document.getElementById('category-title-mode').textContent = titles[mode];
    
    const grid = document.getElementById('category-grid-mode');
    grid.innerHTML = '';
    
    for (const [key, cat] of Object.entries(categoryData)) {
        const btn = document.createElement('button');
        btn.className = `category-btn cat-${key}`;
        btn.setAttribute('aria-label', `Categoria ${cat.name}`);
        btn.innerHTML = `<span>${cat.emoji}</span> ${cat.name}`;
        btn.onclick = () => startModeWithCategory(key);
        grid.appendChild(btn);
    }
    
    document.getElementById('category-screen').style.display = 'block';
}

function goToModeSelect() {
    playSound('click');
    document.getElementById('category-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    resumeMenuMusic();
}

function startModeWithCategory(category) {
    playSound('click');
    pauseMenuMusic();
    currentCategory = category;
    isReviewSession = false;
    document.getElementById('category-screen').style.display = 'none';
    
    const allWords = vocabulary[category].words;
    totalQuestions = Math.min(DEFAULT_TOTAL_QUESTIONS, allWords.length);
    learnWords = getWordsForReview(allWords, totalQuestions);
    quizWords = shuffle([...learnWords]);
    
    score = 0;
    combo = 0;
    maxCombo = 0;
    correctAnswers = 0;
    wrongAnswersList = [];
    currentLearnIndex = 0;
    currentQuizIndex = 0;
    
    if (!playerUid) {
        showWelcomeScreen();
        return;
    }
    
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('category-title').textContent = vocabulary[currentCategory].title;
    document.getElementById('score').textContent = '0';
    document.getElementById('combo').textContent = '0';
    document.getElementById('current-num').textContent = '1';
    document.getElementById('total-num').textContent = totalQuestions;
    
    switch (currentMode) {
        case 'learn':
            showLearnMode();
            break;
        case 'quiz':
            dictationMode = false;
            showQuizMode();
            break;
        case 'dictation':
            dictationMode = true;
            showQuizMode();
            break;
    }
}

function confirmName() {
    // Legacy function - no longer used with auth system
}

function goBackFromName() {
    playSound('click');
    document.getElementById('name-screen').style.display = 'none';
    document.getElementById('category-screen').style.display = 'block';
}

function showQuizMode() {
    document.getElementById('learn-card').style.display = 'none';
    document.getElementById('quiz-card').style.display = 'none';
    document.getElementById('dictation-card').style.display = 'none';
    
    if (dictationMode) {
        document.getElementById('dictation-card').style.display = 'block';
        document.getElementById('dictation-input').removeEventListener('keypress', handleDictationKeyPress);
        document.getElementById('dictation-input').addEventListener('keypress', handleDictationKeyPress);
        showDictationQuestion();
    } else {
        document.getElementById('quiz-card').style.display = 'block';
        showQuizQuestion();
    }
}

function showLearnComplete() {
    document.getElementById('learn-card').style.display = 'none';
    document.getElementById('learn-complete-card').style.display = 'block';
    saveLearnBonus();
    updateLocalProgress(currentCategory, 'learn');
}

// Salvar bonus de Learn (50 pontos, uma vez por categoria)
async function saveLearnBonus() {
    if (!playerUid || !currentCategory) return;
    
    const comboKey = 'learn_' + currentCategory;
    
    if (db) {
        try {
            const rankSnap = await db.ref('ranking/' + playerUid).once('value');
            const rankData = rankSnap.val();
            if (rankData && rankData.bestPerCombo && rankData.bestPerCombo[comboKey]) {
                return;
            }
        } catch(e) {}
    }
    
    try {
        const localData = JSON.parse(localStorage.getItem('englishFunRanking') || '[]');
        const alreadyHasLocal = localData.some(e => e.uid === playerUid && e.mode === 'learn' && e.category === currentCategory);
        if (alreadyHasLocal) return;
    } catch(e) {}
    
    const entry = {
        uid: playerUid,
        name: playerName,
        score: 0,
        generalPoints: 50,
        correct: 1,
        total: 1,
        maxCombo: 0,
        category: currentCategory,
        mode: 'learn',
        date: new Date().toISOString()
    };
    
    if (db && playerUid) {
        try {
            await db.ref('gameHistory/' + playerUid).push(entry);
            await updatePlayerRankingData(playerUid, entry);
        } catch(e) {}
    }
    
    try {
        const data = JSON.parse(localStorage.getItem('englishFunRanking') || '[]');
        data.push(entry);
        localStorage.setItem('englishFunRanking', JSON.stringify(data));
    } catch(e) {}
}

async function saveMemoryRanking() {
    if (!playerUid || !memoryCategory) return;
    
    const generalPoints = calculateMemoryGeneralPoints(memoryScore);
    
    const entry = {
        uid: playerUid,
        name: playerName,
        score: memoryScore,
        generalPoints: generalPoints,
        correct: matchedPairs,
        total: 8,
        maxCombo: matchedPairs,
        category: memoryCategory,
        mode: 'memory',
        date: new Date().toISOString()
    };
    
    let firebaseSaved = false;
    if (db && playerUid) {
        try {
            await db.ref('gameHistory/' + playerUid).push(entry);
            await updatePlayerRankingData(playerUid, entry);
            firebaseSaved = true;
        } catch(e) {}
    }
    
    try {
        const data = JSON.parse(localStorage.getItem('englishFunRanking') || '[]');
        data.push(entry);
        data.sort((a, b) => b.score - a.score);
        localStorage.setItem('englishFunRanking', JSON.stringify(data.slice(0, 50)));
    } catch(e) {}
    
    return firebaseSaved;
}

function startQuizFromLearn() {
    playSound('click');
    document.getElementById('learn-complete-card').style.display = 'none';
    currentQuizIndex = 0;
    dictationMode = false;
    currentMode = 'quiz';
    isReviewSession = false;
    showQuizMode();
}

function startReviewMode() {
    loadWordStats();
    pauseMenuMusic();
    currentMode = 'review';
    isReviewSession = true;
    
    const allWords = [];
    for (const [catKey, catData] of Object.entries(vocabulary)) {
        catData.words.forEach(word => {
            const key = `${catKey}_${word.english}`;
            const stat = wordStats[key];
            if (stat && stat.wrong > 0) {
                allWords.push({ ...word, originalCategory: catKey, wrongCount: stat.wrong, correctCount: stat.correct });
            }
        });
    }
    
    if (allWords.length === 0) {
        document.getElementById('start-screen').style.display = 'block';
        showFeedback('Nenhum erro registrado ainda! Jogue primeiro para poder revisar.', '#ffd700');
        resumeMenuMusic();
        return;
    }
    
    allWords.sort((a, b) => b.wrongCount - a.wrongCount);
    const reviewWords = allWords.slice(0, Math.min(DEFAULT_TOTAL_QUESTIONS, allWords.length));
    
    currentCategory = 'review';
    learnWords = reviewWords;
    quizWords = shuffle([...learnWords]);
    totalQuestions = reviewWords.length;
    
    score = 0;
    combo = 0;
    maxCombo = 0;
    correctAnswers = 0;
    wrongAnswersList = [];
    currentLearnIndex = 0;
    currentQuizIndex = 0;
    
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('category-title').textContent = '⭐ Revisão de Erros';
    document.getElementById('score').textContent = '0';
    document.getElementById('combo').textContent = '0';
    document.getElementById('current-num').textContent = '1';
    document.getElementById('total-num').textContent = totalQuestions;
    
    showLearnMode();
}

// ==================== PER-PLAYER STORAGE ====================
function getPlayerStorageKey(baseKey) {
    if (playerUid) return baseKey + ':' + playerUid;
    return baseKey;
}

function migrateOldProgressData() {
    try {
        const oldProgress = localStorage.getItem('englishFunProgress');
        if (oldProgress) {
            const nickname = playerName || localStorage.getItem('englishFunPlayerNickname') || '';
            const key = normalizeNicknameKey(nickname);
            if (key) {
                const newStorageKey = `englishFunProgress:${key}`;
                if (!localStorage.getItem(newStorageKey)) {
                    localStorage.setItem(newStorageKey, oldProgress);
                }
            }
        }

        const oldWordStats = localStorage.getItem('englishFunWordStats');
        if (oldWordStats) {
            const nickname = playerName || localStorage.getItem('englishFunPlayerNickname') || '';
            const key = normalizeNicknameKey(nickname);
            if (key) {
                const newStorageKey = `englishFunWordStats:${key}`;
                if (!localStorage.getItem(newStorageKey)) {
                    localStorage.setItem(newStorageKey, oldWordStats);
                }
            }
        }
    } catch(e) {}
}

// ==================== SAVE PROGRESS ====================
function saveProgress() {
    try {
        const storageKey = getPlayerStorageKey('englishFunProgress');
        const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
        if (!data.categories) data.categories = {};
        
        const cat = currentCategory;
        if (!data.categories[cat]) {
            data.categories[cat] = { 
                plays: 0, 
                bestScore: 0, 
                totalCorrect: 0, 
                totalWrong: 0,
                bestCombo: 0,
                perfectGames: 0,
                lastPlayed: 0
            };
        }
        
        const correctCount = totalQuestions - wrongAnswersList.length;
        const catData = data.categories[cat];
        
        catData.plays++;
        catData.totalCorrect += correctCount;
        catData.totalWrong += wrongAnswersList.length;
        if (score > catData.bestScore) catData.bestScore = score;
        if (maxCombo > catData.bestCombo) catData.bestCombo = maxCombo;
        if (wrongAnswersList.length === 0) catData.perfectGames++;
        catData.lastPlayed = Date.now();
        
        data.totalPlays = (data.totalPlays || 0) + 1;
        data.totalCorrectAll = (data.totalCorrectAll || 0) + correctCount;
        data.totalWrongAll = (data.totalWrongAll || 0) + wrongAnswersList.length;
        data.achievements = [...new Set([...(data.achievements || []), ...achievements])];
        
        const today = new Date().toDateString();
        const lastDate = data.lastPlayDate;
        if (lastDate !== today) {
            if (!lastDate) {
                data.dailyStreak = 1;
            } else {
                const last = new Date(lastDate);
                const now = new Date();
                const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    data.dailyStreak = (data.dailyStreak || 0) + 1;
                } else if (diffDays > 1) {
                    data.dailyStreak = 1;
                }
            }
            data.lastPlayDate = today;
        }
        
        localStorage.setItem(storageKey, JSON.stringify(data));
    } catch(e) {}
}

// Atualizar progresso local para modos que não têm acertos/erros
function updateLocalProgress(cat, mode) {
    try {
        const storageKey = getPlayerStorageKey('englishFunProgress');
        const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
        if (!data.categories) data.categories = {};

        if (!data.categories[cat]) {
            data.categories[cat] = {
                plays: 0, bestScore: 0, totalCorrect: 0, totalWrong: 0,
                bestCombo: 0, perfectGames: 0, lastPlayed: 0
            };
        }

        data.categories[cat].lastPlayed = Date.now();
        data.categories[cat].plays++;

        data.totalPlays = (data.totalPlays || 0) + 1;

        const today = new Date().toDateString();
        const lastDate = data.lastPlayDate;
        if (lastDate !== today) {
            if (!lastDate) {
                data.dailyStreak = 1;
            } else {
                const last = new Date(lastDate);
                const now = new Date();
                const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    data.dailyStreak = (data.dailyStreak || 0) + 1;
                } else if (diffDays > 1) {
                    data.dailyStreak = 1;
                }
            }
            data.lastPlayDate = today;
        }

        localStorage.setItem(storageKey, JSON.stringify(data));
    } catch(e) {}
}
function loadWordStats() {
    try {
        const storageKey = getPlayerStorageKey('englishFunWordStats');
        wordStats = JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch(e) {
        wordStats = {};
    }
}

function saveWordStats() {
    try {
        const storageKey = getPlayerStorageKey('englishFunWordStats');
        localStorage.setItem(storageKey, JSON.stringify(wordStats));
    } catch(e) {}
}

function updateWordStat(word, isCorrect) {
    const wordCategory = word.originalCategory || currentCategory;
    const key = `${wordCategory}_${word.english}`;
    if (!wordStats[key]) {
        wordStats[key] = { correct: 0, wrong: 0, lastSeen: 0, streak: 0 };
    }
    
    const stat = wordStats[key];
    stat.lastSeen = Date.now();
    
    if (isCorrect) {
        stat.correct++;
        stat.streak++;
    } else {
        stat.wrong++;
        stat.streak = 0;
    }
    
    saveWordStats();
}

function getWordPriority(word) {
    const wordCategory = word.originalCategory || currentCategory;
    const key = `${wordCategory}_${word.english}`;
    const stat = wordStats[key];
    
    if (!stat) return 10;
    
    // Palavras erradas recentemente ganham prioridade
    const recencyBonus = stat.wrong > stat.correct ? 20 : 0;
    const streakPenalty = stat.streak > 3 ? -5 : 0;
    
    return stat.wrong * 5 + recencyBonus + streakPenalty;
}

function getWordsForReview(words, count) {
    loadWordStats();
    
    // Calcular prioridade para cada palavra
    const wordsWithPriority = words.map(w => ({
        word: w,
        priority: getWordPriority(w)
    }));
    
    // Ordenar por prioridade (maior primeiro) e embaralhar palavras com mesma prioridade
    wordsWithPriority.sort((a, b) => {
        const diff = b.priority - a.priority;
        if (diff !== 0) return diff;
        return Math.random() - 0.5;
    });
    
    // Pegar as top 'count' palavras
    return wordsWithPriority.slice(0, count).map(w => w.word);
}

// ==================== DICTATION MODE ====================
let dictationMode = false;
let currentDictationWord = null;

function showDictationQuestion() {
    if (currentQuizIndex >= quizWords.length) {
        showResult();
        return;
    }
    
    const word = quizWords[currentQuizIndex];
    currentDictationWord = word;
    
    document.getElementById('dictation-emoji').textContent = word.emoji;
    document.getElementById('dictation-hint').textContent = `Dica: ${word.portuguese}`;
    document.getElementById('current-num').textContent = currentQuizIndex + 1;
    document.getElementById('progress-fill').style.width = `${((currentQuizIndex + 1) / totalQuestions) * 100}%`;
    
    const input = document.getElementById('dictation-input');
    input.value = '';
    input.className = '';
    input.disabled = false;
    input.focus();
    
    setTimeout(() => speakWord(), 400);
}

function checkDictation() {
    const input = document.getElementById('dictation-input');
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = currentDictationWord.english.toLowerCase();
    
    input.disabled = true;
    
    if (userAnswer === correctAnswer) {
        input.classList.add('correct');
        correctAnswers++;
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        
        let points = difficultyConfig[difficulty].points;
        if (combo >= 3) points += combo * 2;
        score += points;
        document.getElementById('score').textContent = score;
        
        playSound(combo >= 3 ? 'combo' : 'correct');
        showFeedback(`✓ Correto! +${points} pontos!`, '#38ef7d');
        updateComboDisplay();
        updateWordStat(currentDictationWord, true);
        celebrateCorrect();
        checkAchievements();
        currentQuizIndex++;
        setTimeout(showDictationQuestion, 2000);
    } else {
        input.classList.add('wrong');
        wrongAnswersList.push(currentDictationWord);
        combo = 0;
        updateComboDisplay();
        updateWordStat(currentDictationWord, false);
        playSound('wrong');
        showFeedback(`✗ Errado! Resposta: ${currentDictationWord.english}`, '#f45c43');
        setTimeout(() => showModal(currentDictationWord, true), 1500);
    }
}

function handleDictationKeyPress(e) {
    if (e.key === 'Enter' && !document.getElementById('dictation-input').disabled) {
        checkDictation();
    }
}

// ==================== MEMORY GAME ====================
let memoryCategory = null;
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let memoryMoves = 0;
let memoryScore = 0;
let memoryTimer = 0;
let memoryTimerInterval = null;
let canFlip = true;

function startMemoryGame() {
    playSound('click');
    pauseMenuMusic();
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('memory-screen').style.display = 'block';
    document.getElementById('memory-category-select').style.display = 'grid';
    document.getElementById('memory-game-board').style.display = 'none';
}

function startMemoryWithCategory(category) {
    playSound('click');
    memoryCategory = category;
    matchedPairs = 0;
    memoryMoves = 0;
    memoryScore = 0;
    memoryTimer = 0;
    flippedCards = [];
    canFlip = true;
    
    document.getElementById('memory-score').textContent = '0';
    document.getElementById('memory-moves').textContent = '0';
    document.getElementById('memory-pairs').textContent = '0';
    document.getElementById('memory-time').textContent = '0';
    
    // Pegar 8 palavras aleatórias
    const allWords = vocabulary[category].words;
    const selectedWords = shuffle([...allWords]).slice(0, 8);
    
    // Criar pares (cada palavra aparece 2 vezes)
    memoryCards = [];
    selectedWords.forEach(word => {
        memoryCards.push({ id: word.english, word: word });
        memoryCards.push({ id: word.english, word: word });
    });
    
    memoryCards = shuffle(memoryCards);
    
    renderMemoryGrid();
    
    document.getElementById('memory-category-select').style.display = 'none';
    document.getElementById('memory-game-board').style.display = 'block';
    
    // Iniciar timer
    if (memoryTimerInterval) clearInterval(memoryTimerInterval);
    memoryTimerInterval = setInterval(() => {
        memoryTimer++;
        document.getElementById('memory-time').textContent = memoryTimer;
    }, 1000);
}

function renderMemoryGrid() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = memoryCards.map((card, index) => `
        <div class="memory-card" data-index="${index}" onclick="flipCard(${index})">
            <div class="memory-card-inner">
                <div class="memory-card-front">❓</div>
                <div class="memory-card-back">
                    <span class="card-emoji">${card.word.emoji}</span>
                    <span class="card-word">${card.word.english}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function flipCard(index) {
    if (!canFlip) return;
    
    const card = document.querySelector(`.memory-card[data-index="${index}"]`);
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    playSound('click');
    card.classList.add('flipped');
    flippedCards.push({ index, card, data: memoryCards[index] });
    
    if (flippedCards.length === 2) {
        canFlip = false;
        memoryMoves++;
        document.getElementById('memory-moves').textContent = memoryMoves;
        
        const [first, second] = flippedCards;
        
        if (first.data.id === second.data.id) {
            // Par encontrado!
            setTimeout(() => {
                first.card.classList.add('matched');
                second.card.classList.add('matched');
                matchedPairs++;
                memoryScore += 50;
                document.getElementById('memory-pairs').textContent = matchedPairs;
                document.getElementById('memory-score').textContent = memoryScore;
                playSound('correct');
                celebrateCorrect();
                flippedCards = [];
                canFlip = true;
                
                if (matchedPairs === 8) {
                    // Vitória!
                    setTimeout(() => {
                        clearInterval(memoryTimerInterval);
                        playSound('combo');
                        celebratePerfect();
                        showFeedback('🎉 Parabéns! Você completou o jogo da memória!', '#38ef7d', 3000);
                        
                        // Bonus por tempo
                        if (memoryTimer < 30) memoryScore += 100;
                        else if (memoryTimer < 60) memoryScore += 50;
                        document.getElementById('memory-score').textContent = memoryScore;
                        
                        // Salvar no ranking
                        saveMemoryRanking();
                        updateLocalProgress(memoryCategory, 'memory');
                    }, 500);
                }
            }, 500);
        } else {
            // Não combina
            setTimeout(() => {
                first.card.classList.remove('flipped');
                second.card.classList.remove('flipped');
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }
}

function resetMemoryGame() {
    playSound('click');
    if (memoryTimerInterval) clearInterval(memoryTimerInterval);
    document.getElementById('memory-category-select').style.display = 'grid';
    document.getElementById('memory-game-board').style.display = 'none';
}

// ==================== CONFETTI ====================
let confettiCanvas = null;
let confettiCtx = null;
let confettiParticles = [];
let confettiAnimationId = null;
let confettiInitialized = false;

function initConfetti() {
    if (confettiInitialized) return;
    confettiInitialized = true;
    confettiCanvas = document.getElementById('confetti-canvas');
    if (confettiCanvas) {
        confettiCtx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        });
    }
}

class ConfettiParticle {
    constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = Math.random() * confettiCanvas.height - confettiCanvas.height;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.color = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0'][Math.floor(Math.random() * 8)];
        this.shape = Math.floor(Math.random() * 3);
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        this.speedY += 0.05;
    }
    
    draw() {
        if (!confettiCtx) return;
        confettiCtx.save();
        confettiCtx.translate(this.x, this.y);
        confettiCtx.rotate(this.rotation * Math.PI / 180);
        confettiCtx.fillStyle = this.color;
        
        if (this.shape === 0) {
            confettiCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
        } else if (this.shape === 1) {
            confettiCtx.beginPath();
            confettiCtx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            confettiCtx.fill();
        } else {
            confettiCtx.beginPath();
            confettiCtx.moveTo(0, -this.size / 2);
            confettiCtx.lineTo(this.size / 2, this.size / 2);
            confettiCtx.lineTo(-this.size / 2, this.size / 2);
            confettiCtx.closePath();
            confettiCtx.fill();
        }
        
        confettiCtx.restore();
    }
}

function createConfetti(count = 100) {
    if (!confettiCanvas || !confettiCtx) return;
    const maxParticles = 300;
    const toAdd = Math.min(count, maxParticles - confettiParticles.length);
    for (let i = 0; i < toAdd; i++) {
        confettiParticles.push(new ConfettiParticle());
    }
    if (!confettiAnimationId) animateConfetti();
}

function animateConfetti() {
    if (!confettiCanvas || !confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    confettiParticles = confettiParticles.filter(p => p.y < confettiCanvas.height + 50);
    
    confettiParticles.forEach(p => {
        p.update();
        p.draw();
    });
    
    if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
        confettiAnimationId = null;
    }
}

function celebrateCorrect() {
    createConfetti(50);
}

function celebratePerfect() {
    createConfetti(200);
}

function celebrateCombo() {
    createConfetti(30);
}

// ==================== STAR BURST EFFECT ====================

// ==================== MEU PROGRESSO ====================
function openProgress() {
    playSound('click');
    initAudio();

    if (playerUid) {
        showProgressScreen();
    } else {
        showWelcomeScreen();
    }
}

function showProgressNicknameModal() {
    document.getElementById('start-screen').style.display = 'none';
    const modal = document.getElementById('progress-nickname-modal');
    modal.style.display = 'flex';
    const input = document.getElementById('progress-nickname-input');
    input.value = playerName || localStorage.getItem('englishFunPlayerNickname') || '';
    document.getElementById('progress-nickname-error').textContent = '';
    input.focus();
}

function confirmProgressNickname() {
    const input = document.getElementById('progress-nickname-input');
    const errorEl = document.getElementById('progress-nickname-error');
    const result = validateNickname(input.value);

    if (!result.valid) {
        errorEl.textContent = result.error;
        input.focus();
        return;
    }

    errorEl.textContent = '';
    playerName = result.value;
    localStorage.setItem('englishFunPlayerNickname', playerName);
    migrateOldProgressData();

    document.getElementById('progress-nickname-modal').style.display = 'none';
    showProgressScreen();
}

function closeProgressNicknameModal() {
    document.getElementById('progress-nickname-modal').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    resumeMenuMusic();
}

function showProgressScreen() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('progress-screen').style.display = 'block';

    const nameEl = document.getElementById('progress-player-name');
    if (nameEl) nameEl.textContent = playerName;

    loadProgressDashboard();
}

function closeProgress() {
    document.getElementById('progress-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    resumeMenuMusic();
}

function openAbout() {
    document.getElementById('landing-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('about-screen').style.display = 'block';
    pauseMenuMusic();
}

function closeAbout() {
    document.getElementById('about-screen').style.display = 'none';
    document.getElementById('landing-screen').style.display = 'flex';
    resumeMenuMusic();
}

async function loadProgressDashboard() {
    const container = document.getElementById('progress-content');
    container.innerHTML = '<div class="progress-loading" aria-live="polite">Carregando seu progresso...</div>';

    let entries = [];
    let generalPoints = 0;
    let rankingPosition = 0;
    let totalPlayers = 0;

    if (db && playerUid) {
        try {
            const histSnap = await db.ref('gameHistory/' + playerUid).once('value');
            histSnap.forEach(child => {
                entries.push(child.val());
            });

            const rankSnap = await db.ref('ranking').once('value');
            const allRankings = [];
            rankSnap.forEach(child => {
                const val = child.val();
                if (val && val.nickname) {
                    allRankings.push({
                        uid: child.key,
                        name: val.nickname,
                        generalPoints: val.totalGeneral || 0
                    });
                    if (child.key === playerUid) {
                        generalPoints = val.totalGeneral || 0;
                    }
                }
            });
            allRankings.sort((a, b) => b.generalPoints - a.generalPoints);
            totalPlayers = allRankings.length;
            const pos = allRankings.findIndex(r => r.uid === playerUid);
            rankingPosition = pos >= 0 ? pos + 1 : 0;
        } catch(e) {
            entries = JSON.parse(localStorage.getItem('englishFunRanking') || '[]');
        }
    } else {
        entries = JSON.parse(localStorage.getItem('englishFunRanking') || '[]');
        const generalRanking = buildGeneralRanking(entries);
        totalPlayers = generalRanking.length;
        const currentPlayer = generalRanking.find(p => p.uid === playerUid);
        generalPoints = currentPlayer ? currentPlayer.generalPoints : 0;
        rankingPosition = currentPlayer ? generalRanking.indexOf(currentPlayer) + 1 : 0;
    }

    const progressKey = getPlayerStorageKey('englishFunProgress');
    const progressData = JSON.parse(localStorage.getItem(progressKey) || '{}');
    if (!progressData.categories) progressData.categories = {};

    const wordStatsKey = getPlayerStorageKey('englishFunWordStats');
    const allWordStats = JSON.parse(localStorage.getItem(wordStatsKey) || '{}');

    const totalCorrectAll = progressData.totalCorrectAll || 0;
    const totalWrongAll = progressData.totalWrongAll || 0;
    const totalAnswered = totalCorrectAll + totalWrongAll;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrectAll / totalAnswered) * 100) : 0;
    const dailyStreak = progressData.dailyStreak || 0;

    let totalPlays = progressData.totalPlays || 0;
    let bestComboAll = 0;
    let perfectGamesAll = 0;
    Object.values(progressData.categories).forEach(cat => {
        if (cat.bestCombo > bestComboAll) bestComboAll = cat.bestCombo;
        perfectGamesAll += cat.perfectGames || 0;
    });

    let wordsPracticed = 0;
    let wordsStrong = 0;
    let wordsTraining = 0;
    let wordsReview = 0;
    let wordsNotPracticed = 0;
    const attentionWords = [];

    const allVocab = [];
    Object.entries(categoryData).forEach(([catKey, catData]) => {
        const catWords = getWordsForCategory(catKey);
        if (catWords) {
            catWords.forEach(w => {
                allVocab.push({ ...w, catKey });
            });
        }
    });

    allVocab.forEach(w => {
        const key = w.catKey + '_' + w.english;
        const stat = allWordStats[key];
        if (!stat || (stat.correct === 0 && stat.wrong === 0)) {
            wordsNotPracticed++;
            return;
        }
        wordsPracticed++;
        if (stat.correct >= 3 && stat.streak >= 3 && stat.correct > stat.wrong) {
            wordsStrong++;
        } else if (stat.wrong > 0 && stat.wrong >= stat.correct) {
            wordsReview++;
            attentionWords.push({ word: w.english, errors: stat.wrong, streak: stat.streak, lastSeen: stat.lastSeen || 0 });
        } else {
            wordsTraining++;
        }
    });

    attentionWords.sort((a, b) => {
        if (b.errors !== a.errors) return b.errors - a.errors;
        if (a.streak !== b.streak) return a.streak - b.streak;
        return (b.lastSeen || 0) - (a.lastSeen || 0);
    });
    const topAttention = attentionWords.slice(0, 5);

    const categoryProgress = {};
    Object.keys(categoryData).forEach(catKey => {
        categoryProgress[catKey] = {
            learn: 0,
            quiz: 0,
            dictation: 0,
            memory: 0,
            total: 0,
            percent: 0
        };
    });

    entries.forEach(entry => {
        if (entry.mode === 'review') return;
        const cat = entry.category;
        if (!categoryProgress[cat]) return;
        const gp = getGeneralPoints(entry);
        const mode = entry.mode;
        if (mode === 'learn' && gp > categoryProgress[cat].learn) categoryProgress[cat].learn = gp;
        else if (mode === 'quiz' && gp > categoryProgress[cat].quiz) categoryProgress[cat].quiz = gp;
        else if (mode === 'dictation' && gp > categoryProgress[cat].dictation) categoryProgress[cat].dictation = gp;
        else if (mode === 'memory' && gp > categoryProgress[cat].memory) categoryProgress[cat].memory = gp;
    });

    Object.keys(categoryProgress).forEach(catKey => {
        const cat = categoryProgress[catKey];
        cat.total = cat.learn + cat.quiz + cat.dictation + cat.memory;
        cat.percent = Math.max(0, Math.min(100, Math.round((cat.total / 1250) * 100)));
    });

    let recentActivities = [];
    entries.forEach(entry => {
        if (entry.mode === 'review') return;
        recentActivities.push(entry);
    });
    recentActivities.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    recentActivities = recentActivities.slice(0, 5);

    let bestCategory = null;
    let bestPercent = 0;
    Object.entries(categoryProgress).forEach(([catKey, data]) => {
        if (data.percent > bestPercent && data.total > 0) {
            bestPercent = data.percent;
            bestCategory = catKey;
        }
    });

    const hasAnyData = totalPlays > 0 || entries.length > 0;

    renderProgressDashboard({
        generalPoints,
        rankingPosition,
        totalPlayers,
        accuracy,
        dailyStreak,
        totalPlays,
        bestComboAll,
        perfectGamesAll,
        wordsPracticed,
        wordsStrong,
        wordsTraining,
        wordsReview,
        wordsNotPracticed,
        topAttention,
        categoryProgress,
        recentActivities,
        bestCategory,
        bestPercent,
        hasAnyData
    });
}

function getWordsForCategory(catKey) {
    if (typeof vocabulary === 'undefined') return [];
    const cat = vocabulary[catKey];
    if (!cat || !cat.words) return [];
    return cat.words;
}

function renderProgressDashboard(data) {
    const container = document.getElementById('progress-content');
    container.innerHTML = '';

    if (!data.hasAnyData) {
        const empty = document.createElement('div');
        empty.className = 'progress-empty';
        empty.innerHTML = '<div class="progress-empty-icon">📊</div>' +
            '<h3>SEU PROGRESSO COMEÇA AQUI</h3>' +
            '<p>Complete uma atividade para começar a acompanhar sua evolução.</p>';
        container.appendChild(empty);
        renderProgressSummaryCards(container, data);
        return;
    }

    renderProgressSummaryCards(container, data);
    renderSecondaryStats(container, data);
    renderCategoryProgressSection(container, data);
    renderVocabularySection(container, data);
    renderAttentionWords(container, data);
    renderRecentActivities(container, data);
    if (data.bestCategory) renderBestCategory(container, data);
}

function renderProgressSummaryCards(container, data) {
    const cards = document.createElement('div');
    cards.className = 'progress-summary-cards';

    cards.innerHTML =
        '<div class="progress-card">' +
            '<div class="progress-card-icon">⭐</div>' +
            '<div class="progress-card-label">PONTUAÇÃO GERAL</div>' +
            '<div class="progress-card-value">' + data.generalPoints.toLocaleString('pt-BR') + ' pts</div>' +
        '</div>' +
        '<div class="progress-card">' +
            '<div class="progress-card-icon">🏆</div>' +
            '<div class="progress-card-label">RANKING</div>' +
            '<div class="progress-card-value">' + (data.rankingPosition > 0 ? data.rankingPosition + 'º lugar' : 'Ainda sem posição') + '</div>' +
            '<div class="progress-card-sub">' + data.totalPlayers + ' jogador' + (data.totalPlayers !== 1 ? 'es' : '') + '</div>' +
        '</div>' +
        '<div class="progress-card">' +
            '<div class="progress-card-icon">🎯</div>' +
            '<div class="progress-card-label">TAXA DE ACERTO</div>' +
            '<div class="progress-card-value">' + (data.accuracy > 0 ? data.accuracy + '%' : '—') + '</div>' +
        '</div>' +
        '<div class="progress-card">' +
            '<div class="progress-card-icon">🔥</div>' +
            '<div class="progress-card-label">SEQUÊNCIA</div>' +
            '<div class="progress-card-value">' + data.dailyStreak + ' dia' + (data.dailyStreak !== 1 ? 's' : '') + '</div>' +
            '<div class="progress-card-sub">neste dispositivo</div>' +
        '</div>';

    container.appendChild(cards);
}

function renderSecondaryStats(container, data) {
    const section = document.createElement('div');
    section.className = 'progress-secondary';

    section.innerHTML =
        '<div class="progress-stat-row">' +
            '<div class="progress-stat-item">' +
                '<div class="progress-stat-value">' + data.totalPlays + '</div>' +
                '<div class="progress-stat-label">Atividades realizadas</div>' +
            '</div>' +
            '<div class="progress-stat-item">' +
                '<div class="progress-stat-value">' + data.bestComboAll + 'x</div>' +
                '<div class="progress-stat-label">Melhor sequência</div>' +
            '</div>' +
            '<div class="progress-stat-item">' +
                '<div class="progress-stat-value">' + data.perfectGamesAll + '</div>' +
                '<div class="progress-stat-label">Jogos perfeitos</div>' +
            '</div>' +
            '<div class="progress-stat-item">' +
                '<div class="progress-stat-value">' + data.wordsPracticed + '</div>' +
                '<div class="progress-stat-label">Palavras praticadas</div>' +
            '</div>' +
        '</div>';

    container.appendChild(section);
}

function renderCategoryProgressSection(container, data) {
    const section = document.createElement('div');
    section.className = 'progress-categories';

    const title = document.createElement('h3');
    title.textContent = 'PROGRESSO POR CATEGORIA';
    section.appendChild(title);

    Object.entries(categoryData).forEach(([catKey, catInfo]) => {
        const catData = data.categoryProgress[catKey];
        const row = document.createElement('div');
        row.className = 'progress-cat-row';

        const header = document.createElement('div');
        header.className = 'progress-cat-header';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'progress-cat-name';
        nameSpan.textContent = catInfo.emoji + ' ' + catInfo.name.toUpperCase();

        const ptsSpan = document.createElement('span');
        ptsSpan.className = 'progress-cat-pts';
        ptsSpan.textContent = catData.total + ' / 1250 pts';

        header.appendChild(nameSpan);
        header.appendChild(ptsSpan);
        row.appendChild(header);

        const barOuter = document.createElement('div');
        barOuter.className = 'progress-bar-outer';
        barOuter.setAttribute('role', 'progressbar');
        barOuter.setAttribute('aria-valuenow', catData.percent);
        barOuter.setAttribute('aria-valuemin', '0');
        barOuter.setAttribute('aria-valuemax', '100');
        barOuter.setAttribute('aria-label', catInfo.name + ' ' + catData.percent + '%');

        const barInner = document.createElement('div');
        barInner.className = 'progress-bar-inner';
        barInner.style.width = catData.percent + '%';
        if (catData.percent >= 80) barInner.classList.add('bar-excellent');
        else if (catData.percent >= 50) barInner.classList.add('bar-good');
        else if (catData.percent > 0) barInner.classList.add('bar-started');

        barOuter.appendChild(barInner);
        row.appendChild(barOuter);

        const details = document.createElement('div');
        details.className = 'progress-cat-details';

        const modes = [
            { key: 'learn', label: 'APRENDER' },
            { key: 'quiz', label: 'QUIZ' },
            { key: 'dictation', label: 'OUVIR' },
            { key: 'memory', label: 'MEMÓRIA' }
        ];

        modes.forEach(m => {
            const val = catData[m.key];
            const maxVal = m.key === 'learn' ? 50 : 400;
            const detail = document.createElement('span');
            detail.className = 'progress-cat-mode';
            if (val > 0) {
                detail.textContent = m.label + ' ' + val + '/' + maxVal;
            } else {
                detail.textContent = m.label + ' —';
                detail.classList.add('mode-empty');
            }
            details.appendChild(detail);
        });

        row.appendChild(details);
        section.appendChild(row);
    });

    container.appendChild(section);
}

function renderVocabularySection(container, data) {
    const section = document.createElement('div');
    section.className = 'progress-vocab';

    const title = document.createElement('h3');
    title.textContent = 'VOCABULÁRIO';
    section.appendChild(title);

    const summary = document.createElement('div');
    summary.className = 'progress-vocab-summary';

    summary.innerHTML =
        '<div class="progress-vocab-item vocab-strong">💪 ' + data.wordsStrong + ' fortes</div>' +
        '<div class="progress-vocab-item vocab-training">📘 ' + data.wordsTraining + ' em treino</div>' +
        '<div class="progress-vocab-item vocab-review">🔁 ' + data.wordsReview + ' para revisar</div>' +
        '<div class="progress-vocab-item vocab-none">○ ' + data.wordsNotPracticed + ' não praticadas</div>';

    section.appendChild(summary);
    container.appendChild(section);
}

function renderAttentionWords(container, data) {
    const section = document.createElement('div');
    section.className = 'progress-attention';

    const title = document.createElement('h3');
    title.textContent = 'PRECISAM DE ATENÇÃO';
    section.appendChild(title);

    if (data.topAttention.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'progress-attention-empty';
        empty.textContent = 'Nenhuma palavra precisa de atenção agora. 🎉';
        section.appendChild(empty);
    } else {
        const list = document.createElement('div');
        list.className = 'progress-attention-list';

        data.topAttention.forEach(w => {
            const row = document.createElement('div');
            row.className = 'progress-attention-row';

            const wordSpan = document.createElement('span');
            wordSpan.className = 'progress-attention-word';
            wordSpan.textContent = w.word;

            const errSpan = document.createElement('span');
            errSpan.className = 'progress-attention-errors';
            errSpan.textContent = w.errors + ' erro' + (w.errors !== 1 ? 's' : '');

            row.appendChild(wordSpan);
            row.appendChild(errSpan);
            list.appendChild(row);
        });

        section.appendChild(list);
    }

    container.appendChild(section);
}

function renderRecentActivities(container, data) {
    const section = document.createElement('div');
    section.className = 'progress-recent';

    const title = document.createElement('h3');
    title.textContent = 'ATIVIDADES RECENTES';
    section.appendChild(title);

    if (data.recentActivities.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'progress-recent-empty';
        empty.textContent = 'Nenhuma atividade registrada ainda.';
        section.appendChild(empty);
    } else {
        const list = document.createElement('div');
        list.className = 'progress-recent-list';

        data.recentActivities.forEach(entry => {
            const row = document.createElement('div');
            row.className = 'progress-recent-row';

            const modeLabels = { quiz: 'QUIZ', dictation: 'OUVIR E ESCREVER', learn: 'APRENDER', memory: 'MEMÓRIA' };
            const modeLabel = modeLabels[entry.mode] || entry.mode.toUpperCase();
            const catInfo = categoryData[entry.category] || { emoji: '', name: entry.category };
            const gp = getGeneralPoints(entry);

            const left = document.createElement('div');
            left.className = 'progress-recent-left';

            const modeSpan = document.createElement('span');
            modeSpan.className = 'progress-recent-mode';
            modeSpan.textContent = modeLabel + ' · ' + catInfo.name.toUpperCase();
            left.appendChild(modeSpan);

            const ptsSpan = document.createElement('span');
            ptsSpan.className = 'progress-recent-pts';
            ptsSpan.textContent = (entry.mode === 'learn' ? '+' : '') + gp + ' pts';
            left.appendChild(ptsSpan);

            const dateSpan = document.createElement('span');
            dateSpan.className = 'progress-recent-date';
            dateSpan.textContent = formatDateRelative(entry.date);

            row.appendChild(left);
            row.appendChild(dateSpan);
            list.appendChild(row);
        });

        section.appendChild(list);
    }

    container.appendChild(section);
}

function renderBestCategory(container, data) {
    const catInfo = categoryData[data.bestCategory];
    if (!catInfo) return;

    const section = document.createElement('div');
    section.className = 'progress-highlight';

    section.innerHTML =
        '<div class="progress-highlight-label">DESTAQUE</div>' +
        '<div class="progress-highlight-value">' + catInfo.name + ' · ' + data.bestPercent + '%</div>';

    container.appendChild(section);
}

function formatDateRelative(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return diffDays + ' dias atrás';
        return date.toLocaleDateString('pt-BR');
    } catch(e) {
        return '';
    }
}

// ==================== DOMContentLoaded ====================
document.addEventListener('DOMContentLoaded', () => {
    initConfetti();
    migrateOldProgressData();

    // Enter key nos inputs de auth
    document.getElementById('create-nickname').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('create-pin').focus();
    });
    document.getElementById('create-pin').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleCreatePlayer();
    });
    document.getElementById('login-nickname').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('login-pin').focus();
    });
    document.getElementById('login-pin').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Verificar sessão existente
    EFAuth.onAuthStateChanged(async (user) => {
        if (user) {
            playerUid = user.uid;
            const profile = await EFPlayer.getProfile(playerUid, db);
            if (profile) {
                playerName = profile.nickname;
            } else {
                playerName = 'Jogador';
            }
            hideAllScreens();
            document.getElementById('start-screen').style.display = 'block';
            updatePlayerBar();
            displayHomeRanking();
        } else {
            showWelcomeScreen();
        }
        playBgMusic();
    });

    document.addEventListener('click', function firstClick() {
        if (bgMusic && !bgMusicReady) {
            bgMusic.play().then(() => {
                bgMusicReady = true;
            }).catch(() => {});
        }
        document.removeEventListener('click', firstClick);
    });
});

async function displayHomeRanking() {
    const list = document.getElementById('home-ranking-list');
    if (!list) return;
    
    if (db) {
        try {
            const snapshot = await db.ref('ranking').once('value');
            const rawData = [];
            snapshot.forEach((child) => {
                const val = child.val();
                if (val && val.nickname) {
                    rawData.push({
                        uid: child.key,
                        name: val.nickname,
                        generalPoints: val.totalGeneral || 0,
                        updatedAt: val.updatedAt || 0
                    });
                }
            });
            
            rawData.sort((a, b) => b.generalPoints - a.generalPoints);
            renderHomeRanking(rawData.slice(0, 5), list);
        } catch (error) {
            renderHomeRankingLocal(list);
        }
    } else {
        renderHomeRankingLocal(list);
    }
}

function renderHomeRankingLocal(list) {
    try {
        const data = JSON.parse(localStorage.getItem('englishFunRanking') || '[]');
        const generalRanking = buildGeneralRanking(data);
        renderHomeRanking(generalRanking.slice(0, 5), list);
    } catch(e) {
        list.innerHTML = '';
        const empty = document.createElement('div');
        empty.className = 'home-ranking-empty';
        empty.textContent = 'Nenhuma pontuação ainda';
        list.appendChild(empty);
    }
}

function renderHomeRanking(data, list) {
    list.innerHTML = '';
    
    if (!data || data.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'home-ranking-empty';
        empty.textContent = 'Nenhuma pontuação ainda';
        list.appendChild(empty);
        return;
    }
    
    data.forEach((entry, i) => {
        const name = entry.name || 'Jogador';
        const gp = entry.generalPoints || 0;
        
        const pos = i + 1;
        const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}º`;
        
        const row = document.createElement('div');
        row.className = 'home-ranking-row';
        
        const posSpan = document.createElement('span');
        posSpan.className = 'home-ranking-pos';
        posSpan.textContent = medal;
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'home-ranking-name';
        nameSpan.textContent = name;
        
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'home-ranking-score';
        scoreSpan.textContent = `${gp} pts`;
        
        row.appendChild(posSpan);
        row.appendChild(nameSpan);
        row.appendChild(scoreSpan);
        list.appendChild(row);
    });
}
