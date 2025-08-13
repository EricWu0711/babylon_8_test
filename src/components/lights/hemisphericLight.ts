import { HemisphericLight, Scene, Vector3 } from '@babylonjs/core';

export class HLight {
    public light: HemisphericLight;

    /**
     * 建立半球光，預設高度 20（單位：公尺），強度 0.8
     */
    constructor(scene: Scene, direction: Vector3 = new Vector3(0, 20, 0), intensity: number = 0.8) {
        this.light = new HemisphericLight('hemisphericLight', direction, scene);
        this.light.intensity = intensity;
    }
}
