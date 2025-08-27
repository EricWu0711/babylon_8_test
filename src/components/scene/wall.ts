import { MeshBuilder, Scene, PBRMaterial, Color3, Vector3, Mesh } from '@babylonjs/core';

export class Wall {
    public mesh: Mesh;
    public name: string;

    /**
     * 建立牆壁，預設寬度 100、高度 10、厚度 1（單位：公尺）
     */
    constructor(scene: Scene, position: Vector3, length: number = 100, height: number = 10, faceTo: string) {
        this.name = 'wall_'+faceTo;
        this.mesh = MeshBuilder.CreatePlane(this.name, { width: length, height }, scene);
        this.mesh.position = position;

        switch (faceTo) {
            case 'w':
                this.mesh.rotation.y = Math.PI ; // 朝向西方
                break;
            case 's':
                this.mesh.rotation.y = 0; // 朝向南方
                break;
            case 'a':
                this.mesh.rotation.y = -Math.PI / 2; // 朝向北方
                break;
            case 'd':
                this.mesh.rotation.y = Math.PI/2; // 朝向東方
                break;
        }

        const mat = new PBRMaterial('wallMat', scene);
        mat.albedoColor = new Color3(0.9, 0.9, 0.9);
        mat.metallic = 0;      // 非金屬
        mat.roughness = 0.6;     // 全霧面，不反射
        mat.backFaceCulling = true;
        this.mesh.material = mat;
    }
}
