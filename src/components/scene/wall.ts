import { MeshBuilder, Scene, StandardMaterial, Color3, Vector3 } from '@babylonjs/core';

export class Wall {
    public mesh;

    /**
     * 建立牆壁，預設寬度 100、高度 10、厚度 1（單位：公尺）
     */
    constructor(scene: Scene, position: Vector3, width: number = 100, height: number = 10, depth: number = 1) {
        this.mesh = MeshBuilder.CreateBox('wall', { width, height, depth }, scene);
        this.mesh.position = position;
        const mat = new StandardMaterial('wallMat', scene);
        mat.diffuseColor = new Color3(0.9, 0.9, 0.9);
        this.mesh.material = mat;
    }
}
