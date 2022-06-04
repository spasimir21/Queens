import { createQueensVsBot, createQueensVsPlayer } from './queens';
import { loadGameSave, saveGameSave } from './storage';

function createBoardSizeInput(
  initialSize: [number, number],
  onSizeChange: (size: [number, number], valid: boolean) => void
): [HTMLDivElement, () => [[number, number], boolean]] {
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
    return [size, !size.some(len => isNaN(len) || !Number.isInteger(len) || len < 5 || len > 51)];
  };

  const onInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    input.value = input.value.slice(0, 2);

    const [_size, valid] = getSize();
    label.style.color = valid ? 'black' : 'red';
    seperator.style.color = valid ? 'black' : 'red';

    onSizeChange(_size, valid);
  };

  widthInput.addEventListener('input', onInput);
  heightInput.addEventListener('input', onInput);

  return [container, getSize];
}

function createPlayerNameInput(
  player: number,
  color: string,
  initialPlayerName: string
): [HTMLDivElement, () => [string, boolean], (isBot: boolean) => void] {
  const container = document.createElement('div');
  container.classList.add('player-name-input');

  const label = document.createElement('p');
  label.textContent = `PLAYER ${player}'S NAME:`;
  label.style.color = color;

  const input = document.createElement('input');
  input.value = initialPlayerName;

  container.appendChild(label);
  container.appendChild(input);

  const getName: () => [string, boolean] = () => [input.value.trim(), input.value.trim().length > 0];

  input.addEventListener('input', () => {
    const [_, valid] = getName();
    label.style.color = valid ? color : 'red';
  });

  let tempName = input.value;
  let isBot = false;
  return [
    container,
    () => (isBot ? [tempName.trim(), tempName.trim().length > 0] : getName()),
    _isBot => {
      isBot = _isBot;
      if (isBot) {
        tempName = input.value;
        input.value = 'Stamat';
        input.disabled = true;
      } else {
        input.value = tempName;
        input.disabled = false;
      }
    }
  ];
}

function createPlayerNameInputs(
  count: number,
  colors: string[],
  initialPlayerNames: string[]
): [HTMLDivElement, () => [string[], boolean], (isBot: boolean) => void] {
  const container = document.createElement('div');
  container.classList.add('player-name-inputs');

  const nameGetters = [];
  let lastSetIsBot;
  for (let i = 0; i < count; i++) {
    const [input, getName, setIsBot] = createPlayerNameInput(i + 1, colors[i], initialPlayerNames[i]);
    container.appendChild(input);
    nameGetters.push(getName);
    lastSetIsBot = setIsBot;
  }

  return [
    container,
    () => {
      const results = nameGetters.map(getName => getName());
      return [results.map(result => result[0]), !results.some(result => !result[1])];
    },
    lastSetIsBot
  ];
}

function createScoreDisplay(initialScores: Record<string, number>, resetScores: () => void): HTMLDivElement {
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
    resetScores();
    renderScores({});
  });

  renderScores(initialScores);

  return scoreDisplay;
}

function createBotSwitch(initialIsBot: boolean, setIsBot: (isBot: boolean) => void): [HTMLParagraphElement, () => boolean] {
  const botSwitch = document.createElement('p');
  botSwitch.classList.add('button');
  let isBot = initialIsBot;

  botSwitch.addEventListener('click', () => {
    isBot = !isBot;
    setIsBot(isBot);
    botSwitch.textContent = isBot ? 'Player VS Bot' : 'Player VS Player';
  });

  setIsBot(isBot);
  botSwitch.textContent = isBot ? 'Player VS Bot' : 'Player VS Player';

  return [botSwitch, () => isBot];
}

function createBotDifficultySlider(
  initialDifficulty: number,
  initialSize: [number, number]
): [HTMLDivElement, () => number, (size: [number, number], valid: boolean) => void] {
  const sliderContainer = document.createElement('div');
  sliderContainer.classList.add('slider-container');

  const label = document.createElement('p');
  label.textContent = 'Bot Difficulty: ';

  const slider = document.createElement('input');
  slider.classList.add('slider');
  slider.type = 'range';
  slider.min = '1';

  slider.value = initialDifficulty.toString();

  const difficultyDisplay = document.createElement('p');
  difficultyDisplay.textContent = '5';

  sliderContainer.appendChild(label);
  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(difficultyDisplay);

  slider.addEventListener('input', () => (difficultyDisplay.textContent = slider.value));

  const updateMaxDifficulty = (size: [number, number], valid: boolean) => {
    if (!valid) return;
    const cells = size[0] * size[1];
    const max = cells <= 100 ? 4 : cells <= 250 ? 3 : cells <= 500 ? 2 : 1;
    if (parseInt(slider.value) > max) slider.value = max.toString();
    difficultyDisplay.textContent = slider.value;
    slider.max = max.toString();
    slider.style.display = cells >= 1000 ? 'none' : null;
  };

  updateMaxDifficulty(initialSize, true);

  return [sliderContainer, () => parseInt(slider.value), updateMaxDifficulty];
}

function createMenu(): HTMLDivElement {
  const menu = document.createElement('div');
  menu.classList.add('menu');

  const title = document.createElement('h1');
  title.textContent = 'QUEENS';

  const gameSave = loadGameSave();

  const [botDifficultySlider, getBotDifficulty, setGridSize] = createBotDifficultySlider(
    gameSave.botDifficulty,
    gameSave.boardSize
  );

  const [boardSizeInput, getBoardSize] = createBoardSizeInput(gameSave.boardSize, setGridSize);
  const [playerNameInputs, getNames, namesSetIsBot] = createPlayerNameInputs(2, ['blue', 'darkred'], gameSave.playerNames);

  const resetScores = () => {
    gameSave.scores = {};
    saveGameSave(gameSave);
  };

  const scoreDisplay = createScoreDisplay(gameSave.scores, resetScores);

  const [botSwitch, getIsBot] = createBotSwitch(gameSave.vsBot, isBot => {
    botDifficultySlider.style.display = isBot ? null : 'none';
    namesSetIsBot(isBot);
  });

  botDifficultySlider.style.display = gameSave.vsBot ? null : 'none';

  const playButton = document.createElement('p');
  playButton.classList.add('play-button');
  playButton.textContent = 'PLAY';

  menu.appendChild(title);
  menu.appendChild(boardSizeInput);
  menu.appendChild(scoreDisplay);
  menu.appendChild(botSwitch);
  menu.appendChild(botDifficultySlider);
  menu.appendChild(playerNameInputs);
  menu.appendChild(playButton);

  playButton.addEventListener('click', () => {
    const botDifficulty = getBotDifficulty();
    const [size, sizeValid] = getBoardSize();
    const [names, namesValid] = getNames();
    const isBot = getIsBot();
    if (!sizeValid || !namesValid) return;

    saveGameSave({
      boardSize: size,
      playerNames: names,
      botDifficulty,
      vsBot: isBot,
      scores: gameSave.scores
    });

    const queens = isBot ? createQueensVsBot(size, names, botDifficulty) : createQueensVsPlayer(size, names);
    document.body.appendChild(queens.ui.element);
    menu.remove();
  });

  return menu;
}

export { createMenu };
