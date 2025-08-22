import { Engine, Scene, Vector3, PassPostProcess, NodeRenderGraph, NodeMaterial, Quaternion, Texture, Color3 } from '@babylonjs/core'; // Babylon.js 核心模組
import '@babylonjs/inspector'; // Babylon.js 場景偵測器
import { PhysicsMotionType } from '@babylonjs/core/Physics/v2';
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import { HLight } from '../components/lights/hemisphericLight'; // 半球光元件
import { DLight } from '../components/lights/directionalLight'; // 定向光元件
import { Ceiling } from '../components/scene/ceiling'; // 天花板元件
import { Floor } from '../components/scene/floor'; // 地板元件
import { Wall } from '../components/scene/wall'; // 牆壁元件
import { Table } from '../components/scene/table'; // 賭桌元件
import { Chair } from '../components/scene/chair'; // 椅子元件
import { Dice } from '../components/dices/dice'; // 骰子元件
import { SelfPlayer } from '../components/players/self';
import { Dealer } from '../components/dealer/dealer'; // 荷官元件
import { PlayerCamera } from '../components/cameras/playerCamera'; // 玩家相機元件
import { DevCamera } from '../components/cameras/devCamera'; // 開發用上帝視角相機元件
import { InputManager } from '../managers/inputManager'; // 輸入管理器
import { PhysicsManager } from '../managers/physicsManager';

const ROOM_LENGTH_W = 100;
const ROOM_LENGTH_H = 100;
const ROOM_HEIGHT = 50;

const DICE_SCALE = 0.1;

/**
 * 遊戲場景管理類別
 * @description 管理 Babylon.js 場景初始化、物件建立與渲染迴圈
 */
export class GameView {
    public engine: Engine; // Babylon.js 引擎
    public physicsManager: PhysicsManager;
    public scene: Scene; // Babylon.js 場景
    public playerCamera: PlayerCamera; // 玩家相機
    public devCamera: DevCamera; // 開發用相機
    public inputManager: InputManager; // 輸入管理器
    public ceiling: Ceiling; // 天花板物件
    public walls: Wall[] = []; // 牆壁物件列表
    public floor: Floor; // 地板物件
    public table: Table; // 賭桌物件
    public chair: Chair; // 椅子物件
    public selfPlayer: SelfPlayer; // 玩家物件（SelfPlayer）
    public dice1: Dice; // 骰子物件
    public dice2: Dice; // 骰子物件
    public dealer: Dealer; // 荷官物件

    /**
     * 建構子：初始化引擎與場景，並建立主要場景物件
     * @param canvas HTMLCanvasElement - 用於渲染的畫布
     */
    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true); // 建立 Babylon.js 引擎
        this.scene = new Scene(this.engine); // 建立場景

        this.physicsManager = new PhysicsManager(this.scene);
        registerBuiltInLoaders();
    }

    /**
     * 切換相機
     */
    public switchCamera() {
        if (this.scene.activeCamera === this.playerCamera.camera) {
            this.scene.activeCamera = this.devCamera.camera;
        } else {
            this.scene.activeCamera = this.playerCamera.camera;
        }
    }

    /**
     * 顯示 Babylon.js Inspector（開發用，可即時檢查場景物件）
     */
    private async _showInspector() {
        const showingInspector = await this.scene.debugLayer.show({
            overlay: true, // 讓列表過長時滾動不會滾到整個網頁
        });

    }

    /**
     * 啟動渲染迴圈，持續更新場景
     */
    public run() {
        let diceStopped = false;
        this.engine.runRenderLoop(() => {
            // 相機在玩家上方
            const playerCameraPos = this.playerCamera.position;
            const selfPlayerPos = this.selfPlayer.Mesh.position;
            
            // 玩家物件固定角度
            this.selfPlayer.Mesh.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0);
            const direction: Quaternion = this.selfPlayer.Mesh.rotationQuaternion as Quaternion;
            this.selfPlayer.Mesh.physicsBody?.setTargetTransform(playerCameraPos.add(new Vector3(0, -2.5, 0)), direction);
            // this.selfPlayer.Mesh.position = this.playerCamera.camera.position.add(new Vector3(0, -2.5, 0));

            // // 偵測骰子靜止
            // if (this.dice && this.dice.Mesh && this.dice.Mesh.physicsBody) {
            //     const linear = this.dice.Mesh.physicsBody.getLinearVelocity();
            //     const angular = this.dice.Mesh.physicsBody.getAngularVelocity();
            //     const isStopped = linear.length() < 0.05 && angular.length() < 0.05;
            //     if (isStopped && !diceStopped) {
            //         diceStopped = true;
            //         const topValue = this.dice.getTopFaceValue();
            //         console.log('骰子停止，朝上的點數：', topValue);
            //     }
            //     if (!isStopped) {
            //         diceStopped = false;
            //     }
            // }

            this.inputManager.checkKeyboardInput();

            this.scene.render(); // 渲染場景
        });
    }

    //#region init
    public async init(canvas: HTMLCanvasElement) {
        await this.physicsManager.enablePhysics(); // 啟用物理系統

        this._initInputManager();
        this._initLight(); // 初始化光源
        this._initRoom(); // 建立房間
        this._initTableAndChair(); // 加入賭桌、椅子
        this._initDice(); // 加入骰子物件

        this._initPlayerCamera(canvas, new Vector3(0, 5, 15)); // 初始化玩家相機
        this._initSelfPlayer(); // 加入玩家物件
        this._initDevCamera(canvas); // 初始化開發用相機
        this.inputManager.bindCallbackOnKeyboardC(() => this.switchCamera(), 'switchCamera'); // 綁定切換相機事件

        this._initDealer();

        this._showInspector(); // 顯示場景偵測器（開發用）

        // await this.doFrameGraph(); // 套用一個編輯器拉節點，注意輸入輸出，效果有點類似shader
        // await this.doNodeMaterial(); // 基本上就是shader
    }

    /**
     * 初始化玩家相機（第一人稱視角）
     * @param canvas HTMLCanvasElement - 用於控制相機的畫布
     */
    private _initPlayerCamera(canvas: HTMLCanvasElement, startPosition: Vector3 = new Vector3(0, 5, -15)) {
        this.playerCamera = new PlayerCamera(this.scene, canvas, startPosition);
        this.playerCamera.setTarget(new Vector3(0, 5, 0)); // 設定相機目標位置

        this.playerCamera.beforeBindInputManager();
        this.inputManager.setControllable(this.playerCamera, 'playerCamera', this.playerCamera.getKeyboardConfig()); // 綁定輸入管理器與玩家相機
    }

    /**
     * 建立玩家物件（SelfPlayer）
     * 場景中央加入玩家物件
     */
    private _initSelfPlayer() {
        this.selfPlayer = new SelfPlayer(this.scene);
        const height = this.selfPlayer.Height;
        this.selfPlayer.Mesh.position = new Vector3(0, height / 2 + 0.5, 0); // 玩家物件放置於場景中央
        this.physicsManager.addPhysics(this.selfPlayer.Mesh, PhysicsMotionType.DYNAMIC, false, 1);
        this.selfPlayer.Mesh.physicsBody?.setAngularDamping(5000);
    }

    /**
     * 初始化荷官物件，放置於賭桌旁
     */
    private _initDealer() {
        const dealerPosition = new Vector3(0, 0, -1);
        const scale = 10; //4;
        const dealerScale = new Vector3(scale, scale, scale);

        const afterInit = (dealer: Dealer) => {
            const mesh = dealer.Mesh;
            mesh.setEnabled(true);
            mesh.position = dealerPosition;
            mesh.scaling = dealerScale;

            dealer.playGlad();
        };

        this.dealer = new Dealer(this.scene, 1, afterInit);
    }

    /**
     * 建立骰子物件並放置於桌面中央
     */
    private _initDice() {
        
        const afterInit = (dice: Dice) => {
            const tableTopPos = this.table.TableTopPos;
            const dicePosition = new Vector3(Math.random() * 0.5, tableTopPos.y + 0.25, Math.random() * 0.5);
            dice.Mesh.position = dicePosition;

            // (dice.Mesh.material as StandardMaterial).emissiveColor = new Color3(1, 1, 1);

            // 加入物理效果
            this.physicsManager.removePhysics(dice.Mesh);
            this.physicsManager.addPhysics(dice.Mesh, PhysicsMotionType.DYNAMIC, false, 1, true);

            // // 隨機滾動：給予隨機線性與角速度
            const randomLinear = new Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 5 + 5,
                (Math.random() - 0.5) * 10
            );
            const randomAngular = new Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );

            if (dice.Mesh.physicsBody) {
                dice.Mesh.physicsBody.setLinearVelocity(randomLinear);
                dice.Mesh.physicsBody.setAngularVelocity(randomAngular);
            }

            // 綁定 x 鍵讓骰子彈起來（統一用 inputManager）
            this.inputManager.bindCallbackOnKeyboardX(() => {
                if (dice && dice.Mesh.physicsBody) {
                    // 隨機方向 impulse
                    const impulse = new Vector3(
                        (Math.random() - 0.5) * 10, // X方向
                        Math.random() * 1.5 + 4,  // Y方向（向上）
                        (Math.random() - 0.5) * 10  // Z方向
                    );
                    const pos = dice.Mesh.position;
                    dice.Mesh.physicsBody.applyImpulse(impulse, pos);

                    // 額外給予隨機角速度，讓骰子飛起時有更多滾動
                    const angular = new Vector3(
                        (Math.random() - 0.5) * 20,
                        (Math.random() - 0.5) * 20,
                        (Math.random() - 0.5) * 20
                    );
                    dice.Mesh.physicsBody.setAngularVelocity(angular);
                }
            }, 'diceJump'+ dice.Uid);
        }

        // this.dice = new Dice(this.scene, 1, 0.25, afterInit);
        this.dice1 = new Dice(this.scene, 1, DICE_SCALE, afterInit);
        this.dice2 = new Dice(this.scene, 2, DICE_SCALE, afterInit);
    }

    /**
     * 初始化開發用相機（上帝視角）
     * @param canvas HTMLCanvasElement - 用於控制相機的畫布
     */
    private _initDevCamera(canvas: HTMLCanvasElement) {
        this.devCamera = new DevCamera(this.scene, canvas);
    }

    /**
     * 初始化輸入管理器
     */
    private _initInputManager() {
        this.inputManager = new InputManager();
        this.inputManager.bindEvents();
    }

    /**
     * 初始化場景光源（半球光）
     */
    private _initLight() {
        new HLight(this.scene); // 建立半球光元件
        new DLight(this.scene); // 建立定向光元件
    }

    /**
     * 建立賭桌元件
     * 場景中央加入賭桌物件
     */
    private _initTableAndChair() {
        this.table = new Table(this.scene);
        // 高度y在元件裡已經跟元件高適配
        this.table.Mesh.position.x = 0;
        this.table.Mesh.position.z = 0;

        this.physicsManager.addPhysics(this.table.Mesh, PhysicsMotionType.STATIC, true);

        this.chair = new Chair(this.scene);
        // 高度y在元件裡已經跟元件高適配
        this.chair.seat.position.x = 0;
        this.chair.seat.position.z = 8;
        this.physicsManager.addPhysics(this.chair.Mesh, PhysicsMotionType.STATIC, true);
    }

    /**
     * 建立房間六面
     */
    private _initRoom() {
        const lengthW = ROOM_LENGTH_W;
        const lengthH = ROOM_LENGTH_H;
        const height = ROOM_HEIGHT;
        this._initFloor(lengthW, lengthH);
        this._initWalls(lengthW, lengthH, height);
        this._initCeiling(lengthW, lengthH, height);
    }

    /**
     * 建立地板元件
     */
    private _initFloor(lengthW: number, lengthH: number) {
        this.floor = new Floor(this.scene, lengthW, lengthH); // 建立地板，長度為 lengthW，寬度為 lengthH
        this.physicsManager.addPhysics(this.floor.Mesh, PhysicsMotionType.STATIC, true);
    }

    /**
     * 建立四面牆壁元件
     */
    private _initWalls(lengthW: number, lengthH: number, height: number) {
        this.walls.push(
            new Wall(this.scene, new Vector3(0, height / 2, -lengthH/2), lengthW, height, 'w'), // 前牆
            new Wall(this.scene, new Vector3(0, height / 2, lengthH/2), lengthW, height, 's'), // 後牆
            new Wall(this.scene, new Vector3(-lengthW/2, height / 2, 0), lengthH, height, 'a'), // 左牆
            new Wall(this.scene, new Vector3(lengthW/2, height / 2, 0), lengthH, height, 'd') // 右牆
        );
        for(const wall of this.walls) {
            this.physicsManager.addPhysics(wall.mesh, PhysicsMotionType.STATIC, true);
        }
    }

    /**
     * 建立天花板元件
     */
    private _initCeiling(lengthW: number, lengthH: number, height: number) {
        this.ceiling = new Ceiling(this.scene, lengthW, lengthH); // 建立天花板，寬度與長度分別為 lengthW 與 lengthH
        this.ceiling.Mesh.position.y = height; // 天花板位置在高度上方
        this.physicsManager.addPhysics(this.ceiling.Mesh, PhysicsMotionType.STATIC, true);
    }
    //#endregion

    //#region test function
    private async doFrameGraph() {
        // 在這裡執行每一幀的圖形處理

        const passPostProcess = new PassPostProcess('pass', 1, this.scene.activeCamera);

        passPostProcess.samples = 4;
        passPostProcess.resize(this.engine.getRenderWidth(), this.engine.getRenderHeight(), this.scene.activeCamera);

        const nrg = await NodeRenderGraph.ParseFromSnippetAsync('#FAPQIH#1', this.scene, {
            rebuildGraphOnEngineResize: false,
        });

        const frameGraph = nrg.frameGraph;

        passPostProcess.onSizeChangedObservable.add(() => {
            nrg.getInputBlocks()[0].value = passPostProcess.inputTexture.texture;
            nrg.build();
        });
        // console.log('PassPostProcess size changed', nrg.getInputBlocks()[0].value, nrg.getBlockByName('Texture'));
        nrg.getInputBlocks()[0].value = passPostProcess.inputTexture.texture;

        nrg.build();

        await nrg.whenReadyAsync();

        this.scene.onAfterRenderObservable.add(() => {
            frameGraph.execute();
        });
    }

    private async doNodeMaterial() {
        // 在這裡執行 NodeMaterial 的相關處理
        // 頭暈shader
        let nodeMaterial = await NodeMaterial.ParseFromFileAsync(
            'hypnosis',
            'https://piratejc.github.io/assets/hypnosis.json',
            this.scene
        );
        // this.table.Mesh.material = nodeMaterial;
        // this.floor.Mesh.material = nodeMaterial;
        this.dice1.Mesh.material = nodeMaterial;
        this.dice2.Mesh.material = nodeMaterial;
    }
    //#endregion
}
