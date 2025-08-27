import { Scene, Mesh, Vector3, AnimationGroup } from '@babylonjs/core';
import ModelManager from '../../managers/modelsManager';

/**
 * 麻將物件
 * @param scene Babylon.js 場景
 * @param position 麻將初始位置
 */
export class Mahjong {
    private scene: Scene;
    private uid: number;

    private modelManager: ModelManager;
    private modelName: string = 'mahjong';
    private modelPath: string = './res/models/mahjong.glb';

    private meshes: { [key: string]: Mesh | null } = {};

    constructor(scene: Scene, uid: number, callback: Function) {
        this.scene = scene;
        this.uid = uid;
        this.modelManager = ModelManager.getInstance(scene);
        this.loadModel(callback);
    }

    //#region load model
    private async loadModel(callback: Function) {
        await this.modelManager.preloadModel(this.modelName, this.modelPath, { isMultiMesh: true });
        const cloneModel = this.modelManager.prepareMultiModels(this.scene, this.modelName, 'mahjong');

        if (cloneModel && cloneModel.cloneMeshes && cloneModel.cloneMeshes.length > 0) {
            this.afterLoaded(cloneModel);

            const rows = 4;
            const cols = 7;
            const gapX = 0.5;
            const gapZ = 0.5;
            const startX = -1.5;
            const startZ = 1.5;
            Object.keys(this.meshes).forEach((key, i) => {
                const mesh = this.meshes[key];
                if (mesh) {
                    const row = Math.floor(i / cols);
                    const col = i % cols;
                    mesh.position = new Vector3(startX + col * gapX, 4, startZ + row * gapZ);
                }
            });
        }
        callback(this);
    }

    private afterLoaded(cloneModel: any) {
        let tmpArr: { [key: string]: Mesh[] } = {};
        // 將相同上下點的 Mesh 分組
        for (let i = 0; i < cloneModel.cloneMeshes.length; i++) {
            const mesh = cloneModel.cloneMeshes[i];
            const name: string = mesh.name; // ex. zzz_Mahjong_root_dot_2_primitive0
            const type = name.split('_')[4];
            const points = name.split('_')[5];

            if (tmpArr[`${type}_${points}`] === undefined) tmpArr[`${type}_${points}`] = [];
            tmpArr[`${type}_${points}`].push(mesh);

            const scale = 1;
            mesh.scaling = new Vector3(scale, scale, scale);
        }

        // 合併 Mesh
        Object.keys(tmpArr).forEach((key) => {
            const bindMesh = Mesh.MergeMeshes(tmpArr[key], true, true, undefined, true, true);
            bindMesh && (bindMesh.name = 'mahjong_' + key);
            bindMesh && (bindMesh.id = 'mahjong_' + key);
            bindMesh && bindMesh.setEnabled(false);
            this.meshes[key] = bindMesh;
        });
    }
    //#endregion

    //#region animation
    public playFlip(): void {}

    //#endregion

    //#region getter
    /**
     * 取得麻將 Mesh
     */
    public get Meshes() {
        return this.meshes;
    }

    /**
     * 取得指定點數的麻將 Mesh, 白板為 white_0
     */
    public getMeshByPoints(type: string, points: number): Mesh | null {
        const key = `${type}_${points}`;
        if (!this.meshes[key]) {
            console.warn('Mahjong getMeshByPoints not exist:', key);
            return null;
        } else return this.meshes[key];
    }

    /**
     * 取得一個牌的 Mesh 厚度
     */
    public getMeshThickness(type: string, points: number): number {
        const mesh = this.getMeshByPoints(type, points);
        return mesh ? mesh.getBoundingInfo().boundingBox.extendSize.y : 0;
    }
    //#endregion
}
