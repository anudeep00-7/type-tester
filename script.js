// Game State
let currentMode = 'az'; // 'az' or '19'
let gameActive = false;
let startTime = null;
let currentIndex = 0;
let timerInterval = null;
let bestTimes = {
    az: null,
    '19': null
};

// Sequences
const sequences = {
    az: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    '19': '123456789'.split('')
};

// DOM Elements
const azModeBtn = document.getElementById('azModeBtn');
const numModeBtn = document.getElementById('numModeBtn');
const currentTimeEl = document.getElementById('currentTime');
const bestTimeEl = document.getElementById('bestTime');
const instructionEl = document.getElementById('instruction');
const progressDisplayEl = document.getElementById('progressDisplay');
const typedCharsEl = document.getElementById('typedChars');
const currentCharEl = document.getElementById('currentChar');
const remainingCharsEl = document.getElementById('remainingChars');
const timerEl = document.getElementById('timer');
const inputIndicatorEl = document.getElementById('inputIndicator');
const resetBtn = document.getElementById('resetBtn');
const completionModal = document.getElementById('completionModal');
const modalTimeEl = document.getElementById('modalTime');
const modalMessageEl = document.getElementById('modalMessage');
const modalCloseBtn = document.getElementById('modalCloseBtn');

// Initialize
function init() {
    updateDisplay();
    updateBestTimeDisplay();
}

// Mode Selection
azModeBtn.addEventListener('click', () => switchMode('az'));
numModeBtn.addEventListener('click', () => switchMode('19'));

function switchMode(mode) {
    if (gameActive) return; // Don't switch during game

    currentMode = mode;

    // Update button states
    if (mode === 'az') {
        azModeBtn.classList.add('active');
        numModeBtn.classList.remove('active');
    } else {
        numModeBtn.classList.add('active');
        azModeBtn.classList.remove('active');
    }

    resetGame();
}

// Game Logic
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    // Ignore if modal is open
    if (completionModal.classList.contains('show')) return;

    const expectedChar = sequences[currentMode][currentIndex];
    const pressedKey = e.key.toUpperCase();

    // Only start the game if the correct first character is pressed
    if (!gameActive) {
        if (pressedKey === expectedChar) {
            startGame();
        } else {
            // Ignore key presses that aren't the expected character
            return;
        }
    }

    if (pressedKey === expectedChar) {
        currentIndex++;
        updateDisplay();

        // Check if completed
        if (currentIndex >= sequences[currentMode].length) {
            endGame();
        }
    }
}

function startGame() {
    gameActive = true;
    startTime = performance.now();
    currentIndex = 0;

    // Hide instruction
    instructionEl.classList.add('hidden');

    // Show progress display
    progressDisplayEl.classList.remove('hidden');

    // Start timer
    timerInterval = setInterval(updateTimer, 10); // Update every 10ms for smooth display
}

function updateTimer() {
    if (!gameActive || !startTime) return;

    const elapsed = (performance.now() - startTime) / 1000;
    timerEl.textContent = elapsed.toFixed(3);
    currentTimeEl.textContent = elapsed.toFixed(3) + 's';
}

function updateDisplay() {
    const sequence = sequences[currentMode];

    if (!gameActive) {
        // Initial state
        typedCharsEl.textContent = '';
        currentCharEl.textContent = sequence[0];
        remainingCharsEl.textContent = sequence.slice(1).join('');
        timerEl.textContent = '0.000';
        currentTimeEl.textContent = '0.000s';
    } else {
        // During game
        typedCharsEl.textContent = sequence.slice(0, currentIndex).join('');
        currentCharEl.textContent = sequence[currentIndex] || '';
        remainingCharsEl.textContent = sequence.slice(currentIndex + 1).join('');
    }
}

function endGame() {
    gameActive = false;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    const finalTime = (performance.now() - startTime) / 1000;

    // Update best time
    if (bestTimes[currentMode] === null || finalTime < bestTimes[currentMode]) {
        bestTimes[currentMode] = finalTime;
        updateBestTimeDisplay();
        showCompletionModal(finalTime, true);
    } else {
        showCompletionModal(finalTime, false);
    }
}

function updateBestTimeDisplay() {
    const bestTime = bestTimes[currentMode];
    if (bestTime !== null) {
        bestTimeEl.textContent = bestTime.toFixed(3) + 's';
    } else {
        bestTimeEl.textContent = '--';
    }
}

function showCompletionModal(time, isNewRecord) {
    modalTimeEl.textContent = time.toFixed(3) + 's';

    if (isNewRecord) {
        modalMessageEl.innerHTML = '🎯 <strong>New Personal Best!</strong><br>Amazing work!';
    } else {
        const bestTime = bestTimes[currentMode];
        const difference = time - bestTime;
        modalMessageEl.innerHTML = `You were <strong>${difference.toFixed(3)}s</strong> slower than your best.<br>Keep practicing!`;
    }

    completionModal.classList.add('show');

    // Add celebration effect
    if (isNewRecord) {
        createConfetti();
    }
}

function hideCompletionModal() {
    completionModal.classList.remove('show');
    resetGame();
}

modalCloseBtn.addEventListener('click', hideCompletionModal);

// Click outside modal to close
completionModal.addEventListener('click', (e) => {
    if (e.target === completionModal) {
        hideCompletionModal();
    }
});

// Reset Game
resetBtn.addEventListener('click', resetGame);

function resetGame() {
    gameActive = false;
    currentIndex = 0;
    startTime = null;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Reset display
    instructionEl.classList.remove('hidden');
    progressDisplayEl.classList.remove('hidden');
    updateDisplay();
}

// Confetti Effect (simple version)
function createConfetti() {
    const colors = ['#7B61FF', '#4299E1', '#F687B3', '#48BB78'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.zIndex = '9999';
            confetti.style.pointerEvents = 'none';
            confetti.style.opacity = '1';

            document.body.appendChild(confetti);

            const duration = 2000 + Math.random() * 1000;
            const fallDistance = window.innerHeight + 20;
            const drift = (Math.random() - 0.5) * 200;

            confetti.animate([
                {
                    transform: 'translateY(0) translateX(0) rotate(0deg)',
                    opacity: 1
                },
                {
                    transform: `translateY(${fallDistance}px) translateX(${drift}px) rotate(${Math.random() * 720}deg)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            setTimeout(() => {
                document.body.removeChild(confetti);
            }, duration);
        }, i * 30);
    }
}

// Prevent space key from scrolling
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameActive) {
        e.preventDefault();
    }
});

// Initialize on load
init();
