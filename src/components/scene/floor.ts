import { MeshBuilder, Scene, StandardMaterial, Color3 } from '@babylonjs/core';

export class Floor {
    public mesh;

    /**
     * 建立地板，預設寬度與高度 100（單位：公尺）
     */
    constructor(scene: Scene, size: number = 100) {
        this.mesh = MeshBuilder.CreateGround('floor', { width: size, height: size }, scene);
        const mat = new StandardMaterial('floorMat', scene);
        mat.diffuseColor = new Color3(0.36, 0.18, 0.07); // 深棕色
        this.mesh.material = mat;
    }
}
