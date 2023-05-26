let currentSize = 6;
const MIN_SIZE_GAME_FIELD = 2; // минимальный размер поля
const MAX_SIZE_GAME_FIELD = 8; // максимальный размер поля
const STEP_CHANGE_SIZE = 2; // шаг изменения размера поля
const TIME_COMPLEXITY = 10; // множитель времени на hard
const TIMER_SWITCHED_OFF = -1; // таймер отключен по умолчанию
const SIZE_CARD_FIELD_PX = 100; // Размер ячейки карточки поля в пикселях
const INDENT_FIELD_PX = 10; // Размер отступов поля в пикселях
let gameFieldModel = {};
let firstClickedField = undefined;
let secondClickedField = undefined;
let countPairTry = 0;
let countGameSecond = 0;
let gameTimeLimitSecond = TIMER_SWITCHED_OFF;
let gameTimerInstance = undefined;
let difficult;


const showSettingScreen = () => {
  const sizeNode = document.getElementById("size");
  sizeNode.innerText = currentSize;
}

showSettingScreen()

const startGame = () => {
  difficult = document.querySelector('input[name="inlineDifficultOptions"]:checked').value;
  document.getElementById('timeOff').classList.add('displayNone');
  document.getElementById('win').classList.add('displayNone');
  document.getElementById('endGame').classList.add('displayNone');
  document.getElementById('settingScreen').classList.add('displayNone');
  document.getElementById('main').classList.remove('displayNone');

  const listNumbers = getListNumbers(currentSize)
  gameFieldModel = getGameFieldModel(listNumbers)

  if (difficult === 'easy') {
    gameTimeLimitSecond = TIMER_SWITCHED_OFF
  } else {
    gameTimeLimitSecond = currentSize * TIME_COMPLEXITY
  }

  gameTimer()
  renderGameField(gameFieldModel);
}

const getListNumbers = (currentSize) => {
  const number = [];
  let numberPair = [];
  for (let i = 0; i < ((currentSize * currentSize) / 2); ++i) {
    number.push(i+1)
  }
  numberPair = [...number, ...number];
  return mixNumberList(numberPair);
}

// Мешалка
const mixNumberList = (numberPair) => {
  let j, temp;
  for(let i = numberPair.length - 1; i > 0; i--){
    j = Math.floor(Math.random()*(i + 1));
    temp = numberPair[j];
    numberPair[j] = numberPair[i];
    numberPair[i] = temp;
  }
  return numberPair;
}

const getGameFieldModel = (listNumbers) => {
  return listNumbers.map((item, idx) => {
    return {
      id: idx,
      value: item,
      isOpen: false,
      isGuessed: false,
    }
  })
}

const gameTimer = () => {
  countPairTry = 0;
  countGameSecond = 0;
  renderTimer()

  if (difficult === 'easy') {
    gameTimerInstance = setInterval(() => {
      countGameSecond++;
    }, 1000)
  } else {
    gameTimerInstance = setInterval(() => {
      countGameSecond++;
      if (countGameSecond === gameTimeLimitSecond) {
        renderGameResult();
      }
      renderTimer()
    }, 1000)
  }
}

const renderTimer = () => {
  const timerNode = document.getElementById('timer');
  if (timerNode) {
    if (difficult === 'easy') {
      timerNode.innerHTML = 'без ограничений'
    } else {
      timerNode.innerHTML = gameTimeLimitSecond - countGameSecond;
    }
  }
}

const renderGameField = (gameFieldModel) => {
  const containerNode = document.getElementById('card-block');
  containerNode.style.width = currentSize * SIZE_CARD_FIELD_PX + INDENT_FIELD_PX + 'px';
  containerNode.style.height = currentSize * SIZE_CARD_FIELD_PX + INDENT_FIELD_PX + 'px';
  containerNode.innerHTML = '';

  gameFieldModel.forEach((item) => {
    const buttonNode = document.createElement('button');
    buttonNode.classList.add('card');
    if (difficult == 'easy') {
      buttonNode.classList.add('card_easy');
    } else {
      buttonNode.classList.add('card_hard');
    }
    buttonNode.innerHTML = item.value;
    if (item.isOpen === true) {
      buttonNode.classList.add('card_show');
    }
    buttonNode.addEventListener('click', () => handleClickGameElement(item))
    containerNode.appendChild(buttonNode);
  });
}

const handleClickGameElement = (elem) => {
  if (elem.isOpen) return

  let gameStageState = 'first';
  if (!!firstClickedField && !secondClickedField) {
    gameStageState = 'second';
  }
  if (!!firstClickedField && !!secondClickedField) {
    gameStageState = 'next';
  }

  let isGuessed = false;
  if (firstClickedField && !secondClickedField && firstClickedField.value === elem.value) {
    isGuessed = true;
  }

  gameFieldModel = gameFieldModel.map(item => {
    if (gameStageState === 'first') {
      if (item.id === elem.id) {
        item.isOpen = true;
      }
    } else if (gameStageState === 'second') {
      if (item.id === elem.id) {
        item.isOpen = true;
        item.isGuessed = isGuessed;
      }
      if (isGuessed && item.id === firstClickedField.id) {
        item.isGuessed = true;
      }
    } else if (gameStageState === 'next') {
      if (item.id === elem.id) {
        item.isOpen = true;
      }
      if (!item.isGuessed && (item.id === firstClickedField.id || item.id === secondClickedField.id)) {
        item.isOpen = false;
      }
    }
    return item;
  })

  if (gameStageState === 'first') {
    firstClickedField = elem;
  } else if (gameStageState === 'second') {
    secondClickedField = elem;
    countPairTry++;
  } else if (gameStageState === 'next') {
    firstClickedField = elem;
    secondClickedField = undefined;
  }

  const finish = getIsEndGame(gameFieldModel);
  if (finish) {
    renderGameResult()
    document.getElementById('win').classList.remove('displayNone');
  } else {
    renderGameField(gameFieldModel);
  }
}

const getIsEndGame = (gameFieldModel) => {
  return !gameFieldModel.find(item => {
    if (!item.isGuessed) {
      return true;
    }
  })
}

const renderGameResult = () => {
  clearInterval(gameTimerInstance);

  if (countGameSecond === gameTimeLimitSecond) {
    document.getElementById('timeOff').classList.remove('displayNone');
  }
  const countPairTryNode = document.getElementById('countPairTry');
  countPairTryNode.innerHTML = ('Пар попыток: ' + countPairTry);
  const countGameSecondNode = document.getElementById('countGameSecond');
  countGameSecondNode.innerHTML = ('Время игры в секундах: ' + countGameSecond);
  document.getElementById('main').classList.add('displayNone');
  document.getElementById('endGame').classList.remove('displayNone');
}

const handleSizeIncrement = () => {
  if (currentSize + STEP_CHANGE_SIZE <= MAX_SIZE_GAME_FIELD) {
    const sizeNode = document.getElementById("size");
    currentSize += STEP_CHANGE_SIZE;
    sizeNode.innerText = currentSize;
  }
}

const handleSizeDecrement = () => {
  if (currentSize - STEP_CHANGE_SIZE >= MIN_SIZE_GAME_FIELD) {
    const sizeNode = document.getElementById("size");
    currentSize -= STEP_CHANGE_SIZE;
    sizeNode.innerText = currentSize;
  }
}
