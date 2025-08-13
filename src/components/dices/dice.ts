import { MeshBuilder, Mesh, StandardMaterial, Color3, Scene, Vector3, MultiMaterial, SubMesh } from '@babylonjs/core';

/**
 * 六面骰子物件
 * @description 建立一個典型的六面骰子，每面有對應點數，並可計算目前朝上的點數
 */
export class Dice {
    public mesh: Mesh; // 骰子本體
    private faceMaterials: StandardMaterial[] = []; // 六面材質
    private multiMaterial: MultiMaterial; // MultiMaterial 物件
    private faceValues: number[] = [1, 2, 3, 4, 5, 6]; // 六面點數

    /**
     * 建構子：建立骰子物件
     * @param scene Babylon.js 場景
     * @param size 骰子邊長，預設 1
     */
    constructor(scene: Scene, size: number = 1) {
        // 建立立方體作為骰子
        this.mesh = MeshBuilder.CreateBox('dice', { size }, scene);
        this._createFaceMaterials(scene);
        this._applyMultiMaterial(scene);
        this.mesh.position = new Vector3(0, size / 2, 0); // 預設放在地面上
    }

    /**
     * 建立六面材質，並用顏色與點數區分
     */
    private _createFaceMaterials(scene: Scene) {
        const colors = [
            Color3.White(), // 1
            Color3.Red(), // 2
            Color3.Green(), // 3
            Color3.Blue(), // 4
            Color3.Yellow(), // 5
            Color3.Purple(), // 6
        ];
        for (let i = 0; i < 6; i++) {
            const mat = new StandardMaterial(`diceMat${i + 1}`, scene);
            mat.diffuseColor = colors[i];
            mat.emissiveColor = colors[i];
            this.faceMaterials.push(mat);
        }
    }

    /**
     * 將六面材質套用到骰子
     */
    /**
     * 套用 MultiMaterial 讓骰子六面顏色分別顯示
     */
    private _applyMultiMaterial(scene: Scene) {
        // Babylon.js MultiMaterial
        this.multiMaterial = new MultiMaterial('diceMultiMat', scene);
        for (let i = 0; i < 6; i++) {
            this.multiMaterial.subMaterials.push(this.faceMaterials[i]);
        }
        this.mesh.material = this.multiMaterial;
        // 建立六個 subMesh 對應六面
        this.mesh.subMeshes = [];
        const verticesCount = this.mesh.getTotalVertices();
        const indices = this.mesh.getIndices();
        // 每面 2 triangles, 6 faces
        for (let i = 0; i < 6; i++) {
            this.mesh.subMeshes.push(
                new SubMesh(
                    i, // materialIndex
                    0,
                    verticesCount,
                    i * 6,
                    6,
                    this.mesh
                )
            );
        }
    }

    /**
     * 計算目前朝上的面點數
     * @returns number - 1~6
     */
    public getTopFaceValue(): number {
        // 取得骰子世界座標的 up vector
        const up = Vector3.Up();
        const worldMatrix = this.mesh.getWorldMatrix();
        const upWorld = Vector3.TransformNormal(up, worldMatrix);
        // Babylon.js Box 六面法線: +Y (上), -Y (下), +Z, -Z, +X, -X
        // 判斷哪個面最接近世界 up
        const faceNormals = [
            new Vector3(1, 0, 0), // +X
            new Vector3(-1, 0, 0), // -X
            new Vector3(0, 1, 0), // +Y (上)
            new Vector3(0, -1, 0), // -Y (下)
            new Vector3(0, 0, 1), // +Z
            new Vector3(0, 0, -1), // -Z
        ];
        let maxDot = -Infinity;
        let topFace = 0;
        for (let i = 0; i < 6; i++) {
            const normalWorld = Vector3.TransformNormal(faceNormals[i], worldMatrix);
            const dot = Vector3.Dot(normalWorld, up);
            if (dot > maxDot) {
                maxDot = dot;
                topFace = i;
            }
        }
        return this.faceValues[topFace];
    }
}

// 用法範例：
// const dice = new Dice(scene);
// dice.mesh.rotation = ... // 可旋轉骰子
// const value = dice.getTopFaceValue(); // 取得目前朝上的點數
// console.log('骰子朝上的點數:', value);
