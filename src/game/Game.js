import { CONFIG } from '../constants';
import { UI } from './UI';
import { Guide } from './Guide';
import confetti from 'canvas-confetti';

export class Game {
    constructor() {
        this.ui = new UI('app');
        this.guide = null;
        this.sequence = [];
        this.playerInput = [];
        this.round = 0;
        this.isPlaying = false;
        this.isWaitingForInput = false;
    }

    init() {
        this.ui.init();

        // Initialize Guide attach to machine container for relative positioning
        this.guide = new Guide(this.ui.machineContainer, () => {
            this.runGameLoop();
        });
        this.guide.init();

        this.ui.showMessage('Press Start to Play');
        this.bindEvents();

        // Add a start button for now
        const startBtn = document.createElement('button');
        startBtn.textContent = 'Start Game';
        startBtn.className = 'start-btn';
        startBtn.onclick = () => this.startGame();
        document.getElementById('app').appendChild(startBtn);
    }

    bindEvents() {
        this.ui.onButtonClick((color) => this.handleInput(color));
    }

    startGame() {
        const settings = this.ui.getSettings();
        this.config = { ...CONFIG, ...settings };

        document.querySelector('.start-btn').style.display = 'none';
        document.querySelector('.settings-panel').style.display = 'none'; // Hide settings during game

        // Trigger Cup Animation


        // Start Guide Sequence
        this.guide.start();
    }


    runGameLoop() {
        this.sequence = [];
        this.round = 0;
        this.isPlaying = true;

        // Generate initial sequence based on start count
        // But logic says "each round... more colors". 
        // Usually round 1 has N colors.
        // Let's implement: Round 0 -> prepare. Next Round 1.
        // Wait, the existing logic adds 1 color per round.
        // So if start count is 3, we should prepare 2 and then nextRound adds 1? 
        // Or just clear sequence and push 'startCount' items.

        // Let's seed initial sequence
        for (let i = 0; i < this.config.startCount - 1; i++) {
            const randomColor = CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
            this.sequence.push(randomColor);
        }

        this.nextRound();
    }

    nextRound() {
        this.round++;
        this.playerInput = [];
        this.ui.showMessage(`Round ${this.round}`);

        // Add new color
        const randomColor = CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
        this.sequence.push(randomColor);

        // Calculate speed based on round? "each round will be faster"
        // Initial display time from config, reduce by 5% each round?
        const speed = Math.max(200, this.config.displayTime * Math.pow(CONFIG.SPEED_INCREMENT, this.round - 1));

        setTimeout(() => this.playSequence(speed), 1000);
    }

    async playSequence(speed) {
        this.isWaitingForInput = false;
        this.ui.showMessage('Watch...');

        for (const color of this.sequence) {
            await new Promise(resolve => setTimeout(resolve, speed));
            this.ui.highlightButton(color);
            await new Promise(resolve => setTimeout(resolve, 200)); // Gap between flashes
        }

        this.ui.showMessage('Your Turn!');
        this.isWaitingForInput = true;
    }

    handleInput(color) {
        if (!this.isWaitingForInput) return;

        this.playerInput.push(color);

        // Check correctness
        const currentIndex = this.playerInput.length - 1;
        if (this.playerInput[currentIndex] !== this.sequence[currentIndex]) {
            this.gameOver();
            return;
        }

        // Check completion
        if (this.playerInput.length === this.sequence.length) {
            this.isWaitingForInput = false;
            this.ui.showMessage('Correct!');

            // Check for Win Condition
            if (this.round >= this.config.maxRounds) {
                this.handleWin();
                return;
            }

            // Show motivational dog before next round
            setTimeout(() => {
                this.guide.showMotivation(() => {
                    this.nextRound();
                });
            }, 500);
        }
    }

    triggerCupAnimation() {
        const cup = document.querySelector('.cup-image');
        if (cup) {
            cup.classList.remove('cup-rocking');
            void cup.offsetWidth; // Trigger reflow
            cup.classList.add('cup-rocking');
        }
    }

    handleWin() {
        this.isPlaying = false;
        confetti({
            particleCount: 250,
            spread: 80,
            origin: { y: 0.6 }
        });
        this.triggerCupAnimation();

        setTimeout(() => {
            this.guide.showWin(() => {
                this.round = 0;
                this.sequence = [];
                this.playerInput = [];
                this.ui.showMessage(`You Win!`);
                document.querySelector('.start-btn').style.display = 'inline-block';
                document.querySelector('.settings-panel').style.display = 'block';
            });
        }, 1000);
    }

    gameOver() {
        this.isPlaying = false;
        this.isWaitingForInput = false;

        // Hide game buttons or active states if any? 
        // Just show the dog.
        this.guide.showGameOver(() => {
            // Reset and show start button/settings again
            this.ui.showMessage(`Game Over! Score: ${this.round}`);
            document.querySelector('.start-btn').style.display = 'inline-block';
            document.querySelector('.settings-panel').style.display = 'none';

            // Or maybe restart immediately? 
            // The flow implies "Try Again" -> Resets game state to start screen.
            this.round = 0;
            this.sequence = [];
            this.playerInput = [];
        });
    }
}
