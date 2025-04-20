// Initialize questions from localStorage or use default
let questions = JSON.parse(localStorage.getItem('questions')) || [
    {
        question: "What is the capital of France?",
        options: ["Paris", "London", "Berlin", "Madrid"],
        answer: "Paris"
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        answer: "Mars"
    },
    {
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tabular Markup Language", "None of these"],
        answer: "Hyper Text Markup Language"
    },
    {
        question: "Which CSS property controls text size?",
        options: ["font-size", "text-size", "font-style", "text-font"],
        answer: "font-size"
    }
];

// Common functions
function saveQuestions() {
    localStorage.setItem('questions', JSON.stringify(questions));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Management page logic
if (window.location.pathname.includes('manage.html')) {
    const questionForm = document.getElementById('question-form');
    const questionList = document.getElementById('question-list');

    function loadQuestions() {
        questionList.innerHTML = '';
        questions.forEach((q, index) => {
            const div = document.createElement('div');
            div.classList.add('bg-gray-100', 'p-4', 'border', 'rounded-lg', 'flex', 'justify-between', 'items-center');
            div.innerHTML = `
                <div>
                    <p class="font-semibold text-gray-800">${q.question}</p>
                    <p class="text-sm text-gray-600">Answer: ${q.answer}</p>
                </div>
                <button class="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-300" onclick="deleteQuestion(${index})">
                    Delete
                </button>
            `;
            questionList.appendChild(div);
        });
    }

    questionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const questionText = document.getElementById('question-text').value.trim();
        const options = [
            document.getElementById('option1').value.trim(),
            document.getElementById('option2').value.trim(),
            document.getElementById('option3').value.trim(),
            document.getElementById('option4').value.trim()
        ];
        const correctAnswerIndex = parseInt(document.getElementById('correct-answer').value);
        const correctAnswer = options[correctAnswerIndex];

        if (!questionText || options.some(opt => !opt)) {
            alert('Please fill in all fields!');
            return;
        }

        const newQuestion = {
            question: questionText,
            options,
            answer: correctAnswer
        };

        questions.push(newQuestion);
        saveQuestions();
        questionForm.reset();
        loadQuestions();
        alert('Question added successfully!');
    });

    window.deleteQuestion = function(index) {
        if (confirm('Are you sure you want to delete this question?')) {
            questions.splice(index, 1);
            saveQuestions();
            loadQuestions();
        }
    };

    loadQuestions();
}

// Quiz page logic
if (window.location.pathname.includes('index.html') || !window.location.pathname.includes('manage.html')) {
    let filteredQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timeLeft = 30;
    let timerInterval;

    const startScreen = document.getElementById('start-screen');
    const quiz = document.getElementById('quiz');
    const results = document.getElementById('results');
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const nextBtn = document.getElementById('next-btn');
    const timeEl = document.getElementById('time');
    const scoreEl = document.getElementById('score');
    const highScoresEl = document.getElementById('high-scores');

    document.getElementById('start-btn').addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', handleNextQuestion);
    document.getElementById('restart-btn').addEventListener('click', () => {
        window.location.reload();
    });

    function startQuiz() {
        filteredQuestions = questions;
        if (filteredQuestions.length === 0) {
            alert('No questions available!');
            return;
        }

        startScreen.style.display = 'none';
        quiz.style.display = 'block';
        loadQuestion();
        startTimer();
    }

    function loadQuestion() {
        const currentQuestion = filteredQuestions[currentQuestionIndex];
        questionEl.textContent = currentQuestion.question;
        optionsEl.innerHTML = '';
        const shuffledOptions = shuffleArray([...currentQuestion.options]);
        shuffledOptions.forEach(option => {
            const div = document.createElement('div');
            div.classList.add('bg-gray-100', 'p-4', 'border', 'rounded-lg', 'cursor-pointer', 'hover:bg-gray-200');
            div.textContent = option;
            div.addEventListener('click', () => selectOption(div, option));
            optionsEl.appendChild(div);
        });
    }

    function selectOption(element, option) {
        const options = optionsEl.querySelectorAll('div');
        options.forEach(opt => opt.classList.remove('bg-green-500', 'text-white'));
        element.classList.add('bg-green-500', 'text-white');
        nextBtn.disabled = false;
    }

    function handleNextQuestion() {
        const selectedOption = optionsEl.querySelector('.bg-green-500');
        if (selectedOption && selectedOption.textContent === filteredQuestions[currentQuestionIndex].answer) {
            score++;
        }
        currentQuestionIndex++;
        if (currentQuestionIndex < filteredQuestions.length) {
            loadQuestion();
            nextBtn.disabled = true;
        } else {
            endQuiz();
        }
    }

    function endQuiz() {
        clearInterval(timerInterval);
        quiz.style.display = 'none';
        results.style.display = 'block';
        scoreEl.textContent = `${score} out of ${filteredQuestions.length}`;
        saveHighScore(score);
        displayHighScores();
    }
}