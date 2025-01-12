import Three from '/src/Three.js';
import XR from '/src/XR.js';
import UI from '/src/UI';
import Input from '/src/Input';
//import NoteReader from '/src/NoteReader';

class App {

    constructor() {
        this.three = null;
        this.xr = null;
        this.ui = null;
        this.input = null;
        this.notes = null;
        this.systems = [];
        this.previousTime = 0;
        this.update = this.#update.bind(this);
        this.bpm = 120;
        this.signature = { beatsPerMeasure: 4, beatType: 4 };
        this.notes = {
            hihat: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
            kick: [1, 2, 3, 4, 5],
            snare: [1.5, 2.5, 3.5, 4.5, 5.5],
        }
    }

    async init() {
        this.three = new Three();
        await this.three.init();
        this.systems.push(this.three);

        this.ui = new UI(this.three.scene);
        await this.ui.init();
        this.systems.push(this.ui);

        this.input = new Input(this.ui.testButton, this.three.camera);
        await this.input.init();
        this.systems.push(this.input);

        /*this.noteReader = new NoteReader(this.bpm, this.signature, this.notes);
        await this.noteReader.init();
        this.systems.push(this.noteReader);*/

        if (navigator.xr) {
            this.xr = new XR(this.three);
            let xrButtonContainer = await this.#createXRButtons();
            if (xrButtonContainer) {
                document.body.append(xrButtonContainer);
            }
            this.systems.push(this.xr);
        }
        requestAnimationFrame(this.update);
    }

    async #createXRButtons() {
        const isArSupported = await navigator.xr.isSessionSupported('immersive-ar');
        const isVrSupported = await navigator.xr.isSessionSupported('immersive-vr');
        let container = null;
        if (isArSupported || isVrSupported) {
            container = this.#createXRButtonsContainer();
        }
        if (isArSupported) {
            const arButton = await this.#createButton('Start AR', async () => {
                await this.xr.initAR();
            });
            container.append(arButton);
        }
        if (isVrSupported) {
            const vrButton = await this.#createButton('Start VR', async () => {
                await this.xr.initVR();
            });
            container.append(vrButton);
        }
        return container;
    }

    #createXRButtonsContainer() {
        const container = document.createElement('div');
        container.classList.add('xr-buttons-container');
        return container;
    }

    async #createButton(buttonText, onClickHandler) {
        const button = document.createElement('button');
        button.innerText = buttonText;
        button.addEventListener('click', async () => {
            await onClickHandler();
            button.parentElement.remove();
        });
        return button;
    }

    #update(time) {
        const deltaTime = time - this.previousTime;
        this.previousTime = time;

        this.systems.forEach(system => system.update(deltaTime));
        this.three.render();

        if (this.xr?.session)
            this.xr.session.requestAnimationFrame(this.update);
        else
            requestAnimationFrame(this.update);
    }
}

const app = new App();
document.addEventListener('DOMContentLoaded', async () => {
    await app.init();
});