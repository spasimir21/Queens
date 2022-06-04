import { QueensSimulation, GameState, Player } from './simulation';
import { Stamat } from './stamat';
import { modifySavedScore } from './storage';
import { QueensUI } from './ui';

interface Queens {
  simulation: QueensSimulation;
  ui: QueensUI;
}

function createQueensVsPlayer(gridSize: [number, number], players: string[]): Queens {
  const simulation = new QueensSimulation(gridSize);
  const ui = new QueensUI(gridSize);

  simulation.onCellStateChange.listen((cell, state) => ui.setCellState(cell, state));

  simulation.onGameStateChange.listen((state, player) => {
    if (state == GameState.Place) ui.setTopText('PLACE QUEEN', 'black');
    else ui.setTopText(`${players[player]} WINS!`, player == Player.Player1 ? 'blue' : 'red');

    ui.deactivateAllCells();
    for (const cell of simulation.playableCells) ui.activateCell(cell);

    if (state != GameState.Win) ui.setBottomText(`${players[player]}'S TURN`, player == Player.Player1 ? 'blue' : 'red');
    else {
      modifySavedScore(players[player], 1);
      modifySavedScore(players[1 - player], 0); // 1 - player (Flips the current player)
      ui.showEndControls();
    }
  });

  ui.onCellClicked.listen(cell => simulation.makePlay(cell, true));

  ui.init();
  simulation.init();

  return { simulation, ui };
}

function createQueensVsBot(gridSize: [number, number], players: string[], botDifficulty: number): Queens {
  players[players.length - 1] = 'STAMAT';

  const simulation = new QueensSimulation(gridSize);
  const bot = new Stamat(botDifficulty, simulation);
  const ui = new QueensUI(gridSize);

  simulation.onCellStateChange.listen((cell, state) => ui.setCellState(cell, state));

  simulation.onGameStateChange.listen((state, player) => {
    const isBotsTurn = player == Player.Player2;

    if (state == GameState.Place) ui.setTopText('PLACE QUEEN', 'black');
    else ui.setTopText(`${players[player]} WINS!`, player == Player.Player1 ? 'blue' : 'red');

    ui.deactivateAllCells();
    if (!isBotsTurn) for (const cell of simulation.playableCells) ui.activateCell(cell);

    if (state != GameState.Win) ui.setBottomText(`${players[player]}'S TURN`, player == Player.Player1 ? 'blue' : 'red');
    else {
      modifySavedScore(players[player], 1);
      modifySavedScore(players[1 - player], 0); // 1 - player (Flips the current player)
      ui.showEndControls();
      return;
    }

    if (isBotsTurn) setTimeout(() => bot.makeMove(), 500);
  });

  ui.onCellClicked.listen(cell => {
    simulation.makePlay(cell, true);
    bot.registerEnemyMove(cell);
  });

  ui.init();
  simulation.init();

  return { simulation, ui };
}

export { createQueensVsPlayer, createQueensVsBot };
