import { createQueens } from './queens';
import { loadGameSave, saveGameSave } from './storage';

function createBoardSizeInput(initialSize: [number, number]): [HTMLDivElement, () => [[number, number], boolean]] {
  const container = document.createElement('div');
  container.classList.add('board-size-input');

  const label = document.createElement('p');
  label.textContent = 'BOARD SIZE:';

  const widthInput = document.createElement('input');
  widthInput.value = initialSize[0].toString();

  const seperator = document.createElement('p');
  seperator.textContent = 'X';

  const heightInput = document.createElement('input');
  heightInput.value = initialSize[1].toString();

  container.appendChild(label);
  container.appendChild(widthInput);
  container.appendChild(seperator);
  container.appendChild(heightInput);

  const getSize: () => [[number, number], boolean] = () => {
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    const size = [width, height] as [number, number];
    return [size, !size.some(len => isNaN(len) || !Number.isInteger(len) || len < 5 || len > 51) && width != height];
  };

  const onInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    input.value = input.value.slice(0, 2);

    const [_size, valid] = getSize();
    label.style.color = valid ? 'black' : 'red';
    seperator.style.color = valid ? 'black' : 'red';
  };

  widthInput.addEventListener('input', onInput);
  heightInput.addEventListener('input', onInput);

  return [container, getSize];
}

function createPlayerNameInput(
  player: number,
  color: string,
  initialPlayerName: string
): [HTMLDivElement, () => [string, boolean]] {
  const container = document.createElement('div');
  container.classList.add('player-name-input');

  const label = document.createElement('p');
  label.textContent = `PLAYER ${player}'S NAME:`;
  label.style.color = color;

  const input = document.createElement('input');
  input.value = initialPlayerName;

  container.appendChild(label);
  container.appendChild(input);

  const getName: () => [string, boolean] = () => [input.value, input.value.trim().length > 0];

  input.addEventListener('input', () => {
    const [_, valid] = getName();
    label.style.color = valid ? color : 'red';
  });

  return [container, getName];
}

function createPlayerNameInputs(
  count: number,
  colors: string[],
  initialPlayerNames: string[]
): [HTMLDivElement, () => [string[], boolean]] {
  const container = document.createElement('div');
  container.classList.add('player-name-inputs');

  const nameGetters = [];
  for (let i = 0; i < count; i++) {
    const [input, getName] = createPlayerNameInput(i + 1, colors[i], initialPlayerNames[i]);
    container.appendChild(input);
    nameGetters.push(getName);
  }

  return [
    container,
    () => {
      const results = nameGetters.map(getName => getName());
      return [results.map(result => result[0]), !results.some(result => !result[1])];
    }
  ];
}

function createScoreDisplay(initialScores: Record<string, number>, reset: () => boolean): HTMLDivElement {
  const scoreDisplay = document.createElement('div');
  scoreDisplay.classList.add('score-display');

  const resetButton = document.createElement('p');
  resetButton.classList.add('button');
  resetButton.textContent = 'RESET';

  const renderScores = (scores: Record<string, number>) => {
    scoreDisplay.innerHTML = '';

    if (Object.keys(scores).length == 0) {
      scoreDisplay.innerHTML = '<p>No scores yet!</p>';
      return;
    }

    for (const name in scores) {
      const score = document.createElement('p');
      score.textContent = `${name} - ${scores[name]}`;
      scoreDisplay.appendChild(score);
    }

    scoreDisplay.appendChild(resetButton);
  };

  resetButton.addEventListener('click', () => {
    if (!reset()) return;
    renderScores({});
  });

  renderScores(initialScores);

  return scoreDisplay;
}

function createMenu(): HTMLDivElement {
  const menu = document.createElement('div');
  menu.classList.add('menu');

  const title = document.createElement('h1');
  title.textContent = 'QUEENS';

  const gameSave = loadGameSave();

  const [boardSizeInput, getBoardSize] = createBoardSizeInput(gameSave.boardSize);
  const [playerNameInputs, getNames] = createPlayerNameInputs(2, ['blue', 'darkred'], gameSave.playerNames);

  const resetScores = () => {
    const [size, sizeValid] = getBoardSize();
    const [names, namesValid] = getNames();
    if (!sizeValid || !namesValid) return false;

    saveGameSave({ boardSize: size, playerNames: names, scores: {} });
    gameSave.scores = {};

    return true;
  };

  const scoreDisplay = createScoreDisplay(gameSave.scores, resetScores);

  const playButton = document.createElement('p');
  playButton.classList.add('play-button');
  playButton.textContent = 'PLAY';

  menu.appendChild(title);
  menu.appendChild(boardSizeInput);
  menu.appendChild(scoreDisplay);
  menu.appendChild(playerNameInputs);
  menu.appendChild(playButton);

  playButton.addEventListener('click', () => {
    const [size, sizeValid] = getBoardSize();
    const [names, namesValid] = getNames();
    if (!sizeValid || !namesValid) return;

    saveGameSave({ boardSize: size, playerNames: names, scores: gameSave.scores });
    const queens = createQueens(size, names);
    document.body.appendChild(queens.ui.element);
    menu.remove();
  });

  return menu;
}

export { createMenu };
