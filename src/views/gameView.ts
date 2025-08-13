import { Engine, Scene, Vector3, HemisphericLight, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
/**
 * 遊戲場景管理類別
 * @description 建立地板、牆壁等場景物件
 */
export class GameView {
	public engine: Engine;
	public scene: Scene;

	/**
	 * @param canvas HTMLCanvasElement
	 */
	constructor(canvas: HTMLCanvasElement) {
		this.engine = new Engine(canvas, true);
		this.scene = new Scene(this.engine);
		this._initLight();
		this._initGround();
		this._initWalls();
	}

	/**
	 * 初始化光源
	 */
	private _initLight() {
		const light = new HemisphericLight('light', new Vector3(0, 10, 0), this.scene);
		light.intensity = 0.8;
	}

	/**
	 * 建立地板
	 */
	private _initGround() {
		const ground = MeshBuilder.CreateGround('ground', { width: 30, height: 30 }, this.scene);
		const groundMat = new StandardMaterial('groundMat', this.scene);
		groundMat.diffuseColor = new Color3(0.6, 0.6, 0.6);
		ground.material = groundMat;
	}

	/**
	 * 建立四面牆壁
	 */
	private _initWalls() {
		const wallMat = new StandardMaterial('wallMat', this.scene);
		wallMat.diffuseColor = new Color3(0.8, 0.8, 0.9);

		// 前牆
		const wallFront = MeshBuilder.CreateBox('wallFront', { width: 30, height: 5, depth: 0.5 }, this.scene);
		wallFront.position = new Vector3(0, 2.5, -15);
		wallFront.material = wallMat;

		// 後牆
		const wallBack = MeshBuilder.CreateBox('wallBack', { width: 30, height: 5, depth: 0.5 }, this.scene);
		wallBack.position = new Vector3(0, 2.5, 15);
		wallBack.material = wallMat;

		// 左牆
		const wallLeft = MeshBuilder.CreateBox('wallLeft', { width: 0.5, height: 5, depth: 30 }, this.scene);
		wallLeft.position = new Vector3(-15, 2.5, 0);
		wallLeft.material = wallMat;

		// 右牆
		const wallRight = MeshBuilder.CreateBox('wallRight', { width: 0.5, height: 5, depth: 30 }, this.scene);
		wallRight.position = new Vector3(15, 2.5, 0);
		wallRight.material = wallMat;
	}

	/**
	 * 啟動渲染迴圈
	 */
	public run() {
		this.engine.runRenderLoop(() => {
            console.log('Rendering...');
			this.scene.render();
		});
	}
}
