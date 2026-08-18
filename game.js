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
let achievements = [];
let wordStats = {};
let isReviewSession = false;
let playerName = '';

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

function showFeedback(text, color) {
    const fb = document.getElementById('feedback');
    fb.textContent = text;
    fb.style.color = color;
    fb.className = 'show';
    setTimeout(() => fb.className = '', 1000);
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
function saveRanking() {
    try {
        const key = 'englishFunRanking';
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        const correctCount = totalQuestions - wrongAnswersList.length;
        
        data.push({
            name: playerName,
            score: score,
            correct: correctCount,
            total: totalQuestions,
            maxCombo: maxCombo,
            category: currentCategory,
            mode: currentMode,
            date: new Date().toISOString()
        });
        
        // Manter apenas os 50 melhores
        data.sort((a, b) => b.score - a.score);
        localStorage.setItem(key, JSON.stringify(data.slice(0, 50)));
    } catch(e) {}
}

function displayRanking() {
    try {
        const key = 'englishFunRanking';
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        const section = document.getElementById('ranking-section');
        const table = document.getElementById('ranking-table');
        
        if (data.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        const top10 = data.slice(0, 10);
        
        table.innerHTML = top10.map((entry, i) => {
            const isYou = entry.name === playerName && entry.score === score && entry.date && 
                         new Date(entry.date).toDateString() === new Date().toDateString();
            const pos = i + 1;
            const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}º`;
            return `
                <div class="ranking-row">
                    <span class="ranking-pos">${medal}</span>
                    <span class="ranking-name">${entry.name}${isYou ? ' <span class="ranking-you">(você)</span>' : ''}</span>
                    <span class="ranking-score">${entry.score} pts</span>
                </div>
            `;
        }).join('');
    } catch(e) {
        document.getElementById('ranking-section').style.display = 'none';
    }
}

function showResult() {
    playSound('correct');
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    
    const correctCount = totalQuestions - wrongAnswersList.length;
    const pct = Math.round((correctCount / totalQuestions) * 100);
    
    document.getElementById('result-score').textContent = `Pontuação: ${score}`;
    document.getElementById('result-stats').textContent = `Acertos: ${correctCount}/${totalQuestions} | Sequência máxima: ${maxCombo}x`;
    
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
        saveRanking();
        displayRanking();
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
}

function startModeWithCategory(category) {
    playSound('click');
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
    
    // Salvar nome do último jogador
    const savedName = localStorage.getItem('englishFunPlayerName') || '';
    document.getElementById('player-name-input').value = savedName;
    
    // Mostrar tela de nome
    document.getElementById('name-screen').style.display = 'flex';
    document.getElementById('player-name-input').focus();
}

function confirmName() {
    const input = document.getElementById('player-name-input');
    playerName = input.value.trim() || 'Jogador';
    localStorage.setItem('englishFunPlayerName', playerName);
    
    playSound('click');
    document.getElementById('name-screen').style.display = 'none';
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
        alert('Nenhum erro registrado ainda! Jogue primeiro para poder revisar.');
        document.getElementById('start-screen').style.display = 'block';
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

function saveProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('englishFunProgress') || '{}');
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
        
        // Calcular streak de dias
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
        
        localStorage.setItem('englishFunProgress', JSON.stringify(data));
    } catch(e) {}
}

// ==================== SPACED REPETITION ====================
function loadWordStats() {
    try {
        wordStats = JSON.parse(localStorage.getItem('englishFunWordStats') || '{}');
    } catch(e) {
        wordStats = {};
    }
}

function saveWordStats() {
    try {
        localStorage.setItem('englishFunWordStats', JSON.stringify(wordStats));
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
                        showFeedback('🎉 Parabéns! Você completou o jogo da memória!', '#38ef7d');
                        
                        // Bonus por tempo
                        if (memoryTimer < 30) memoryScore += 100;
                        else if (memoryTimer < 60) memoryScore += 50;
                        document.getElementById('memory-score').textContent = memoryScore;
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

function initConfetti() {
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
    for (let i = 0; i < count; i++) {
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

// ==================== DOMContentLoaded ====================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-screen').style.display = 'block';
    initConfetti();
    
    // Enter key no input de nome
    document.getElementById('player-name-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') confirmName();
    });
});
