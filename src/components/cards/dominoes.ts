import { Scene, Mesh, Vector3, AnimationGroup } from '@babylonjs/core';
import ModelManager from '../../managers/modelsManager';

/**
 * 多米諾骨牌物件
 * @param scene Babylon.js 場景
 * @param position 多米諾骨牌初始位置
 */
export class Dominoes {
    private scene: Scene;
    private uid: number;

    private modelManager: ModelManager;
    private modelName: string = 'dominoes';
    private modelPath: string = './res/models/dominoes2.glb';

    private mesh: Mesh;

    constructor(scene: Scene, uid: number, callback: Function) {
        this.scene = scene;
        this.uid = uid;
        this.modelManager = ModelManager.getInstance(scene);
        this.loadModel(callback);
    }

    //#region load model
    private async loadModel(callback: Function) {
        await this.modelManager.preloadModel(this.modelName, this.modelPath, { isMultiMesh: true });
        const cloneModel = this.modelManager.prepareMultiModels(this.scene, this.modelName, 'dominoes');

        if (cloneModel && cloneModel.cloneMeshes && cloneModel.cloneMeshes.length > 0) {
            this.afterLoaded(cloneModel);
        }
        callback(this);
    }

    private afterLoaded(cloneModel: any) {
        for (let i = 0; i < cloneModel.cloneMeshes.length; i++) {
            const mesh = cloneModel.cloneMeshes[i];
            const scale = 1;
            mesh.scaling = new Vector3(scale, scale, scale);
            mesh.position = new Vector3(Math.floor(i / 2) * 0.5, 4, Math.floor(i / 2) * 0.5);

            mesh.setEnabled(true);
        }
    }

    private setMesh(cloneMesh0: Mesh) {
        this.mesh = cloneMesh0;
    }
    //#endregion

    //#region animation
    public playFlip(): void {}

    //#endregion

    //#region getter
    /**
     * 取得多米諾骨牌 Mesh
     */
    public get Mesh() {
        return this.mesh;
    }
    //#endregion
}
