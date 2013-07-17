
var pegsDiv;
var centerPegDiv;
var messageDiv = document.getElementById('endMessage');
var endMessages = {
  'perfect' : 'Perfect!',
  1         : 'You get an A',
  2         : 'You get a B',
  3         : 'You get a C',
  4         : 'You get a D',
  5         : 'You get an F',
  'over5'   : 'You suck'
}

function init() {
  initBoard();
  initEventing();
};

function initBoard() {
  var gameboardDiv = document.getElementById('gameboard');
  var rowDiv;
  var pegVal;
  var pegContainerDiv;
  var board = [
    [null, null, 1, 1, 1, null, null],
    [null, null, 1, 1, 1, null, null],
    [1,    1,    1, 1, 1, 1,    1],
    [1,    1,    1, 0, 1, 1,    1],
    [1,    1,    1, 1, 1, 1,    1],
    [null, null, 1, 1, 1, null, null],
    [null, null, 1, 1, 1, null, null]
  ];

  for (var r = 0; r < board.length; r++) {
    rowDiv = document.createElement('div');
    rowDiv.className = 'boardRow';
    for (var c = 0; c < board[r].length; c++) {
      pegVal = board[r][c];
      pegContainerDiv = document.createElement('div');
      pegContainerDiv['className'] = 'pegContainer';
      if (pegVal === null) {
        pegContainerDiv.appendChild(createPeg('nullPiece', r, c));
      } else if (pegVal === 1) {
        pegContainerDiv.appendChild(createPeg('occupiedPeg', r, c));
      } else {
        pegContainerDiv.appendChild(createPeg('emptyPeg', r, c));
      }
      rowDiv.appendChild(pegContainerDiv);
    }
    gameboardDiv.appendChild(rowDiv);
  }
  pegsDiv = document.getElementsByClassName('peg');
  var count = countRemaining();
  messageDiv.innerHTML = count + " pegs";
};

function initEventing() {
  var pegDiv, className;
  for (var i = 0; i < pegsDiv.length; i++) {
    pegsDiv[i].onmousedown = function(e) {
      className = this['className'];
      if (className.indexOf('occupiedPeg') > -1) {
        clearAllSelections();
        if (className.indexOf('selected') === -1) {
          this['className'] = className + ' selected';
          highlightValidMoves(this);
        }
      } else if (className.indexOf('emptyPeg') > -1 &&
                 className.indexOf('validDest') > -1) {
        executeMove(this);
        clearAllSelections();
      }
    };
  }
};

function clearAllSelections() {
  var pegDiv;
  for (var i = 0; i < pegsDiv.length; i++) {
    pegDiv = pegsDiv[i];
    pegDiv['className'] = pegDiv['className'].replace('selected', '').replace('validDest', '');
  }
};

function highlightValidMoves(startDiv) {
  var pegDiv;
  for (var i = 0; i < pegsDiv.length; i++) {
    pegDiv = pegsDiv[i];
    if (destIsValid(startDiv, pegDiv)) {
      pegDiv['className'] += ' validDest';
    }
  }
};

function destIsValid(startDiv, endDiv) {
  return !(
    (endDiv['className'].indexOf('emptyPeg') < 0) ||
    (!(startDiv['data-row'] === endDiv['data-row'] ||
       startDiv['data-col'] === endDiv['data-col'])) ||
    (Math.abs(startDiv['data-row'] - endDiv['data-row']) !== 2 &&
     Math.abs(startDiv['data-col'] - endDiv['data-col']) !== 2) ||
    (getPieceInBetween(startDiv, endDiv)['className'].indexOf('occupiedPeg') === -1)
  );
};

function executeMove(destDiv) {
  var selectedDiv;
  for (var i = 0; i < pegsDiv.length; i++) {
    if (pegsDiv[i]['className'].indexOf('selected') > 0) {
      selectedDiv = pegsDiv[i];
      break;
    }
  }
  selectedDiv['className'] = selectedDiv['className'].replace('selected', '').replace('occupiedPeg', 'emptyPeg');

  destDiv['className'] = destDiv['className'].replace('validDest', '').replace('emptyPeg', 'occupiedPeg');

  var inBetweenDiv = getPieceInBetween(selectedDiv, destDiv);
  inBetweenDiv['className'] = inBetweenDiv['className'].replace('occupiedPeg', 'emptyPeg');
  var count = countRemaining();
  messageDiv.innerHTML = count + " pegs";
  if (!checkForJumps()) {
    var message = endMessages[count];
    if (message === undefined) {
      message = endMessages['over5'];
    } else if (count === 1) {
      if (centerPegDiv['className'].indexOf('occupiedPeg') > -1) {
        message = endMessages['perfect'];
      }
    }
    messageDiv.innerHTML = message;
    messageDiv.style['color'] = '#57288a';
  }
};

function checkForJumps() {
  var pegDiv;
  for (var i = 0; i < pegsDiv.length; i++) {
    for (var j = 0; j < pegsDiv.length; j++) {
      pegDiv = pegsDiv[i];
      if (pegDiv['className'].indexOf('occupiedPeg') > -1 && destIsValid(pegDiv, pegsDiv[j])) {
        return true;
      }
    }
  }
  return false;
};

function countRemaining() {
  var pegDiv;
  var count = 0;
  for (var i = 0; i < pegsDiv.length; i++) {
    pegDiv = pegsDiv[i];
    if (pegDiv['className'].indexOf('occupiedPeg') > -1) {
      count++;
    }
  }
  return count;
}

var getPieceInBetween = function(pieceA, pieceB) {
  var row, col, inBetweenDiv;
  if (pieceA['data-row'] === pieceB['data-row']) {
    row = pieceA['data-row'];
    col = pieceA['data-col'] > pieceB['data-col']
      ? pieceA['data-col'] - 1
      : pieceB['data-col'] - 1;
  } else {
    col = pieceA['data-col'];
    row = pieceA['data-row'] > pieceB['data-row']
      ? pieceA['data-row'] - 1
      : pieceB['data-row'] - 1
  }
  for (var i = 0; i < pegsDiv.length; i++) {
    inBetweenDiv = pegsDiv[i];
    if (inBetweenDiv['data-row'] === row && inBetweenDiv['data-col'] === col) {
      return inBetweenDiv;
    }
  }
};

var createPeg = function(type, row, col) {
  var div = document.createElement('div');
  div['className'] = type + ' peg';
  div['data-row'] = row;
  div['data-col'] = col;
  if (row === 3 && col === 3) {
    div['id'] = 'centerPeg';
    centerPegDiv = div;
  }
  return div;
};


init();