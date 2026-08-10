// Estado do jogo
let currentCategory = null;
let learnWords = [];
let quizWords = [];
let currentLearnIndex = 0;
let currentQuizIndex = 0;
let score = 0;
let combo = 0;
let maxCombo = 0;
let correctAnswers = 0;
let wrongAnswersList = [];
let totalQuestions = 15;
let difficulty = 'medium';
let timeLeft = 10;
let timerInterval = null;
let audioEnabled = true;
let audioCtx = null;
let achievements = [];
let savedProgress = {};

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
    { id: 'speed_demon', name: 'Demônio da Velocidade!', icon: '⏱️', condition: (s) => s.fastAnswers >= 5 },
    { id: 'no_mistakes', name: 'Sem Erros!', icon: '✨', condition: (s) => s.correctAnswers >= 10 && s.wrongAnswers === 0 }
];

let fastAnswers = 0;
let wrongAnswers = 0;

// Inicializar áudio
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

// Falar palavra
function speakWord() {
    if (!audioEnabled) return;
    const word = learnWords[currentLearnIndex];
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word.english);
    utterance.lang = 'en-US';
    utterance.rate = currentCategory === 'sentences' ? 0.7 : 0.8;
    speechSynthesis.speak(utterance);
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

function setDifficulty(level) {
    difficulty = level;
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.level === level);
    });
}

function startGame(category) {
    initAudio();
    playSound('click');
    
    currentCategory = category;
    score = 0;
    combo = 0;
    maxCombo = 0;
    correctAnswers = 0;
    wrongAnswersList = [];
    currentLearnIndex = 0;
    currentQuizIndex = 0;
    
    const allWords = vocabulary[category].words;
    learnWords = shuffle(allWords).slice(0, totalQuestions);
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
        document.getElementById('learn-sentence').textContent = `"${word.sentence}"`;
        document.getElementById('learn-sentence').style.fontSize = '18px';
        document.getElementById('learn-sentence').style.background = '#e8f5e9';
    } else {
        document.getElementById('learn-sentence').textContent = `"${word.sentence}"`;
        document.getElementById('learn-sentence').style.fontSize = '16px';
        document.getElementById('learn-sentence').style.background = '#f5f5f5';
    }
    
    // Mostrar/esconder botão voltar
    const backBtn = document.getElementById('back-learn-btn');
    if (currentLearnIndex === 0) {
        backBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'block';
    }
    
    document.getElementById('current-num').textContent = currentLearnIndex + 1;
    document.getElementById('progress-fill').style.width = `${(currentLearnIndex / totalQuestions) * 100}%`;
    
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
        startQuiz();
    } else {
        showLearnMode();
    }
}

function startQuiz() {
    document.getElementById('learn-card').style.display = 'none';
    document.getElementById('quiz-card').style.display = 'block';
    showQuizQuestion();
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
    document.getElementById('progress-fill').style.width = `${(currentQuizIndex / totalQuestions) * 100}%`;
    
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
            if (btn.textContent === correct) btn.classList.add('correct');
        });
        
        checkAchievements();
        currentQuizIndex++;
        setTimeout(showQuizQuestion, 1000);
    } else {
        wrongAnswersList.push(word);
        combo = 0;
        updateComboDisplay();
        playSound('wrong');
        showFeedback('✗ Errado!', '#f45c43');
        
        buttons.forEach(btn => {
            if (btn.textContent === selected) btn.classList.add('wrong');
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
    showQuizQuestion();
}

function showFeedback(text, color) {
    const fb = document.getElementById('feedback');
    fb.textContent = text;
    fb.style.color = color;
    fb.className = 'show';
    setTimeout(() => fb.className = '', 1000);
}

function checkAchievements() {
    const state = { score, correctAnswers, maxCombo, fastAnswers, wrongAnswers };
    
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
    } else if (pct >= 70) {
        document.getElementById('result-emoji').textContent = '⭐';
        document.getElementById('result-message').textContent = 'Muito bem! Continue assim!';
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
    
    saveProgress();
}

function playAgain() {
    playSound('click');
    document.getElementById('result-screen').style.display = 'none';
    startGame(currentCategory);
}

function goToMenu() {
    playSound('click');
    stopTimer();
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('answer-modal').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}

function saveProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('englishFunProgress') || '{}');
        if (!data.categories) data.categories = {};
        
        const cat = currentCategory;
        if (!data.categories[cat]) data.categories[cat] = { plays: 0, bestScore: 0, totalCorrect: 0 };
        
        data.categories[cat].plays++;
        data.categories[cat].totalCorrect += correctAnswers;
        if (score > data.categories[cat].bestScore) data.categories[cat].bestScore = score;
        
        data.totalPlays = (data.totalPlays || 0) + 1;
        data.achievements = [...new Set([...(data.achievements || []), ...achievements])];
        
        localStorage.setItem('englishFunProgress', JSON.stringify(data));
    } catch(e) {}
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-screen').style.display = 'block';
});
