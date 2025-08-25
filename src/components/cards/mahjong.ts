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
    // private modelPath: string = './res/models/mahjong.glb';
    // private modelPath: string = './res/models/riichi_mahjong.glb';
    private modelPath: string = './res/models/dominoesBlender.glb';

    private mesh: Mesh;

    constructor(scene: Scene, uid: number, callback: Function) {
        this.scene = scene;
        this.uid = uid;
        this.modelManager = ModelManager.getInstance(scene);
        this.loadModel(callback);
    }

    //#region load model
    private async loadModel(callback: Function) {
        await this.modelManager.preloadModel(this.modelName, this.modelPath);
        // const cloneModel = this.modelManager.prepareMultiModels(this.scene, this.modelName, 'mahjong', this.uid.toString());
        const cloneModel = this.modelManager.prepareModel(this.scene, this.modelName, 'mahjong', this.uid.toString());
        // if (cloneModel && cloneModel.cloneMeshes && cloneModel.cloneMeshes.length > 0) {
        //     this.afterLoaded(cloneModel);
            
        //     // this.mesh.rotation = new Vector3(Math.PI/2, 0, 0);
        // }
        if (cloneModel && cloneModel.cloneMesh0) {
            this.afterLoaded(cloneModel);
            this.mesh.rotation = new Vector3(0, 0, 0);
            const scale = 10;
            this.mesh.scaling = new Vector3(scale, scale, scale);
        }
        callback(this);
    }

    private afterLoaded(cloneModel: any) {
        cloneModel.cloneMesh0 && this.setMesh(cloneModel.cloneMesh0);
        // for (let i = 0; i < cloneModel.cloneMeshes.length; i++) {
        //     const mesh = cloneModel.cloneMeshes[i];
        //     const scale = 10;
        //     mesh.scaling = new Vector3(scale, scale, scale);
        //     mesh.position = new Vector3(Math.floor(i/2) * 0.5, 4, Math.floor(i/2) * 0.5);

        //     mesh.setEnabled(true);
        // }
        this.mesh.setEnabled(true);
    }

    private setMesh(cloneMesh0: Mesh) {
        this.mesh = cloneMesh0;
    }
    //#endregion

    //#region animation
    public playFlip(): void {
       
    }

    //#endregion

    //#region getter
    /**
     * 取得麻將 Mesh
     */
    public get Mesh() {
        return this.mesh;
    }
    //#endregion
}
