import { CONFIG } from '../constants';
import machineSrc from '../../assets/machine.png';

export class UI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.machineContainer = null;
        this.overlays = {};
        this.sequenceDisplay = null;
        this.messageDisplay = null;
    }

    init() {
        this.container.innerHTML = '';

        // Create Machine Container
        this.machineContainer = document.createElement('div');
        this.machineContainer.className = 'machine-container';

        // Image
        const img = document.createElement('img');
        img.src = machineSrc;
        img.className = 'machine-image';
        img.alt = 'Coffee Machine';
        this.machineContainer.appendChild(img);

        // Cup Image
        const cupImg = document.createElement('img');
        cupImg.src = '../../assets/cup.png';
        cupImg.className = 'cup-image';
        this.machineContainer.appendChild(cupImg);

        // Overlays Container
        const overlayContainer = document.createElement('div');
        overlayContainer.className = 'overlay-container';

        // Create Buttons (Generic Grid for now since we don't know exact positions)
        // We will position them absolutely relative to the image container
        CONFIG.COLORS.forEach((color, index) => {
            const btn = document.createElement('button');
            btn.className = `machine-btn btn-${color}`;
            btn.dataset.color = color;
            btn.style.setProperty('--btn-color', color);
            overlayContainer.appendChild(btn);
            this.overlays[color] = btn;
        });

        this.machineContainer.appendChild(overlayContainer);
        this.container.appendChild(this.machineContainer);

        // Sequence / Message Display
        this.messageDisplay = document.createElement('div');
        this.messageDisplay.className = 'game-message';
        this.container.appendChild(this.messageDisplay);

        this.createSettingsPanel();
    }

    createSettingsPanel() {
        const settingsDiv = document.createElement('div');
        // hide settings panel
        settingsDiv.style.display = 'none';
        settingsDiv.className = 'settings-panel';
        settingsDiv.innerHTML = `
      <h3>Settings</h3>
      <label>
        Start Count: 
        <input type="number" id="setting-count" value="${CONFIG.START_COUNT}" min="1" max="10">
      </label>
      <label>
        Speed (ms): 
        <input type="number" id="setting-speed" value="${CONFIG.DISPLAY_TIME}" step="100" min="200">
      </label>
      <label>
        Max Rounds: 
        <input type="number" id="setting-max" value="${CONFIG.MAX_ROUNDS}" min="1" max="20">
      </label>
    `;
        this.container.appendChild(settingsDiv);
    }

    getSettings() {
        return {
            startCount: parseInt(document.getElementById('setting-count').value, 10),
            displayTime: parseInt(document.getElementById('setting-speed').value, 10),
            maxRounds: parseInt(document.getElementById('setting-max').value, 5),
        };
    }

    showMessage(msg) {
        this.messageDisplay.textContent = msg;
    }

    highlightButton(color) {
        const btn = this.overlays[color];
        if (btn) {
            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 300);
        }
    }

    onButtonClick(callback) {
        Object.values(this.overlays).forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                this.highlightButton(color); // Visual feedback immediately
                callback(color);
            });
        });
    }
}
