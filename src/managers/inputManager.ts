import { IControllable } from '../constants/interfaces';

const interactBtn = ['w', 'a', 's', 'd', 'c', 'x', 'f'];
/**
 * 輸入管理器
 * 集中監聽鍵盤與滑鼠事件，並分派動作給目前註冊的可控制物件
 */
export class InputManager {
    private controllable: { [key: string]: IControllable } = {};
    private controllList: string[] = [];
    private keyboardConfigs: { [key: string]: { [key: string]: () => void } } = {};
    private pressedKeys: { [key: string]: boolean } = {};

    private eventsOnKeyboard: { [key: string]: { [eventName: string]: () => void } } = {};
    private eventsNameOn: { [key: string]: string[] } = {};

    private isDragging: boolean = false;
    private lastX: number = 0;
    private lastY: number = 0;

    /**
     * 註冊目前要被控制的物件
     * @param obj IControllable - 需實作 IControllable 介面
     */
    public setControllable(obj: IControllable, name: string, keyboardConfig: { [key: string]: () => void }) {
        this.controllable[name] = obj;
        this.controllList.push(name);
        this.keyboardConfigs[name] = keyboardConfig;
    }

    /**
     * 檢查鍵盤輸入並執行對應動作
     */
    public checkKeyboardInput() {
        for (const name of this.controllList) {
            const config = this.keyboardConfigs[name];
            if (config) {
                for (const key in config) {
                    if (this.pressedKeys[key]) {
                        config[key]();
                    }
                }
            }
        }
    }

    public bindCallbackOnKeyboard(key: string, callback: () => void, eventName: string) {
        // 確保 eventsOnKeyboard[key] 已初始化
        if (!this.eventsOnKeyboard[key]) {
            this.eventsOnKeyboard[key] = {};
        }

        // 確保 eventsNameOn[key] 已初始化
        if (!this.eventsNameOn[key]) {
            this.eventsNameOn[key] = [];
        }

        this.eventsOnKeyboard[key][eventName] = callback;
        this.eventsNameOn[key].push(eventName);
    }

    /**
     * 綁定鍵盤與滑鼠事件，解析並分派動作
     */
    public bindEvents() {
        // 鍵盤事件
        window.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w':
                case 's':
                case 'a':
                case 'd':
                    this.pressedKeys[e.key.toLowerCase()] = true;
                    break;
                case 'c':
                    for (const name of this.eventsNameOn['C']) {
                        this.eventsOnKeyboard['C'][name]();
                    }
                    break;
                case 'x':
                    for (const name of this.eventsNameOn['X']) {
                        this.eventsOnKeyboard['X'][name]();
                    }
                    break;
                case 'f':
                    for (const name of this.eventsNameOn['F']) {
                        this.eventsOnKeyboard['F'][name]();
                    }
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w':
                case 's':
                case 'a':
                case 'd':
                    this.pressedKeys[e.key.toLowerCase()] = false;
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

    public get PressedKeys() {
        return this.pressedKeys;
    }
}
