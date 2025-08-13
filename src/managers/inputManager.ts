import { IControllable } from '../constants/interfaces';

/**
 * 輸入管理器
 * 集中監聽鍵盤與滑鼠事件，並分派動作給目前註冊的可控制物件
 */
export class InputManager {
    private controllable: { [key: string]: IControllable } = {};
    private controllList: string[] = [];
    private eventsOnKeyboardC: { [key: string]: () => void } = {};
    private eventsNameOnC: string[] = [];
    private eventsOnKeyboardX: { [key: string]: () => void } = {};
    private eventsNameOnX: string[] = [];

    private isDragging: boolean = false;
    private lastX: number = 0;
    private lastY: number = 0;

    /**
     * 註冊目前要被控制的物件
     * @param obj IControllable - 需實作 IControllable 介面
     */
    public setControllable(obj: IControllable, name: string) {
        this.controllable[name] = obj;
        this.controllList.push(name);
    }

    public bindCallbackOnKeyboardC(callback: () => void, eventName: string) {
        this.eventsOnKeyboardC[eventName] = callback;
        this.eventsNameOnC.push(eventName);
    }

    public bindCallbackOnKeyboardX(callback: () => void, eventName: string) {
        this.eventsOnKeyboardX[eventName] = callback;
        this.eventsNameOnX.push(eventName);
    }
    /**
     * 綁定鍵盤與滑鼠事件，解析並分派動作
     */
    public bindEvents() {
        // 鍵盤事件
        window.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w':
                    for (const name of this.controllList) {
                        if (typeof this.controllable[name].moveForward === 'function')
                            this.controllable[name].moveForward();
                    }
                    break;
                case 's':
                    for (const name of this.controllList) {
                        if (typeof this.controllable[name].moveBackward === 'function')
                            this.controllable[name].moveBackward();
                    }
                    break;
                case 'a':
                    for (const name of this.controllList) {
                        if (typeof this.controllable[name].moveLeft === 'function') this.controllable[name].moveLeft();
                    }
                    break;
                case 'd':
                    for (const name of this.controllList) {
                        if (typeof this.controllable[name].moveRight === 'function')
                            this.controllable[name].moveRight();
                    }
                    break;
                case 'c':
                    for (const name of this.eventsNameOnC) {
                        this.eventsOnKeyboardC[name]();
                    }
                    break;
                case 'x':
                    for (const name of this.eventsNameOnX) {
                        this.eventsOnKeyboardX[name]();
                    }
                    break;
            }
        });

        // 滑鼠拖曳事件
        window.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });
        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastX;
                const dy = e.clientY - this.lastY;
                for (const name of this.controllList) {
                    if (typeof this.controllable[name].rotateBy === 'function') {
                        this.controllable[name].rotateBy(dx, dy);
                    }
                }
                this.lastX = e.clientX;
                this.lastY = e.clientY;
            }
        });
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }
}
