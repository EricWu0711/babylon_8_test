import { Scene, Mesh, Vector3, AnimationGroup, Skeleton, AssetsManager, MeshAssetTask, Tags } from '@babylonjs/core';

interface PreloadOptions {
    isMultiMesh?: boolean;
    isNeedRename?: boolean;
}

interface PrepareOptions {
    isNeedRename?: boolean;
    uid?: number | string;
    isNeedCloneAnimation?: boolean;
}

/**
 * 模型管理類別
 * @description 使用 AssetsManager 載入 glb 模型，並可深拷貝模型避免動畫共用問題
 */
class ModelsManager {
    private static instance: ModelsManager;
    private scene: Scene;
    private models: Record<string, any>;
    private saveModels: { [key: string]: any } = {};
    private preloadPromises: { [key: string]: Promise<void> } = {};

    constructor(scene: Scene) {
        this.scene = scene;
        this.models = {};
    }

    /**
     * 使用 AssetsManager 載入 glb 模型
     * @param modelName 模型名稱
     * @param modelPath 模型路徑
     * @param isMultiMesh 是否為多 Mesh 模型，例如整套多米諾牌
     */
    public preloadModel(modelName: string, modelPath: string, config?: PreloadOptions): Promise<void> {
        const key = modelName + '_' + modelPath;
        const isMultiMesh = config?.isMultiMesh || false;
        const isNeedRename = config?.isNeedRename || false;

        if (this.saveModels[key]) {
            console.log('Model already preloaded:', modelName, modelPath, this.saveModels);
            return Promise.resolve();
        }
        if (typeof this.preloadPromises[key] !== 'undefined') {
            console.log('Model is currently being preloaded:', modelName, modelPath, this.preloadPromises);
            return this.preloadPromises[key];
        }

        this.preloadPromises[key] = new Promise((resolve, reject) => {
            const assetsManager = new AssetsManager(this.scene);
            const meshTask = assetsManager.addMeshTask(modelName, '', '', modelPath);

            // console.log('in promise:', modelName, modelPath, meshTask);
            meshTask.onSuccess = (task: MeshAssetTask) => {
                // console.log('Model preloaded:', modelName, task);
                if (task.loadedMeshes.length > 0) {
                    for (let i = 0; i < task.loadedMeshes.length; i++) {
                        // console.log('task.loadedMeshes:', modelName, task.loadedMeshes[i], isMultiMesh, isNeedRename);
                        const mesh = task.loadedMeshes[i];
                        if (mesh.subMeshes && mesh.subMeshes.length > 0 && mesh.material) {
                            mesh.parent = null;

                            // 後續prepare用id來篩選
                            mesh.id = isNeedRename ? (isMultiMesh ? modelName + '_rootMesh_' + i : modelName + '_rootMesh') : mesh.id;

                            // 名字前面加上 zzz_root_ 讓他在 inspector 中集中排在最後
                            mesh.name = isNeedRename ? (isMultiMesh ? modelName + '_rootMesh_' + i : modelName + '_rootMesh') : mesh.name;
                            mesh.name = 'zzz_root_' + mesh.name;

                            isMultiMesh && Tags.AddTagsTo(mesh, modelName + '_rootMesh');
                            mesh.setEnabled(false);
                        } else {
                            Tags.AddTagsTo(mesh, 'dispose');
                            mesh.name = modelName + '_dispose';
                        }
                    }

                    const disposeMeshes = this.scene.getMeshesByTags('dispose');
                    // console.log('Dispose meshes:', disposeMeshes);
                    for (const mesh of disposeMeshes) {
                        mesh.dispose();
                    }
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
                    animationGroups: task.loadedAnimationGroups,
                };
                this.saveModels[key] = this.models[modelName];

                // console.log('saveModels', modelPath, this.models[modelName], this.saveModels);
                resolve();
                delete this.preloadPromises[key];
            };

            meshTask.onError = (task, message, exception) => {
                console.error('Error preloading model:', message, exception);
                reject(exception);
                delete this.preloadPromises[key];
            };

            assetsManager.load();
        });
        return this.preloadPromises[key];
    }

    /**
     * 深拷貝模型，避免動畫共用問題
     * @param scene 場景
     * @param modelName 模型名稱
     * @param type 類型
     * @param uid 唯一識別
     */
    public prepareModel(scene: Scene, modelName: string, type: string, config?: PrepareOptions) {
        const root = scene.getMeshById(modelName + '_rootMesh');
        const uid = config?.uid || '0';
        if (!root) {
            console.error(`Mesh ${modelName}_rootMesh not found in scene.`);
            return null;
        }
        const cloneRoot = root.instantiateHierarchy(null, { doNotInstantiate: true }, (source, clone) => {
            clone.name = source.name;
        });
        if (!cloneRoot) {
            console.error('Failed to clone mesh hierarchy.');
            return null;
        }
        cloneRoot.name = modelName + '_cloneMesh_' + uid;
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
        const isNeedCloneAnimation = config?.isNeedCloneAnimation || false;
        console.log('is ', isNeedCloneAnimation)
        if (this.models[modelName].animationGroups) {
            const masterAnimations = [...this.models[modelName].animationGroups];
            masterAnimations.forEach((ag: AnimationGroup) => {
                const clone = ag.clone(ag.name, (oldTarget) => {
                    const newTarget = map[oldTarget.name];
                    return newTarget || oldTarget;
                });
                clone.name = type + '_' + uid + '_' + clone.name;
                cloneAnimationGroups.push(clone);
            }, isNeedCloneAnimation);
        }

        return { cloneMesh0: cloneRoot, cloneSkeleton: cloneSkeleton, cloneAnimationGroups: cloneAnimationGroups };
    }

    public prepareMultiModels(scene: Scene, modelName: string, type: string, config?: PrepareOptions) {
        const roots = scene.getMeshesByTags(modelName + '_rootMesh');
        const isNeedRename = config?.isNeedRename || false;
        const uid = config?.uid || '0';
        // console.log('roots:', roots);

        if (!roots || roots.length === 0) {
            console.error(`Meshes ${modelName}_rootMesh not found in scene.`);
            return null;
        }

        const cloneRoots = roots.map((rootMesh) => {
            return rootMesh.instantiateHierarchy(null, { doNotInstantiate: true }, (source, clone) => {
                clone.name = isNeedRename ? modelName + '_cloneMesh_' + uid : clone.name.replace('_rootMesh', '_cloneMesh');
                clone.setEnabled(false);
            });
        });
        if (!cloneRoots) {
            console.error('Failed to clone mesh hierarchy.');
            return null;
        }

        if (!this.models[modelName] || !this.models[modelName].skeletons || this.models[modelName].skeletons.length === 0) {
            return { cloneMeshes: cloneRoots };
        }

        // 深拷貝骨架
        const masterSkel = this.models[modelName].skeletons[0] as Skeleton;
        const cloneSkeleton = masterSkel.clone(type + '_skeleton_' + uid);

        // 深拷貝動畫
        const cloneAnimationGroups: AnimationGroup[] = [];

        for (const cloneRoot of cloneRoots) {
            if (!cloneRoot) continue;
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
        }

        return { cloneMeshes: cloneRoots, cloneSkeleton: cloneSkeleton, cloneAnimationGroups: cloneAnimationGroups };
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

    /**
     * 移除指定root mesh
     */
    public removeModelByRootName(rootName: string) {
        const roots = this.scene.getMeshesByTags(rootName + '_rootMesh');
        if (roots && roots.length > 0) {
            roots.forEach((mesh) => {
                mesh.dispose();
            });
            console.log(`Model with root name ${rootName} has been removed from the scene.`);
        } else {
            console.warn(`No meshes found with root name ${rootName}.`);
        }
    }
}

export default ModelsManager;
