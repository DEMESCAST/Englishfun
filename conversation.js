// conversation.js - Modo CONVERSE EM INGLÊS
// Copyright (c) 2026 DEMESCAST. Todos os direitos reservados.

const conversationData = {
    categories: [
        {
            id: 'first-steps',
            name: 'PRIMEIROS PASSOS',
            emoji: '\uD83D\uDC4B',
            cssClass: 'conv-cat-1',
            levels: [
                {
                    level: 1,
                    conversations: [
                        {
                            character: '\uD83D\uDC66',
                            speech: 'Hello!',
                            translation: 'Olá!',
                            options: [
                                { text: 'Hi!', correct: true },
                                { text: 'Good night.', correct: false },
                                { text: 'Thank you.', correct: false }
                            ],
                            feedback: 'Great! Hello and Hi are both greetings!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'Good morning!',
                            translation: 'Bom dia!',
                            options: [
                                { text: 'Good night!', correct: false },
                                { text: 'Good morning!', correct: true },
                                { text: 'Goodbye!', correct: false }
                            ],
                            feedback: 'Nice! Good morning is used in the morning.'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'My name is Arthur. What\'s your name?',
                            translation: 'Meu nome é Arthur. Qual é o seu nome?',
                            options: [
                                { text: 'My name is John.', correct: true },
                                { text: 'I like pizza.', correct: false },
                                { text: 'Good morning.', correct: false }
                            ],
                            feedback: 'Perfect! You can introduce yourself!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'Nice to meet you!',
                            translation: 'Prazer em conhecê-lo!',
                            options: [
                                { text: 'Nice to meet you too!', correct: true },
                                { text: 'Goodbye!', correct: false },
                                { text: 'I don\'t know.', correct: false }
                            ],
                            feedback: 'Excellent! A polite response!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'How are you?',
                            translation: 'Como vai você?',
                            options: [
                                { text: 'I\'m fine, thanks!', correct: true },
                                { text: 'My name is Leo.', correct: false },
                                { text: 'It\'s blue.', correct: false }
                            ],
                            feedback: 'Great! I\'m fine is a common response.'
                        }
                    ]
                },
                {
                    level: 2,
                    conversations: [
                        {
                            character: '\uD83D\uDC67',
                            speech: 'Hi! My name is Maria. And you?',
                            translation: 'Olá! Meu nome é Maria. E você?',
                            options: [
                                { text: 'My name is Pedro.', correct: true },
                                { text: 'I like games.', correct: false },
                                { text: 'Good morning!', correct: false }
                            ],
                            feedback: 'Perfect! You introduced yourself!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'Good afternoon!',
                            translation: 'Boa tarde!',
                            options: [
                                { text: 'Good afternoon!', correct: true },
                                { text: 'Good night!', correct: false },
                                { text: 'Thank you!', correct: false }
                            ],
                            feedback: 'Nice! Good afternoon is used from noon to evening.'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'How old are you?',
                            translation: 'Quantos anos você tem?',
                            options: [
                                { text: 'I am 10 years old.', correct: true },
                                { text: 'I am happy.', correct: false },
                                { text: 'I like games.', correct: false }
                            ],
                            feedback: 'Great! You answered about your age!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'What\'s your favorite color?',
                            translation: 'Qual é a sua cor favorita?',
                            options: [
                                { text: 'My favorite color is blue.', correct: true },
                                { text: 'I am 10 years old.', correct: false },
                                { text: 'Good morning!', correct: false }
                            ],
                            feedback: 'Excellent! You talked about your favorite color!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'See you later!',
                            translation: 'Até mais!',
                            options: [
                                { text: 'See you later!', correct: true },
                                { text: 'Good morning!', correct: false },
                                { text: 'My name is Ana.', correct: false }
                            ],
                            feedback: 'Perfect! A common farewell!'
                        }
                    ]
                }
            ]
        },
        {
            id: 'introduction',
            name: 'APRESENTAÇÃO',
            emoji: '\uD83D\uDC66',
            cssClass: 'conv-cat-2',
            levels: [
                {
                    level: 1,
                    conversations: [
                        {
                            character: '\uD83D\uDC66',
                            speech: 'What\'s your name?',
                            translation: 'Qual é o seu nome?',
                            options: [
                                { text: 'My name is Lucas.', correct: true },
                                { text: 'I like pizza.', correct: false },
                                { text: 'It\'s 10 o\'clock.', correct: false }
                            ],
                            feedback: 'Great! You introduced yourself!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'How old are you?',
                            translation: 'Quantos anos você tem?',
                            options: [
                                { text: 'I am 12 years old.', correct: true },
                                { text: 'I am fine.', correct: false },
                                { text: 'My name is Ana.', correct: false }
                            ],
                            feedback: 'Perfect! You answered about your age!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'Where are you from?',
                            translation: 'De onde você é?',
                            options: [
                                { text: 'I am from Brazil.', correct: true },
                                { text: 'I am 10 years old.', correct: false },
                                { text: 'I like games.', correct: false }
                            ],
                            feedback: 'Excellent! You said where you\'re from!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'What do you like?',
                            translation: 'O que você gosta?',
                            options: [
                                { text: 'I like video games.', correct: true },
                                { text: 'I am from Brazil.', correct: false },
                                { text: 'Good morning!', correct: false }
                            ],
                            feedback: 'Nice! You shared your hobby!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'Do you like English?',
                            translation: 'Você gosta de inglês?',
                            options: [
                                { text: 'Yes, I like English!', correct: true },
                                { text: 'No, I am 10.', correct: false },
                                { text: 'My name is Pedro.', correct: false }
                            ],
                            feedback: 'Great! English is fun!'
                        }
                    ]
                },
                {
                    level: 2,
                    conversations: [
                        {
                            character: '\uD83D\uDC67',
                            speech: 'Nice to meet you! I\'m Sofia.',
                            translation: 'Prazer em conhecê-lo! Eu sou a Sofia.',
                            options: [
                                { text: 'Nice to meet you too! I\'m Lucas.', correct: true },
                                { text: 'Good night!', correct: false },
                                { text: 'I like pizza.', correct: false }
                            ],
                            feedback: 'Perfect introduction!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'What grade are you in?',
                            translation: 'Em que ano você está?',
                            options: [
                                { text: 'I am in 5th grade.', correct: true },
                                { text: 'I am 10 years old.', correct: false },
                                { text: 'I like games.', correct: false }
                            ],
                            feedback: 'Nice! You talked about school!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'What\'s your favorite subject?',
                            translation: 'Qual é sua matéria favorita?',
                            options: [
                                { text: 'My favorite subject is Math.', correct: true },
                                { text: 'I am from Brazil.', correct: false },
                                { text: 'Good morning!', correct: false }
                            ],
                            feedback: 'Excellent! You shared about school!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'Do you have any pets?',
                            translation: 'Você tem pets?',
                            options: [
                                { text: 'Yes, I have a dog.', correct: true },
                                { text: 'No, I am 10.', correct: false },
                                { text: 'My name is Pedro.', correct: false }
                            ],
                            feedback: 'Great! You talked about pets!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'What\'s your favorite food?',
                            translation: 'Qual é sua comida favorita?',
                            options: [
                                { text: 'My favorite food is pizza.', correct: true },
                                { text: 'I like Math.', correct: false },
                                { text: 'Good night!', correct: false }
                            ],
                            feedback: 'Nice! Pizza is delicious!'
                        }
                    ]
                }
            ]
        },
        {
            id: 'daily-life',
            name: 'DIA A DIA',
            emoji: '\uD83C\uDFE0',
            cssClass: 'conv-cat-3',
            levels: [
                {
                    level: 1,
                    conversations: [
                        {
                            character: '\uD83D\uDC66',
                            speech: 'What time do you wake up?',
                            translation: 'Que horas você acorda?',
                            options: [
                                { text: 'I wake up at 7 AM.', correct: true },
                                { text: 'I like pizza.', correct: false },
                                { text: 'Good morning!', correct: false }
                            ],
                            feedback: 'Great! You talked about your routine!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'What do you eat for breakfast?',
                            translation: 'O que você come no café da manhã?',
                            options: [
                                { text: 'I eat bread and milk.', correct: true },
                                { text: 'I wake up at 7.', correct: false },
                                { text: 'I like games.', correct: false }
                            ],
                            feedback: 'Nice! A healthy breakfast!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'How do you go to school?',
                            translation: 'Como você vai para a escola?',
                            options: [
                                { text: 'I go to school by bus.', correct: true },
                                { text: 'I eat bread.', correct: false },
                                { text: 'Good night!', correct: false }
                            ],
                            feedback: 'Excellent! You described your transportation!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'What do you do after school?',
                            translation: 'O que você faz depois da escola?',
                            options: [
                                { text: 'I play video games.', correct: true },
                                { text: 'I go to school.', correct: false },
                                { text: 'I wake up.', correct: false }
                            ],
                            feedback: 'Nice! Games are fun!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'What time do you go to bed?',
                            translation: 'Que horas você dorme?',
                            options: [
                                { text: 'I go to bed at 9 PM.', correct: true },
                                { text: 'I play games.', correct: false },
                                { text: 'I eat dinner.', correct: false }
                            ],
                            feedback: 'Great! A good bedtime!'
                        }
                    ]
                }
            ]
        },
        {
            id: 'food',
            name: 'COMIDAS',
            emoji: '\uD83C\uDF4E',
            cssClass: 'conv-cat-4',
            levels: [
                {
                    level: 1,
                    conversations: [
                        {
                            character: '\uD83D\uDC66',
                            speech: 'What\'s your favorite food?',
                            translation: 'Qual é sua comida favorita?',
                            options: [
                                { text: 'I like pizza.', correct: true },
                                { text: 'I am 10 years old.', correct: false },
                                { text: 'Good morning!', correct: false }
                            ],
                            feedback: 'Great! Pizza is delicious!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'Do you like ice cream?',
                            translation: 'Você gosta de sorvete?',
                            options: [
                                { text: 'Yes, I love ice cream!', correct: true },
                                { text: 'No, I am fine.', correct: false },
                                { text: 'My name is Ana.', correct: false }
                            ],
                            feedback: 'Nice! Ice cream is yummy!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'I want water, please.',
                            translation: 'Eu quero água, por favor.',
                            options: [
                                { text: 'Here you go!', correct: true },
                                { text: 'I like pizza.', correct: false },
                                { text: 'Good night!', correct: false }
                            ],
                            feedback: 'Excellent! A polite request!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'Do you like vegetables?',
                            translation: 'Você gosta de legumes?',
                            options: [
                                { text: 'Yes, I like carrots.', correct: true },
                                { text: 'No, I want water.', correct: false },
                                { text: 'I am 10.', correct: false }
                            ],
                            feedback: 'Great! Vegetables are healthy!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'I don\'t like milk.',
                            translation: 'Eu não gosto de leite.',
                            options: [
                                { text: 'That\'s okay!', correct: true },
                                { text: 'I want milk.', correct: false },
                                { text: 'Good morning!', correct: false }
                            ],
                            feedback: 'Nice! It\'s okay not to like something.'
                        }
                    ]
                }
            ]
        },
        {
            id: 'games',
            name: 'GAMES E DIVERSÃO',
            emoji: '\uD83C\uDFAE',
            cssClass: 'conv-cat-5',
            levels: [
                {
                    level: 1,
                    conversations: [
                        {
                            character: '\uD83D\uDC66',
                            speech: 'Do you like video games?',
                            translation: 'Você gosta de videogames?',
                            options: [
                                { text: 'Yes, I love games!', correct: true },
                                { text: 'No, I like milk.', correct: false },
                                { text: 'I am 10 years old.', correct: false }
                            ],
                            feedback: 'Great! Games are fun!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'Let\'s play together!',
                            translation: 'Vamos jogar juntos!',
                            options: [
                                { text: 'Okay, let\'s go!', correct: true },
                                { text: 'I don\'t like games.', correct: false },
                                { text: 'Good night!', correct: false }
                            ],
                            feedback: 'Nice! Playing together is fun!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'What\'s your favorite game?',
                            translation: 'Qual é seu jogo favorito?',
                            options: [
                                { text: 'My favorite game is Minecraft.', correct: true },
                                { text: 'I like milk.', correct: false },
                                { text: 'Good morning!', correct: false }
                            ],
                            feedback: 'Excellent! Minecraft is popular!'
                        },
                        {
                            character: '\uD83D\uDC67',
                            speech: 'This game is so fun!',
                            translation: 'Esse jogo é muito divertido!',
                            options: [
                                { text: 'Yes, it is!', correct: true },
                                { text: 'No, it\'s not.', correct: false },
                                { text: 'I want water.', correct: false }
                            ],
                            feedback: 'Great! Fun is important!'
                        },
                        {
                            character: '\uD83D\uDC66',
                            speech: 'Do you want to play again?',
                            translation: 'Você quer jogar de novo?',
                            options: [
                                { text: 'Yes, let\'s play again!', correct: true },
                                { text: 'No, I\'m tired.', correct: false },
                                { text: 'I like pizza.', correct: false }
                            ],
                            feedback: 'Nice! Playing again is fun!'
                        }
                    ]
                }
            ]
        }
    ]
};

// Estado do jogo de conversacao
let convCurrentCategory = null;
let convCurrentLevel = 0;
let convCurrentQuestion = 0;
let convScore = 0;
let convTotalQuestions = 0;
let convCorrectAnswers = 0;

function openConversation() {
    window.speechSynthesis.cancel();
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('conversation-screen').style.display = 'block';
    convScore = 0;
    convCorrectAnswers = 0;
    convTotalQuestions = 0;
    document.getElementById('conv-score').textContent = '0';
    showConversationCategories();
    pauseMenuMusic();
}

function closeConversation() {
    window.speechSynthesis.cancel();
    document.getElementById('conversation-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    convCurrentCategory = null;
    resumeMenuMusic();
}

function showConversationCategories() {
    const container = document.getElementById('conversation-content');
    let html = '<h3 style="color: white; margin-bottom: 15px;">Escolha uma categoria:</h3>';
    html += '<div class="conversation-category-grid">';
    
    conversationData.categories.forEach(function(cat) {
        html += '<button class="conversation-category-btn ' + cat.cssClass + '" onclick="startConversationCategory(\'' + cat.id + '\')">';
        html += '<span>' + cat.emoji + '</span>';
        html += '<span>' + cat.name + '</span>';
        html += '</button>';
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function startConversationCategory(categoryId) {
    convCurrentCategory = conversationData.categories.find(function(c) { return c.id === categoryId; });
    convCurrentLevel = 0;
    convCurrentQuestion = 0;
    showConversationLevel();
}

function showConversationLevel() {
    if (!convCurrentCategory || convCurrentLevel >= convCurrentCategory.levels.length) {
        showConversationComplete();
        return;
    }
    
    var level = convCurrentCategory.levels[convCurrentLevel];
    if (convCurrentQuestion >= level.conversations.length) {
        convCurrentLevel++;
        convCurrentQuestion = 0;
        showConversationLevel();
        return;
    }
    
    var conv = level.conversations[convCurrentQuestion];
    var container = document.getElementById('conversation-content');
    
    var escapedSpeech = conv.speech.replace(/'/g, "\\'");
    var escapedFeedback = conv.feedback.replace(/'/g, "\\'");
    
    var html = '<div class="conversation-card">';
    html += '<div class="conversation-level-badge">LEVEL ' + (convCurrentLevel + 1) + ' - Pergunta ' + (convCurrentQuestion + 1) + '/' + level.conversations.length + '</div>';
    html += '<div class="conversation-character">';
    html += '<div class="conversation-character-emoji">' + conv.character + '</div>';
    html += '<div class="conversation-character-text">';
    html += '<div class="conversation-character-speech">' + conv.speech + '</div>';
    html += '<div class="conversation-character-translation">' + conv.translation + '</div>';
    html += '</div>';
    html += '<button class="conversation-listen-btn" onclick="speakText(\'' + escapedSpeech + '\')" aria-label="Ouvir frase">🔊</button>';
    html += '</div>';
    html += '<div class="conversation-options">';
    
    var shuffled = conv.options.slice().sort(function() { return Math.random() - 0.5; });
    shuffled.forEach(function(opt, index) {
        var letter = String.fromCharCode(65 + index);
        html += '<button class="conversation-option-btn" onclick="checkConversationAnswer(this, ' + opt.correct + ', \'' + escapedFeedback + '\')" data-correct="' + opt.correct + '">';
        html += letter + ') ' + opt.text;
        html += '</button>';
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    
    setTimeout(function() { speakText(conv.speech); }, 500);
}

function checkConversationAnswer(btn, isCorrect, feedback) {
    window.speechSynthesis.cancel();
    var buttons = document.querySelectorAll('.conversation-option-btn');
    buttons.forEach(function(b) {
        b.disabled = true;
        if (b.dataset.correct === 'true') {
            b.classList.add('correct');
        }
    });
    
    if (isCorrect) {
        btn.classList.add('correct');
        convScore += 50;
        convCorrectAnswers++;
        showConversationFeedback('Great!', feedback, true);
    } else {
        btn.classList.add('wrong');
        showConversationFeedback('Oops!', 'The correct answer was highlighted.', false);
    }
    
    convTotalQuestions++;
    document.getElementById('conv-score').textContent = convScore;
}

function showConversationFeedback(title, message, isCorrect) {
    var container = document.getElementById('conversation-content');
    var icon = isCorrect ? '\uD83C\uDF89' : '\uD83D\uDCD6';
    var color = isCorrect ? '#11998e' : '#eb3349';
    
    var html = '<div class="conversation-card" style="animation: slideUp 0.3s ease-out;">';
    html += '<div style="font-size: 40px; margin-bottom: 10px;">' + icon + '</div>';
    html += '<div style="font-size: 22px; font-weight: bold; color: ' + color + '; margin-bottom: 8px;">' + title + '</div>';
    html += '<div style="font-size: 15px; color: #666; margin-bottom: 15px;">' + message + '</div>';
    html += '<button onclick="nextConversationQuestion()" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; border: none; padding: 12px 30px; border-radius: 25px; font-size: 15px; font-weight: bold; cursor: pointer;">Continuar</button>';
    html += '</div>';
    container.innerHTML = html;
}

function nextConversationQuestion() {
    window.speechSynthesis.cancel();
    convCurrentQuestion++;
    showConversationLevel();
}

function showConversationComplete() {
    var container = document.getElementById('conversation-content');
    var percentage = convTotalQuestions > 0 ? Math.round((convCorrectAnswers / convTotalQuestions) * 100) : 0;
    
    var html = '<div class="conversation-card">';
    html += '<div style="font-size: 60px; margin-bottom: 15px;">🏆</div>';
    html += '<h2 style="color: #333; margin-bottom: 10px;">Parabéns!</h2>';
    html += '<p style="color: #666; font-size: 16px; margin-bottom: 20px;">Você completou todas as conversas!</p>';
    html += '<div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">';
    html += '<div style="text-align: center;"><div style="font-size: 28px; font-weight: bold; color: #8b5cf6;">' + convScore + '</div><div style="font-size: 12px; color: #999;">PONTOS</div></div>';
    html += '<div style="text-align: center;"><div style="font-size: 28px; font-weight: bold; color: #11998e;">' + convCorrectAnswers + '/' + convTotalQuestions + '</div><div style="font-size: 12px; color: #999;">ACERTOS</div></div>';
    html += '<div style="text-align: center;"><div style="font-size: 28px; font-weight: bold; color: #f59e0b;">' + percentage + '%</div><div style="font-size: 12px; color: #999;">PRECISÃO</div></div>';
    html += '</div>';
    html += '<button onclick="showConversationCategories()" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; border: none; padding: 12px 30px; border-radius: 25px; font-size: 15px; font-weight: bold; cursor: pointer; margin: 5px;">Voltar às Categorias</button>';
    html += '<button onclick="closeConversation()" style="background: rgba(0,0,0,0.1); color: #333; border: none; padding: 12px 30px; border-radius: 25px; font-size: 15px; font-weight: bold; cursor: pointer; margin: 5px;">Menu</button>';
    html += '</div>';
    container.innerHTML = html;
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setTimeout(() => {
            var utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }, 50);
    }
}
