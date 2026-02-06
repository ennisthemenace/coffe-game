import dog1Src from '../../assets/dog1.png';
import dog2Src from '../../assets/dog2.png';
import sadDogSrc from '../../assets/sad-dog.png';
import barkSrc from '../../assets/bark.mp4';
import whimperSrc from '../../assets/whimper.mp3';

export class Guide {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.element = null;
        this.bubble = null;
        this.dogImage = null; // Store ref to img
        this.audio = new Audio(barkSrc);
        this.whimperAudio = new Audio(whimperSrc);
        this.step = 0;
        this.isMotivational = false; // Flag to track mode
        this.onMotivationComplete = null;

        this.dialogs = [
            "Oh no! Bjørn has neglected to service the coffee machine once again, the fate of our productivity is now in your hands!",
            "Memorize the color sequences and click them in again to fix the coffee machine and save the day"
        ];

        this.motivations = [
            "You're a good boy! Keep it up!",
            "Amazing memory!",
            "Woof! Great job!",
            "Pawsome work!",
            "You're crushing it! Bark!"
        ];
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'guide-dog';

        this.dogImage = document.createElement('img');
        this.dogImage.src = dog1Src;
        this.dogImage.className = 'dog-image';
        this.element.appendChild(this.dogImage);

        this.bubble = document.createElement('div');
        this.bubble.className = 'speech-bubble';
        this.element.appendChild(this.bubble);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'guide-next-btn';
        nextBtn.textContent = 'Next';
        nextBtn.onclick = () => this.nextStep();
        this.bubble.appendChild(nextBtn);

        // Initial state: hidden
        this.element.style.display = 'none';
        this.container.appendChild(this.element);
    }

    start() {
        this.step = 0;
        this.isMotivational = false; // Reset mode
        this.dogImage.src = dog1Src; // Always start with dog1
        this.element.style.display = 'flex';
        this.updateDialog();
        this.playBark();
    }

    playBark() {
        // Reset and play
        this.audio.currentTime = 0;
        this.audio.play().catch(e => console.log('Audio play failed (user interaction needed?):', e));
    }

    updateDialog() {
        if (this.step < this.dialogs.length) {
            // Keep the button, update text node only? Or rebuild content.
            // Let's rebuild for simplicity, keeping the next button.
            this.bubble.innerHTML = `<p>${this.dialogs[this.step]}</p>`;

            const nextBtn = document.createElement('button');
            nextBtn.className = 'guide-next-btn';
            nextBtn.textContent = this.step === this.dialogs.length - 1 ? "Let's Go!" : "Next";
            nextBtn.onclick = () => this.nextStep();
            this.bubble.appendChild(nextBtn);
        }
    }

    nextStep() {
        this.step++;
        if (this.step >= this.dialogs.length) {
            this.finish();
        } else {
            this.playBark();
            this.updateDialog();
        }
    }

    finish() {
        this.element.style.display = 'none';
        if (this.isMotivational && this.onMotivationComplete) {
            this.onMotivationComplete();
            this.isMotivational = false;
        } else if (this.onComplete) {
            this.onComplete();
        }
    }

    showMotivation(callback) {
        this.isMotivational = true;
        this.onMotivationComplete = callback;
        this.element.style.display = 'flex';

        // Random Dog
        const useDog2 = Math.random() > 0.5;
        this.dogImage.src = useDog2 ? dog2Src : dog1Src;

        // Random Text
        const msg = this.motivations[Math.floor(Math.random() * this.motivations.length)];

        this.bubble.innerHTML = `<p>${msg}</p>`;

        const nextBtn = document.createElement('button');
        nextBtn.className = 'guide-next-btn';
        nextBtn.textContent = 'Next Round';
        nextBtn.onclick = () => this.finish();
        this.bubble.appendChild(nextBtn);

        this.playBark();
    }

    showGameOver(callback) {
        this.element.style.display = 'flex';

        // Sad Dog
        this.dogImage.src = sadDogSrc;

        // Sad Text
        this.bubble.innerHTML = `<p>Better luck next time, I guess the team will have to try and funciton without coffee.</p>`;

        const tryAgainBtn = document.createElement('button');
        tryAgainBtn.className = 'guide-next-btn';
        tryAgainBtn.textContent = 'Try Again';
        tryAgainBtn.onclick = () => {
            this.element.style.display = 'none';
            if (callback) callback();
        };
        this.bubble.appendChild(tryAgainBtn);

        // Play Whimper
        this.whimperAudio.currentTime = 0;
        this.whimperAudio.play().catch(e => console.log('Audio play failed:', e));
    }

    showWin(callback) {
        this.element.style.display = 'flex';

        // Happy Dog (use Dog 1 or 2)
        this.dogImage.src = Math.random() > 0.5 ? dog1Src : dog2Src;

        this.bubble.innerHTML = `<p>You have saved the day and harnesed the power of We! CoffWee....</p>`;

        const playAgainBtn = document.createElement('button');
        playAgainBtn.className = 'guide-next-btn';
        playAgainBtn.textContent = 'Play Again';
        playAgainBtn.onclick = () => {
            this.element.style.display = 'none';
            if (callback) callback();
        };
        // Clear previous buttons if any (innerHTML does that)
        this.bubble.appendChild(playAgainBtn);

        this.playBark();
    }
}
