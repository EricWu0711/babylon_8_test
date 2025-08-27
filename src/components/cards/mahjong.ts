import { Scene, Mesh, Vector3, Animation, AnimationGroup } from '@babylonjs/core';
import ModelManager from '../../managers/modelsManager';

const DEALCARD_START_POS_X = 0;
const DEALCARD_START_POS_Z = 2.5;

/**
 * 麻將物件
 * @param scene Babylon.js 場景
 * @param position 麻將初始位置
 * 一種麻將會有四張，總共是一筒~九筒+白板，10種，共40張
 */
export class Mahjong {
    private scene: Scene;
    private uid: number;
    private minY: number;

    private modelManager: ModelManager;
    private modelName: string = 'mahjong';
    private modelPath: string = './res/models/mahjong.glb';

    private meshes: { [key: string]: Mesh[] } = {};

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

            // const thickness = this.getMeshThickness('dot', 1);
            // const cols = 7;
            // const gapX = 0.5;
            // const gapZ = 0.5;
            // const startX = -1.5;
            // const startZ = 1.5;
            // Object.keys(this.meshes).forEach((key, i) => {
            //     const mesh = this.meshes[key];
            //     if (mesh) {
            //         const row = Math.floor(i / cols);
            //         const col = i % cols;
            //         mesh[0].position = new Vector3(startX + col * gapX, 4 + thickness / 2, startZ + row * gapZ);
            //         mesh[1].position = new Vector3(startX + col * gapX, 4 + thickness / 2, startZ + row * gapZ);
            //     }
            // });
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
            if (!this.meshes[key]) this.meshes[key] = [];

            if (bindMesh) {
                bindMesh.name = 'mahjong_' + key + '_0';
                bindMesh.id = 'mahjong_' + key + '_0';
                bindMesh.setEnabled(false);
                const scale = 0.35;
                bindMesh.scaling = new Vector3(scale, scale, scale);
                bindMesh.rotation = new Vector3(0, 0, -Math.PI);
                this.meshes[key].push(bindMesh);

                for (let i = 1; i < 4; i++) {
                    const cloneMesh = bindMesh.clone('mahjong_' + key + '_' + i);
                    cloneMesh.id = 'mahjong_' + key + '_' + i;
                    this.meshes[key].push(cloneMesh);
                }
            }
        });
    }
    //#endregion

    //#region animation
    /**
     * 播放翻轉動畫
     * @param mj 麻將 Mesh
     */
    public playFlip(mj: Mesh): void {
        const scene = this.scene;
        const beginPosY = mj.position.y;
        const thickness = this.getMeshThickness('dot', 1);

        // 初始狀態：強制翻到牌背
        mj.rotation = new Vector3(0, 0, -Math.PI);

        // 動畫參數
        const frameRate = 30;
        const totalFrames = 6;

        // 創建動畫
        const rotationAnimation = new Animation('flipRotation', 'rotation.z', frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);

        const positionAnimation = new Animation('flipPosition', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);

        // 設置旋轉動畫的關鍵幀
        const rotationKeys = [
            { frame: 0, value: -Math.PI }, // 背面
            { frame: totalFrames / 2, value: -Math.PI / 2 }, // 側面
            { frame: totalFrames, value: 0 }, // 正面
        ];
        rotationAnimation.setKeys(rotationKeys);

        // 設置位置動畫的關鍵幀（高度起伏）
        const positionKeys = [
            { frame: 0, value: beginPosY }, // 起始高度
            { frame: totalFrames / 4, value: beginPosY + thickness / 2 }, // 上升
            { frame: (3 * totalFrames) / 4, value: beginPosY + thickness / 2 }, // 保持高度
            { frame: totalFrames, value: beginPosY }, // 回到桌面高度
        ];
        positionAnimation.setKeys(positionKeys);

        // 將動畫附加到麻將 Mesh
        mj.animations = [rotationAnimation, positionAnimation];

        // 播放動畫
        scene.beginAnimation(mj, 0, totalFrames);
    }

    /**
     * 從40張牌隨機抽八張麻將，表演發牌動畫，完成後呼叫 callback
     * 發牌到固定的四個位置，每次同時發兩張
     */
    public playDealAnimation(callback: Function) {
        const dealPositions = [
            new Vector3(DEALCARD_START_POS_X - 2, this.minY, DEALCARD_START_POS_Z), // 玩家1位置
            new Vector3(DEALCARD_START_POS_X, this.minY, DEALCARD_START_POS_Z + 2), // 玩家2位置
            new Vector3(DEALCARD_START_POS_X + 2, this.minY, DEALCARD_START_POS_Z), // 玩家3位置
            new Vector3(DEALCARD_START_POS_X, this.minY, DEALCARD_START_POS_Z - 2), // 玩家4位置
        ];

        // 抽取八張麻將
        const allMeshes = Object.values(this.meshes).flat();
        const selectedMeshes = allMeshes.sort(() => Math.random() - 0.5).slice(0, 8);
        for (const mesh of selectedMeshes) mesh.setEnabled(true);

        // 動畫參數
        const frameRate = 30;
        const totalFrames = 30;
        const startPos = new Vector3(DEALCARD_START_POS_X, this.minY, DEALCARD_START_POS_Z);

        selectedMeshes.forEach((mesh, index) => {
            // 計算目標位置
            const targetPos = dealPositions[Math.floor(index / 2)];

            // 創建動畫
            const positionAnimation = new Animation(`dealCardPosition_${index}`, 'position', frameRate, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);

            const positionKeys = [
                { frame: 0, value: startPos.clone() },
                { frame: totalFrames, value: targetPos.clone() },
            ];
            positionAnimation.setKeys(positionKeys);

            // 將動畫附加到麻將 Mesh
            mesh.animations = [positionAnimation];

            // 播放動畫
            this.scene.beginAnimation(mesh, 0, totalFrames, false, 1, () => {
                this.playFlip(mesh);
                if (index === selectedMeshes.length - 1) {
                    callback(); // 最後一張牌動畫完成後執行 callback
                }
            });
        });
    }
    //#endregion

    //#region getter/setter
    /**
     * 取得麻將 Mesh
     */
    public get Meshes() {
        return this.meshes;
    }

    /**
     * 取得麻將 Mesh 的最小 Y 值
     */
    public get MinY(): number {
        return this.minY;
    }

    /**
     * 設定麻將 Mesh 的最小 Y 值，通常是桌上
     */
    public set MinY(value: number) {
        this.minY = value;
    }

    /**
     * 取得指定點數的麻將 Mesh, 白板為 white_0
     */
    public getMeshByPoints(type: string, points: number): Mesh | null {
        const key = `${type}_${points}`;
        if (!this.meshes[key]) {
            console.warn('Mahjong getMeshByPoints not exist:', key);
            return null;
        } else return this.meshes[key][0];
    }

    /**
     * 取得一個牌的 Mesh 厚度
     */
    public getMeshThickness(type: string, points: number): number {
        const mesh = this.getMeshByPoints(type, points);
        return mesh ? mesh.getBoundingInfo().boundingBox.extendSize.y * mesh.scaling.y : 0;
    }
    //#endregion
}
