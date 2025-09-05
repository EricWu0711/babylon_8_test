import { Scene, Texture, Mesh } from '@babylonjs/core'; // Babylon.js 核心模組

import * as GUI from "@babylonjs/gui";
import * as seatInfoJSON from "../../res/gui/guiSeatTexture.json";
import * as seatInfoJSON_mesh from "../../res/gui/guiSeatTexture_mesh.json";
import { GuiSeat } from "../components/gui/guiSeat";

export class GuiManager {
    private scene: Scene;

    private adtSeats: GUI.AdvancedDynamicTexture;
    private guiSeats: GuiSeat[] = [];

    constructor(scene: Scene) {
        this.scene = scene;

        // 初始化座位資訊面板
        // this._initGuiSeats();
    }

    /**
     * 初始化座位資訊面板
     */
    private _initGuiSeats() {
        // 初始化 AdvancedDynamicTexture
        this.adtSeats = GUI.AdvancedDynamicTexture.CreateFullscreenUI("Seats", true, this.scene, Texture.BILINEAR_SAMPLINGMODE, true);
        this.adtSeats.parseSerializedObject(seatInfoJSON);
        this.adtSeats.idealWidth = 1920;
        this.adtSeats.idealHeight = 1080;

        this.adtSeats.getDescendants(true).forEach((control) => {
            const guiSeat = new GuiSeat(this.adtSeats, control);
            this.guiSeats.push(guiSeat);
        });
        this.hideAllGuiSeats();
    }

    public initGuiSeats(table: Mesh) {
        // 初始化 AdvancedDynamicTexture
        this.adtSeats = GUI.AdvancedDynamicTexture.CreateForMesh(table, 1000, 750, true);
        this.adtSeats.parseSerializedObject(seatInfoJSON_mesh);

        this.adtSeats.getDescendants(true).forEach((control) => {
            const guiSeat = new GuiSeat(this.adtSeats, control);
            console.error("Initialized GUI seat: ", guiSeat);
            this.guiSeats.push(guiSeat);
        });
        this.hideAllGuiSeats();
    }

    /**
     * 顯示所有座位
     */
    public showAllGuiSeats() {
        this.guiSeats.forEach(seat => seat.showGuiSeat());
    }

    /**
     * 隱藏所有座位
     */
    public hideAllGuiSeats() {
        this.guiSeats.forEach(seat => seat.hideGuiSeat());
    }

    /**
     * 取得所有座位物件
     */
    public getAllGuiSeats(): GuiSeat[] {
        return this.guiSeats;
    }

    /**
     * 取得指定索引的座位物件
     */
    public getGuiSeat(index: number): GuiSeat | null {
        if (index >= 0 && index < this.guiSeats.length) {
            return this.guiSeats[index];
        }
        return null;
    }

    /**
     * 調整 GUI 大小
     */
    public resizeGui() {
        const canvas = this.scene.getEngine().getRenderingCanvas();
        if (canvas) {
            this.adtSeats.idealWidth = canvas.width;
            this.adtSeats.idealHeight = canvas.height;
            this.adtSeats.markAsDirty();
            console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
        }
    }

    /**
     * 銷毀 GUI
     */
    public dispose() {
        this.adtSeats.dispose();
        this.guiSeats.forEach(seat => seat.dispose());
    }
}