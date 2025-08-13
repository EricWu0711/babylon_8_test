import { DirectionalLight, Scene, Vector3 } from '@babylonjs/core';

export class DLight {
    public light: DirectionalLight;

    constructor(scene: Scene, direction: Vector3 = new Vector3(0, -1, 0)) {
        this.light = new DirectionalLight('dirLight', direction, scene);
        // 可根據需求設定光源強度、顏色等
    }
}
