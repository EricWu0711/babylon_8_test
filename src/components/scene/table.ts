import { MeshBuilder, Mesh, Scene, Vector3, Color3, StandardMaterial } from '@babylonjs/core';

/**
 * 賭桌物件
 * 桌面為半圓柱體，底下有三個桌腳
 */
export class Table {
    public mesh: Mesh; // 桌面主體
    public legs: Mesh[] = []; // 桌腳陣列
    private legHeight: number;

    /**
     * 建立賭桌
     * @param scene Babylon.js 場景
     * @param radius 半圓桌面半徑（預設 6）
     * @param thickness 桌面厚度（預設 0.5）
     * @param legHeight 桌腳高度（預設 3）
     * @param legRadius 桌腳半徑（預設 0.3）
     */
    constructor(
        scene: Scene,
        radius: number = 6,
        thickness: number = 0.5,
        legHeight: number = 3.5,
        legRadius: number = 0.3
    ) {
        // 桌面：半圓柱
        this.mesh = MeshBuilder.CreateCylinder(
            'tableTop',
            {
                diameter: radius * 2,
                height: thickness,
                tessellation: 32,
                arc: 0.5, // 半圓
            },
            scene
        );
        this.legHeight = legHeight;
        this.mesh.position.y = this.legHeight + thickness / 2;
        const topMat = new StandardMaterial('tableTopMat', scene);
        topMat.diffuseColor = new Color3(0.6, 0.4, 0.2); // 木頭色
        topMat.backFaceCulling = false; // 雙面渲染，避免看透
        this.mesh.material = topMat;

        // 半圓柱切面遮板
        const cutMat = new StandardMaterial('tableCutMat', scene);
        cutMat.diffuseColor = new Color3(0.5, 0.3, 0.15); // 近似桌面色
        cutMat.backFaceCulling = false;
        const cutFace = MeshBuilder.CreateBox(
            'tableCutFace',
            {
                width: radius * 2,
                height: thickness,
                depth: 0.01, // 很薄即可
            },
            scene
        );
        // 算出切面中心位置（半圓柱的平面邊緣）
        cutFace.position = new Vector3(0, 0, 0);
        cutFace.material = cutMat;
        cutFace.parent = this.mesh;

        const legPosRadius = radius * 0.75;
        // 桌腳位置（半圓下方三點）
        const legPositions = [
            new Vector3(-legPosRadius * Math.cos(Math.PI / 6), this.legHeight / 2, -legPosRadius * Math.sin(Math.PI / 6)),
            new Vector3(0, this.legHeight / 2, -legPosRadius),
            new Vector3(legPosRadius * Math.cos(Math.PI / 6), this.legHeight / 2, -legPosRadius * Math.sin(Math.PI / 6)),
        ];
        for (let i = 0; i < 3; i++) {
            const leg = MeshBuilder.CreateCylinder(
                `tableLeg${i + 1}`,
                {
                    diameter: legRadius * 2,
                    height: this.legHeight,
                },
                scene
            );
            leg.position = legPositions[i];
            const legMat = new StandardMaterial(`tableLegMat${i + 1}`, scene);
            legMat.diffuseColor = new Color3(0.3, 0.2, 0.1); // 深木色
            leg.material = legMat;
            this.legs.push(leg);
        }
        // 將桌腳設為桌面的子物件
        this.legs.forEach((leg) => (leg.parent = this.mesh));

        this.mesh.rotation.x = Math.PI;
    }

    public getMesh() {
        return this.mesh;
    }

    public getLegHeight() {
        return this.legHeight;
    }
}
