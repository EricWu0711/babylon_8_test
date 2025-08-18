
import { Scene, Mesh, Vector3, AnimationGroup, Skeleton, AssetsManager, MeshAssetTask } from '@babylonjs/core';


class ModelsManager {
    private static instance: ModelsManager;
    private scene: Scene;
    private models: Record<string, any>;

    constructor(scene: Scene) {
        this.scene = scene;
        this.models = {};
    }

    /**
     * 使用 AssetsManager 載入 glb 模型
     * @param modelName 模型名稱
     * @param modelPath 模型路徑
     */
    public preloadModel(modelName: string, modelPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const assetsManager = new AssetsManager(this.scene);
            const meshTask = assetsManager.addMeshTask(modelName, '', '', modelPath);

            meshTask.onSuccess = (task: MeshAssetTask) => {
                if (task.loadedMeshes.length > 0) {
                    task.loadedMeshes[0].name = modelName + '_mesh';
                    task.loadedMeshes[0].setEnabled(false);
                }
                if (task.loadedAnimationGroups) {
                    task.loadedAnimationGroups.forEach((ag) => {
                        ag.name = modelName + '_root_' + ag.name;
                        ag.stop();
                    });
                }
                this.models[modelName] = {
                    meshes: task.loadedMeshes,
                    skeletons: task.loadedSkeletons,
                    animationGroups: task.loadedAnimationGroups
                };
                console.log('preloadModel', modelPath, this.models[modelName]);
                resolve();
            };

            meshTask.onError = (task, message, exception) => {
                console.error('Error preloading model:', message, exception);
                reject(exception);
            };

            assetsManager.load();
        });
    }


    /**
     * 深拷貝模型，避免動畫共用問題
     * @param scene 場景
     * @param modelName 模型名稱
     * @param type 類型
     * @param uid 唯一識別
     */
    public prepareModel(scene: Scene, modelName: string, type: string, uid: string) {
        const root = scene.getMeshByName(modelName + '_mesh');
        if (!root) {
            console.error(`Mesh ${modelName}_mesh not found in scene.`);
            return null;
        }
        const cloneRoot = root.instantiateHierarchy(null, { doNotInstantiate: true }, (source, clone) => {
            clone.name = source.name;
        });
        if (!cloneRoot) {
            console.error('Failed to clone mesh hierarchy.');
            return null;
        }
        cloneRoot.name = modelName + '_' + uid;
        cloneRoot.setEnabled(true);

        if (!this.models[modelName] || !this.models[modelName].skeletons || this.models[modelName].skeletons.length === 0) {
            return { cloneMesh0: cloneRoot };
        }

        // 深拷貝骨架
        const masterSkel = this.models[modelName].skeletons[0] as Skeleton;
        const cloneSkeleton = masterSkel.clone(type + '_skeleton_' + uid);

        // map 所有後代並指定 skeleton
        const map: Record<string, any> = {};
        const descendants = cloneRoot.getDescendants(false);
        for (let i = 0; i < descendants.length; i++) {
            if (descendants[i] instanceof Mesh) {
                if ((descendants[i] as Mesh).subMeshes && (descendants[i] as Mesh).skeleton) {
                    (descendants[i] as Mesh).skeleton = cloneSkeleton;
                }
            }
            map[descendants[i].name] = descendants[i];
            if (map[descendants[i].name]) {
                map[descendants[i].name].name = map[descendants[i].name].name + '_' + uid;
            }
        }

        // 拷貝的骨架要重新連結到新map的後代
        for (const bone of cloneSkeleton.bones) {
            const tf = bone.getTransformNode();
            if (tf && map[tf.name]) {
                bone.linkTransformNode(map[tf.name]);
            }
        }

        // 深拷貝動畫
        const cloneAnimationGroups: AnimationGroup[] = [];
        if (this.models[modelName].animationGroups) {
            const masterAnimations = [...this.models[modelName].animationGroups];
            masterAnimations.forEach((ag: AnimationGroup) => {
                const clone = ag.clone(ag.name, (oldTarget) => {
                    const newTarget = map[oldTarget.name];
                    return newTarget || oldTarget;
                });
                clone.name = type + '_' + uid + '_' + clone.name;
                cloneAnimationGroups.push(clone);
            });
        }

        return { cloneMesh0: cloneRoot, cloneSkeleton: cloneSkeleton, cloneAnimationGroups: cloneAnimationGroups };
    }


    /**
     * 取得已載入的模型
     * @param modelName 模型名稱
     */
    public getModel(modelName: string) {
        if (!this.models[modelName]) {
            console.error(`Model ${modelName} has not been preloaded.`);
            return null;
        }
        return this.models[modelName];
    }

    /**
     * 取得 ModelManager 單例
     * @param scene 場景
     */
    public static getInstance(scene: Scene): ModelsManager {
        if (!ModelsManager.instance) ModelsManager.instance = new ModelsManager(scene);
        return ModelsManager.instance;
    }
}

export default ModelsManager;
