import { PointLight, Scene, Vector3 } from '@babylonjs/core';

export class PLight {
    public light: PointLight;

    constructor(scene: Scene, position: Vector3 = new Vector3(0, 5, 0)) {
        this.light = new PointLight('pointLight', position, scene);
        // 可根據需求設定光源強度、顏色等
    }
}
