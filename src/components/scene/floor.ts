import { MeshBuilder, Scene, PBRMaterial, Texture, Color3, Mesh, Vector2 } from '@babylonjs/core';

const CARPET_TEXTURE = {
    BASE: './res/textures/carpet/carpet_basecolor.jpg',
    NORMAL: './res/textures/carpet/carpet_normal.png',
    ROUGHNESS: './res/textures/carpet/carpet_roughness.png',
    HEIGHT: './res/textures/carpet/carpet_height.png',
}
export class Floor {
    private mesh: Mesh;

    /**
     * 建立地板，預設寬度與高度 100（單位：公尺）
     */
    constructor(scene: Scene, lengthW: number, lengthH: number) {
        this.mesh = MeshBuilder.CreateGround('floor', { width: lengthW, height: lengthH }, scene);
        const mat = new PBRMaterial('floorMat', scene);
        this.mesh.material = mat;

        mat.albedoColor = new Color3(0.8, 0.0015, 0.0015); // 深紅色
        // mat.albedoTexture = new Texture(CARPET_TEXTURE.BASE, scene);

        const bump = new Texture(CARPET_TEXTURE.NORMAL, scene);
        bump._invertY = true;
        bump.uScale = 1;
        bump.vScale = 1;
        bump.level = 1.5;
        mat.bumpTexture = bump;

        // Roughness
        mat.useRoughnessFromMetallicTextureAlpha = false;
        mat.metallic = 0;      // set to 1 to only use it from the metallicTexture
        mat.roughness = 1;     // set to 1 to only use it from the metallicTexture
        mat.microSurfaceTexture = new Texture(CARPET_TEXTURE.ROUGHNESS, scene);

        // Height Map + Parallax
        const heightTex = new Texture(CARPET_TEXTURE.HEIGHT, scene);
        mat.parallaxScaleBias = 0.08;  // 加入高度偏移
        mat.useParallaxOcclusion = true;  // 開啟 POM
        // mat.useParallax = heightTex; // ✅ 把 height map 套給 bumpTexture


        // this.mesh.applyDisplacementMap(CARPET_TEXTURE.HEIGHT, 0, 0.01, (a) => { console.log(a); }, new Vector2(0, 0), new Vector2(1,1), true);

    }

    /**
     * 獲取地板 Mesh
     */
    public get Mesh() {
        return this.mesh;
    }
}
