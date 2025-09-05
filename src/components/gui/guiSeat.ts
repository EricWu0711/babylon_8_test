import * as GUI from "@babylonjs/gui";

export class GuiSeat {
    private container: GUI.Rectangle;
    private playerNameLabel: GUI.TextBlock;
    private playerIcon: GUI.Rectangle;
    private playerIconBtn: GUI.Button;
    private scoreLabel: GUI.TextBlock;

    constructor(adtSeats: GUI.AdvancedDynamicTexture, seatData: any) {
        // 創建座位容器
        this.container = adtSeats.getControlByName(seatData.name) as GUI.Rectangle;

        this.playerIcon = this.container.children.find(control => control.name === "icon") as GUI.Rectangle;
        this.playerIconBtn = this.container.children.find(control => control.name === "icon_btn") as GUI.Button;
        // this.playerIconBtn.zIndex = 10;
        // this.playerIconBtn.hoverCursor = 'pointer';

        let infoBg = this.container.children.find(control => control.name === "infoBg") as GUI.Rectangle;
        this.playerNameLabel = infoBg.children.find(control => control.name === "nameLabel") as GUI.TextBlock;

        let scoreBg = this.container.children.find(control => control.name === "scoreBg") as GUI.Ellipse;
        this.scoreLabel = scoreBg.children.find(control => control.name === "scoreLabel") as GUI.TextBlock;

        console.log("Player icon button: ", this.playerIconBtn);
        this.playerIconBtn.onPointerClickObservable.add(() => {
            console.log("Player icon button clicked ", this.playerNameLabel.text);
        });

    }

    /**
     * 顯示座位
     */
    public showGuiSeat() {
        if (this.container) {
            this.container.isVisible = true;
        }
    }

    /**
     * 隱藏座位
     */
    public hideGuiSeat() {
        if (this.container) {
            this.container.isVisible = false;
        }
    }

    /**
     * 更新玩家名稱
     */
    public updateName(name: string) {
        if (this.playerNameLabel) {
            this.playerNameLabel.text = name;
        }
    }

    /**
     * 更新玩家金額
     */
    public updateScore(score: number) {
        if (this.scoreLabel) {
            this.scoreLabel.text = score.toString();
        }
    }

    /**
     * 顯示玩家圖標
     */
    public showPlayerIcon() {
        if (this.playerIcon) {
            this.playerIcon.isVisible = true;
        }
    }

    /**
     * 隱藏玩家圖標
     */
    public hidePlayerIcon() {
        if (this.playerIcon) {
            this.playerIcon.isVisible = false;
        }
    }

    /**
     * 銷毀座位 GUI
     */
    public dispose() {
        this.container.dispose();
    }
}