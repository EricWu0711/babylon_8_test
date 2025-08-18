import { Scene, Mesh, Vector3, AnimationGroup, Skeleton, AssetsManager, MeshAssetTask, TransformNode } from '@babylonjs/core';
import ModelManager from '../../managers/modelsManager';

// 每個模型都不一樣的動畫群組名稱
const TRANSFORM_AG_NAME = {
	"idle": "idle",
    "damage": "damage",
    "guard": "guard",
    "glad": "glad",
    "win": "win",
    "eat": "eat",
    "move": "move",
    "down": "down",
    "getup": "getup",
    "attack01": "attack01",
    "attack02": "attack02",
    "special01": "special01"
}

/**
 * 荷官物件
 * @param scene Babylon.js 場景
 * @param position 荷官初始位置
 */
export class Dealer {
	private scene: Scene;
	private modelManager: ModelManager;
	private modelName: string = 'dealer';
	private modelPath: string = './res/models/angelwomon.glb';
	// private modelPath: string = './res/models/Dice.glb';

	private mesh: Mesh;
    private animationGroups: { [key: string]: AnimationGroup } = {};

	constructor(scene: Scene, callback: Function) {
		this.scene = scene;
		this.modelManager = ModelManager.getInstance(scene);
		this.loadModel(callback);
	}

	//#region load model
	private async loadModel(callback: Function) {
		await this.modelManager.preloadModel(this.modelName, this.modelPath);
		const cloneModel = this.modelManager.prepareModel(this.scene, this.modelName, 'dealer', 'main');
		if (cloneModel && cloneModel.cloneMesh0) {
            // console.log('荷官模型已載入', cloneModel);
            this.afterLoaded(cloneModel);
			this.mesh.rotation = new Vector3(0, 0, 0);
		}
        callback();
	}

    private afterLoaded(cloneModel: any) {
        cloneModel.cloneMesh0 && this.setMesh(cloneModel.cloneMesh0);
        cloneModel.cloneAnimationGroups && this.setAnimationGroups(cloneModel.cloneAnimationGroups);
    }

    private setMesh(cloneMesh0: Mesh) {
        this.mesh = cloneMesh0;
    }

    private setAnimationGroups(animationGroups: AnimationGroup[]) {
        if(!animationGroups) return;
        animationGroups.forEach((ag: AnimationGroup) => {
			Object.keys(TRANSFORM_AG_NAME).forEach((key) => {
				if(ag.name.includes(key)) this.animationGroups[TRANSFORM_AG_NAME[key as keyof typeof TRANSFORM_AG_NAME]] = ag;
			});
		});
    }
    //#endregion

    //#region animation
	public playAnimation(animationName: string, isLoop: boolean, speedRatio: number = 1.0): void {
		if(this.animationGroups[animationName])
			this.animationGroups[animationName].start(isLoop, speedRatio, this.animationGroups[animationName].from, this.animationGroups[animationName].to, false);
		else
			console.error("playAnimation", animationName, "is not exist");
	}

    public playGlad() {
        this.playAnimation('glad', true);
    }

    public playMove() {
        this.playAnimation('move', true);
    }

    public playAttack01() {
        this.playAnimation('attack01', true);
    }

    //#endregion

    //#region getter
	/**
	 * 取得荷官 Mesh
	 */
	public get Mesh() {
		return this.mesh;
	}

    /**
     * 取得荷官動畫群組
     */
    public get AnimationGroups() {
        return this.animationGroups;
    }
    //#endregion
}
