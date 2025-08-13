import { UniversalCamera, Scene, Vector3 } from '@babylonjs/core';
import { IControllable } from '../../constants/interfaces';

const CAMERA_SPEED = 0.2; // 相機移動速度
const CAMERA_ROTATION_SPEED = 0.1; // 相機旋轉速度

/**
 * 玩家第一人稱相機元件
 * @description 建立並管理 UniversalCamera，支援視角控制與目標切換
 */
export class PlayerCamera implements IControllable {
    public camera: UniversalCamera; // Babylon.js UniversalCamera 實例

    /**
     * 建構子：初始化玩家相機
     * @param scene Babylon.js 場景
     * @param canvas HTMLCanvasElement - 用於控制相機的畫布
     * @param startPosition Vector3 - 相機初始位置，預設 (0, 2, -10)
     */
    constructor(scene: Scene, canvas: HTMLCanvasElement, startPosition: Vector3 = new Vector3(0, 2, -20)) {
        this.camera = new UniversalCamera('playerCamera', startPosition, scene); // 建立 UniversalCamera

        // 啟用鍵鼠控制
        this.camera.attachControl(canvas, true);
        // 可根據需求擴充 WASD 控制、碰撞、限制範圍等
    }

    /**
     * 切換相機目標
     * @param target Vector3 - 新的目標位置
     */
    public setTarget(target: Vector3) {
        this.camera.setTarget(target);
    }

    /**
     * 啟用或停用相機控制
     * @param enable boolean - 是否啟用控制
     * @param canvas HTMLCanvasElement - 控制用畫布
     */
    public enableControl(enable: boolean, canvas: HTMLCanvasElement) {
        this.camera.attachControl(canvas, enable);
    }

    /**
     * 綁定inputManager的前置，清空鍵位設定
     */
    public beforeBindInputManager() {
        this.camera.keysUp = [];
        this.camera.keysDown = [];
        this.camera.keysLeft = [];
        this.camera.keysRight = [];
    }

    /**
     * 依照鏡頭朝向前進
     */
    public moveForward(): void {
        const forward = new Vector3(Math.sin(this.camera.rotation.y), 0, Math.cos(this.camera.rotation.y));
        forward.normalize();
        this.camera.position.addInPlace(forward.scale(CAMERA_SPEED));
    }

    /**
     * 依照鏡頭朝向後退
     */
    public moveBackward(): void {
        const backward = new Vector3(-Math.sin(this.camera.rotation.y), 0, -Math.cos(this.camera.rotation.y));
        backward.normalize();
        this.camera.position.addInPlace(backward.scale(CAMERA_SPEED));
    }

    /**
     * 依照鏡頭朝向左移
     */
    public moveLeft(): void {
        const left = new Vector3(
            Math.sin(this.camera.rotation.y - Math.PI / 2),
            0,
            Math.cos(this.camera.rotation.y - Math.PI / 2)
        );
        left.normalize();
        this.camera.position.addInPlace(left.scale(CAMERA_SPEED));
    }

    /**
     * 依照鏡頭朝向右移
     */
    public moveRight(): void {
        const right = new Vector3(
            Math.sin(this.camera.rotation.y + Math.PI / 2),
            0,
            Math.cos(this.camera.rotation.y + Math.PI / 2)
        );
        right.normalize();
        this.camera.position.addInPlace(right.scale(CAMERA_SPEED));
    }
    public rotateBy(dx: number, dy: number): void {
        this.camera.rotation.y += dx * CAMERA_ROTATION_SPEED;
        this.camera.rotation.x += dy * CAMERA_ROTATION_SPEED;
    }
}
