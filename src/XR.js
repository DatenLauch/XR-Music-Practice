export default class XR {

    constructor(three) {
        this.three = three;
        this.session = null;
        this.previousTime = 0;
    }

    async initAR() {
        try {
            this.session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local-floor'],
                optionalFeatures: ['plane-detection', 'hit-test', 'anchors']
            });
            await this.#initSession();
        }
        catch (error) {
            console.error('Error initializing AR session:', error);
        }
    }

    async initVR() {
        try {
            this.session = await navigator.xr.requestSession('immersive-vr', {
                requiredFeatures: ['local-floor'],
                optionalFeatures: ['viewer']
            });
            await this.#initSession();
        }
        catch (error) {
            console.error('Error initializing VR session:', error);
        }
    }

    async #initSession() {
        this.three.renderer.xr.enabled = true;
        await this.three.renderer.xr.setSession(this.session);
    }

    update(time) {
        if (!this.session) return;

        const deltaTime = time - this.previousTime;
        this.previousTime = time;

        if (this.three.cube.material.color.getHex() !== 0x0000ff) {
            this.three.cube.material.color.set(0x0000ff);
        }
        this.three.cube.rotation.x -= 0.02;
        this.three.cube.rotation.y -= 0.02;
    }
}