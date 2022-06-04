// Don't try to break the game save by editing localStorage please :)
// 'Cause you will succeed, but I aslo didn't implement any checking for it
// since it's pretty weird for a random player to attempt it.

const GAME_SAVE_KEY = '$QUEENS_GAME_SAVE';

interface GameSave {
  boardSize: [number, number];
  playerNames: string[];
  scores: Record<string, number>;
}

function getDefaultGameSave(): GameSave {
  return {
    boardSize: [7, 9],
    playerNames: ['PLAYER 1', 'PLAYER 2'],
    scores: {}
  };
}

function loadGameSave(): GameSave {
  const saved = localStorage.getItem(GAME_SAVE_KEY);
  if (saved == null) return getDefaultGameSave();
  return JSON.parse(saved);
}

function saveGameSave(gameSave: GameSave) {
  localStorage.setItem(GAME_SAVE_KEY, JSON.stringify(gameSave));
}

function modifySavedScore(name: string, change: number) {
  const save = loadGameSave();

  if (!(name in save.scores)) save.scores[name] = 0;
  save.scores[name] += change;

  saveGameSave(save);
}

export { loadGameSave, saveGameSave, modifySavedScore, GameSave };
