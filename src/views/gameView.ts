import { Engine, Scene, Vector3 } from '@babylonjs/core'; // Babylon.js 核心模組
import '@babylonjs/inspector'; // Babylon.js 場景偵測器

import { HLight } from '../components/lights/hemisphericLight'; // 半球光元件
import { Floor } from '../components/background/floor'; // 地板元件
import { Wall } from '../components/background/wall'; // 牆壁元件
import { PlayerCamera } from '../components/cameras/playerCamera'; // 玩家相機元件
import { DevCamera } from '../components/cameras/devCamera'; // 開發用上帝視角相機元件
import { InputManager } from '../managers/inputManager'; // 輸入管理器

/**
 * 遊戲場景管理類別
 * @description 管理 Babylon.js 場景初始化、物件建立與渲染迴圈
 */
export class GameView {
    public engine: Engine; // Babylon.js 引擎
    public scene: Scene; // Babylon.js 場景
    public playerCamera: PlayerCamera; // 玩家相機
    public devCamera: DevCamera; // 開發用相機
    public inputManager: InputManager; // 輸入管理器

    /**
     * 建構子：初始化引擎與場景，並建立主要場景物件
     * @param canvas HTMLCanvasElement - 用於渲染的畫布
     */
    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true); // 建立 Babylon.js 引擎
        this.scene = new Scene(this.engine); // 建立場景

        this._initLight(); // 初始化光源
        this._initFloor(); // 建立地板
        this._initWalls(); // 建立四面牆壁

        this._initInputManager();
        this._initPlayerCamera(canvas); // 初始化玩家相機
        this._initDevCamera(canvas); // 初始化開發用相機
        this.inputManager.bindCallbackOnKeyboardC(() => this.switchCamera(), 'switchCamera'); // 綁定切換相機事件

        this._showInspector(); // 顯示場景偵測器（開發用）
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
            this.scene.render(); // 渲染場景
        });
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
    private _initPlayerCamera(canvas: HTMLCanvasElement) {
        this.playerCamera = new PlayerCamera(this.scene, canvas);
        this.playerCamera.beforeBindInputManager();

        this.inputManager.setControllable(this.playerCamera, 'player');
    }

    /**
     * 初始化開發用相機（上帝視角）
     * @param canvas HTMLCanvasElement - 用於控制相機的畫布
     */
    private _initDevCamera(canvas: HTMLCanvasElement) {
        this.devCamera = new DevCamera(this.scene, canvas);
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
        new Floor(this.scene, 100); // 建立地板，預設寬度 100
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
