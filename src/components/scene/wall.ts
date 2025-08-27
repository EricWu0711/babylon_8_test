import { MeshBuilder, Scene, PBRMaterial, Color3, Vector3, Mesh, Texture } from '@babylonjs/core';

const WALL_TEXTURE = {
    BASE: './res/textures/embossed/embossed_basecolor.jpg',
    NORMAL: './res/textures/embossed/embossed_normal.jpg',
    NORMAL_HEIGHT: './res/textures/embossed/embossed_normal_height.jpg',
    METALLIC: './res/textures/embossed/embossed_metallic.jpg',

    ROUGHNESS: './res/textures/embossed/embossed_roughness.jpg',
    HEIGHT: './res/textures/embossed/embossed_height.jpg',
};

export class Wall {
    public mesh: Mesh;
    public name: string;

    /**
     * 建立牆壁，預設寬度 100、高度 10、厚度 1（單位：公尺）
     */
    constructor(scene: Scene, position: Vector3, length: number = 100, height: number = 10, faceTo: string) {
        this.name = 'wall_' + faceTo;
        this.mesh = MeshBuilder.CreatePlane(this.name, { width: length, height }, scene);
        this.mesh.position = position;

        switch (faceTo) {
            case 'w':
                this.mesh.rotation.y = Math.PI; // 朝向西方
                break;
            case 's':
                this.mesh.rotation.y = 0; // 朝向南方
                break;
            case 'a':
                this.mesh.rotation.y = -Math.PI / 2; // 朝向北方
                break;
            case 'd':
                this.mesh.rotation.y = Math.PI / 2; // 朝向東方
                break;
        }

        const mat = new PBRMaterial('wallMat_' + faceTo, scene);
        mat.albedoColor = new Color3(0.9, 0.9, 0.9);
        mat.albedoTexture = new Texture(WALL_TEXTURE.BASE, scene);

        if (mat.albedoTexture instanceof Texture) {
            mat.albedoTexture.uScale = 20;
            mat.albedoTexture.vScale = 20;
        }

        // const bump = new Texture(WALL_TEXTURE.NORMAL_HEIGHT, scene);
        const bump = new Texture(WALL_TEXTURE.NORMAL, scene);
        bump.uScale = 20;
        bump.vScale = 20;
        bump.level = 1.5;
        mat.bumpTexture = bump;
        mat.microSurfaceTexture = bump;

        const metallic = new Texture(WALL_TEXTURE.METALLIC, scene);
        metallic.uScale = 20;
        metallic.vScale = 20;
        mat.metallicTexture = metallic;

        mat.metallic = 1; // set to 1 to only use it from the metallicTexture
        mat.roughness = 0.7; // set to 1 to only use it from the metallicTexture

        mat.backFaceCulling = true;
        this.mesh.material = mat;
    }
}
