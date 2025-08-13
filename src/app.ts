import { GameView } from './views/gameView';

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    const gameView = new GameView(canvas);
    gameView.run();
});