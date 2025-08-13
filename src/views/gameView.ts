import { Engine, Scene, Vector3 } from '@babylonjs/core'; // Babylon.js 核心模組
import '@babylonjs/inspector'; // Babylon.js 場景偵測器
import { PhysicsMotionType } from '@babylonjs/core/Physics/v2';

import { HLight } from '../components/lights/hemisphericLight'; // 半球光元件
import { Floor } from '../components/scene/floor'; // 地板元件
import { Wall } from '../components/scene/wall'; // 牆壁元件
import { Table } from '../components/scene/table'; // 賭桌元件
import { Chair } from '../components/scene/chair'; // 椅子元件
import { Dice } from '../components/dices/dice'; // 骰子元件
import { SelfPlayer } from '../components/players/self';
import { PlayerCamera } from '../components/cameras/playerCamera'; // 玩家相機元件
import { DevCamera } from '../components/cameras/devCamera'; // 開發用上帝視角相機元件
import { InputManager } from '../managers/inputManager'; // 輸入管理器
import { PhysicsManager } from '../managers/physicsManager';

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
    public floor: Floor; // 地板物件
    public table: Table; // 賭桌物件
    public chair: Chair; // 椅子物件
    public selfPlayer: SelfPlayer; // 玩家物件（SelfPlayer）
    public dice: Dice; // 骰子物件

    /**
     * 建構子：初始化引擎與場景，並建立主要場景物件
     * @param canvas HTMLCanvasElement - 用於渲染的畫布
     */
    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true); // 建立 Babylon.js 引擎
        this.scene = new Scene(this.engine); // 建立場景
        this.physicsManager = new PhysicsManager(this.scene);
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
    private _showInspector() {
        this.scene.debugLayer.show();
    }

    /**
     * 啟動渲染迴圈，持續更新場景
     */
    public run() {
        this.engine.runRenderLoop(() => {
            this.selfPlayer.mesh.position = this.playerCamera.camera.position.add(new Vector3(0, -2.5, 0)); // 相機在玩家上方

            this.scene.render(); // 渲染場景
        });
    }

    public async init(canvas: HTMLCanvasElement) {
        await this.physicsManager.enablePhysics(); // 啟用物理系統
        this._initLight(); // 初始化光源
        this._initFloor(); // 建立地板
        this._initTable(); // 加入賭桌、椅子
        this._initDice(); // 加入骰子物件
        this._initWalls(); // 建立四面牆壁

        this._initInputManager();
        this._initPlayerCamera(canvas, new Vector3(0, 5, 15)); // 初始化玩家相機
        this._initSelfPlayer(); // 加入玩家物件
        this._initDevCamera(canvas); // 初始化開發用相機
        this.inputManager.bindCallbackOnKeyboardC(() => this.switchCamera(), 'switchCamera'); // 綁定切換相機事件

        this._showInspector(); // 顯示場景偵測器（開發用）
    }

    /**
     * 初始化輸入管理器
     */
    private _initInputManager() {
        this.inputManager = new InputManager();
        this.inputManager.bindEvents();
    }

    /**
     * 初始化玩家相機（第一人稱視角）
     * @param canvas HTMLCanvasElement - 用於控制相機的畫布
     */
    private _initPlayerCamera(canvas: HTMLCanvasElement, startPosition: Vector3 = new Vector3(0, 5, -15)) {
        this.playerCamera = new PlayerCamera(this.scene, canvas, startPosition);
        this.playerCamera.beforeBindInputManager();
        this.playerCamera.setTarget(new Vector3(0, 5, 0)); // 設定相機目標位置

        this.inputManager.setControllable(this.playerCamera, 'playerCamera'); // 綁定輸入管理器與玩家相機
    }

    /**
     * 初始化開發用相機（上帝視角）
     * @param canvas HTMLCanvasElement - 用於控制相機的畫布
     */
    private _initDevCamera(canvas: HTMLCanvasElement) {
        this.devCamera = new DevCamera(this.scene, canvas);
    }

    /**
     * 建立玩家物件（SelfPlayer）
     * 場景中央加入玩家物件
     */
    private _initSelfPlayer() {
        this.selfPlayer = new SelfPlayer(this.scene);
        this.selfPlayer.mesh.position = new Vector3(0, 2.5, 0); // 玩家物件放置於場景中央

        this.inputManager.setControllable(this.selfPlayer, 'selfPlayer'); // 綁定輸入管理器與玩家物件
    }

    /**
     * 初始化場景光源（半球光）
     */
    private _initLight() {
        new HLight(this.scene); // 建立半球光元件
    }

    /**
     * 建立地板元件
     */
    private _initFloor() {
        this.floor = new Floor(this.scene, 100); // 建立地板，預設寬度 100
        this.physicsManager.addPhysics(this.floor.mesh, PhysicsMotionType.STATIC, true);
    }

    /**
     * 建立賭桌元件
     * 場景中央加入賭桌物件
     */
    private _initTable() {
        this.table = new Table(this.scene);
        this.table.mesh.position = new Vector3(0, 2.5, 0);

        this.physicsManager.addPhysics(this.table.mesh, PhysicsMotionType.STATIC, true);

        this.chair = new Chair(this.scene);
        this.chair.seat.position = new Vector3(0, 1.2, 8);
    }

    /**
     * 建立骰子物件並放置於桌面中央
     */
    private _initDice() {
        this.dice = new Dice(this.scene, 0.5);
        // 放在桌面正中央上方
        this.dice.mesh.position = this.table.mesh.position.add(new Vector3(0, 3, 3));
        // 加入物理效果
        this.physicsManager.addPhysics(this.dice.mesh, PhysicsMotionType.DYNAMIC, false);
    }

    /**
     * 建立四面牆壁元件
     */
    private _initWalls() {
        // 前牆
        new Wall(this.scene, new Vector3(0, 5, -50), 100, 10, 1);
        // 後牆
        new Wall(this.scene, new Vector3(0, 5, 50), 100, 10, 1);
        // 左牆
        new Wall(this.scene, new Vector3(-50, 5, 0), 1, 10, 100);
        // 右牆
        new Wall(this.scene, new Vector3(50, 5, 0), 1, 10, 100);
    }
}
