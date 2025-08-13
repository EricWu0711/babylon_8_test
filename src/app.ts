import { GameView } from './views/gameView';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    const gameView = new GameView(canvas);
    gameView.run();
});
