import { MeshBuilder, Mesh, Scene, Vector3, Color3, StandardMaterial } from '@babylonjs/core';
import { IControllable } from '../../constants/interfaces';

const MOVE_SPEED = 0.2; // 移動速度

/**
 * 玩家物件（簡單直立橢圓形表示）
 */
export class SelfPlayer implements IControllable {
    public mesh: Mesh;

    /**
     * 建立玩家物件
     * @param scene Babylon.js 場景
     * @param height 橢圓高度
     * @param radius 橢圓寬度
     */
    constructor(scene: Scene, height: number = 5, radius: number = 0.5) {
        // 直立橢圓形（橢圓柱）
        this.mesh = MeshBuilder.CreateSphere(
            'selfPlayer',
            {
                diameterX: radius * 2,
                diameterY: height,
                diameterZ: radius * 2,
                segments: 32,
            },
            scene
        );
        this.mesh.position.y = height / 2;
        const mat = new StandardMaterial('selfPlayerMat', scene);
        mat.diffuseColor = new Color3(0.2, 0.6, 0.9); // 藍色
        mat.backFaceCulling = false;
        this.mesh.material = mat;
    }

    /**
     * 朝向前進
     */
    public moveForward(): void {
        // const forward = new Vector3(Math.sin(this.mesh.rotation.y), 0, Math.cos(this.mesh.rotation.y));
        // forward.normalize();
        // this.mesh.position.addInPlace(forward.scale(MOVE_SPEED));
    }

    /**
     * 朝向後退
     */
    public moveBackward(): void {
        // const backward = new Vector3(-Math.sin(this.mesh.rotation.y), 0, -Math.cos(this.mesh.rotation.y));
        // backward.normalize();
        // this.mesh.position.addInPlace(backward.scale(MOVE_SPEED));
    }

    /**
     * 朝向左移
     */
    public moveLeft(): void {
        //     const left = new Vector3(
        //         Math.sin(this.mesh.rotation.y - Math.PI / 2),
        //         0,
        //         Math.cos(this.mesh.rotation.y - Math.PI / 2)
        //     );
        //     left.normalize();
        //     this.mesh.position.addInPlace(left.scale(MOVE_SPEED));
    }

    /**
     * 朝向右移
     */
    public moveRight(): void {
        // const right = new Vector3(
        //     Math.sin(this.mesh.rotation.y + Math.PI / 2),
        //     0,
        //     Math.cos(this.mesh.rotation.y + Math.PI / 2)
        // );
        // right.normalize();
        // this.mesh.position.addInPlace(right.scale(MOVE_SPEED));
    }

    public rotateBy(dx: number, dy: number): void {}
}
