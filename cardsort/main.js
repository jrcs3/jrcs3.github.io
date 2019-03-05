var canvas;
var ctx;

var x = 75;
var y = 50;

const drawer = new Drawer();
const cardUtil = new CardUtil();


let _merge = new Merge(cardUtil);

const state = {
  isDirty: false,
  comparisons: 0,
  cycles: 0,
  isSorted: false,
  selectedCard: {},
  deck: {}
};
var dragok = false;

var order = getInitalOrder();

let suit = parseInt(getParameterByName("suit") || Math.floor(Math.random() * 4));
//let suit = Math.floor(Math.random() * 4);
state.deck = cardUtil.getSuitOfCards(suit, order);
//state.deck = cardUtil.setDeckOrder(state.deck, order);
//let state.selectedCard;
resetDeck();

var img = new Image();
img.src = "cards.png";

function linkControls() {
  bindCtlTo("btnComShuffle", "click", shuffle);
  bindCtlTo("btnBubMoveDown", "click", moveDown);
  bindCtlTo("btnBubSwapNext", "click", swapAndMoveDown);
  bindCtlTo("btnBubNextMove", "click", e => bubbleNextMove(false));
  bindCtlTo("btnBubNextMoveShortcut", "click", e => bubbleNextMove(true));
  bindCtlTo("btnComReset", "click", resetDeck);
  bindCtlTo("btnComSnap", "click", snapSelectedCard);
  bindCtlTo("btnComLineUp", "click", lineupCards);
  bindCtlTo("btnInsShiftAllRight", "click", shiftAllRight);
  bindCtlTo("btnInsNextMove", "click", insertNextMove);
  bindCtlTo("btnMerShiftAllDown", "click", shiftAllDown);
  bindCtlTo("btnInsMoveDown", "click", moveDown);
  bindCtlTo("btnMerShiftAllUp", "click", shiftAllUp);
  bindCtlTo("btnMerSwapRight", "click", swapRight);
  bindCtlTo("btnQusMoveToCol", "click", moveToCol);
  bindCtlTo("btnQusFirstInRow", "click", firstInRow);
  bindCtlTo("btnQusLastInRow", "click", lastInRow);
  bindCtlTo("btnMerGetMiddleOfRow", "click", middleOfRow);
  bindCtlTo("btnComGetUrl", "click", getCardOrder);
  bindCtlTo("btnComTest", "click", mergeNextMove);
  bindCtlTo("body", "keydown", canvasKeyDown);
}

function mergeNextMove() {
  if (_merge.mergeStage === 0) {
    _merge.mergeStage = 1;
  }
  if (_merge.mergeStage === 1) {
    _merge.mergeDivide(state);
  } else if (_merge.mergeStage >= 2) {
    alert('Merge')
    _merge.mergeCombineTwoLists(state);
  }
}

function bindCtlTo(id, event, action) {
  const ctl = document.getElementById(id);
  ctl.addEventListener(event, action);
}

function canvasKeyDown(e) {
  switch (e.key) {
    case "1":
      return bubbleNextMove(false);
    case "2":
      return bubbleNextMove(true);
    case "3":
      return insertNextMove();
    case "a":
      return snapSelectedCard();
    case "ArrowDown":
      return shiftAllDown();
    case "ArrowUp":
      return shiftAllUp();
    case "ArrowLeft":
      return shiftAllLeft();
    case "ArrowRight":
      return shiftAllRight();
  }
}

function getCardOrder() {
  alert(cardUtil.getCardOrder(state.deck));
}

function middleOfRow() {
  if (state.selectedCard) {
    state.selectedCard.isSelected = false;
    state.selectedCard = cardUtil.getMiddleOfRow(
      state.selectedCard,
      state.deck
    );
  }
}

function firstInRow() {
  if (state.selectedCard) {
    state.selectedCard.isSelected = false;
    state.selectedCard = cardUtil.getEndOfRow(
      state.selectedCard,
      state.deck,
      true
    );
  }
}

function lastInRow() {
  if (state.selectedCard) {
    state.selectedCard.isSelected = false;
    state.selectedCard = cardUtil.getEndOfRow(
      state.selectedCard,
      state.deck,
      false
    );
  }
}

function moveToCol() {
  if (state.selectedCard) {
    state.selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
    state.selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
    state.selectedCard.locY =
      Math.floor(cardUtil.cardWidth * (state.selectedCard.value - 1)) +
      cardUtil.leftOffset;
  }
}

function swapRight() {
  if (state.selectedCard) {
    var otherCard = cardUtil.getLeftmostCard(
      state.deck,
      //state.selectedCard.locY + CARD_SCALE_WIDTH
      state.selectedCard.locY + CARD_SCALE_WIDTH * 2,
      state.selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (otherCard) {
      cardUtil.cardSwap(state.selectedCard, otherCard, state);
    }
  }
}

function shuffle() {
  cardUtil.shuffle(state.deck);
  resetDeck();
}

function insertNextMove() {
  if (!cardUtil.areThereCardsBelowTopRow(state.deck)) {
    state.selectedCard = cardUtil.getLeftmostCard(state.deck);
    state.selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
    state.selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
    state.selectedCard.isSelected = true;
    return;
  }
  if (state.selectedCard) {
    const card = cardUtil.getLeftmostCardOnTopRow(state.deck);
    state.comparisons++;
    if (card && card.value < state.selectedCard.value) {
      state.selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
      card.swapped = true;
      card.isSelected = false;
      state.selectedCard.isSelected = false;
      const x = state.selectedCard.locX;
      const y = state.selectedCard.locY;
      cardUtil.shiftAllHorz(state.selectedCard, state.deck, false);
      card.locX = x;
      card.locY = y;
      let otherCard = cardUtil.getSelectedCard(
        state.deck,
        //state.selectedCard.locY + CARD_SCALE_WIDTH
        state.selectedCard.locY + CARD_SCALE_WIDTH * 2,
        state.selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
      );
      if (otherCard) {
        cardUtil.shiftAllVert(otherCard, state.deck, false);
      }
      mergeProcessFoundMatch(card);
    } else {
      state.selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
      let otherCard = cardUtil.getSelectedCard(
        state.deck,
        //state.selectedCard.locY + CARD_SCALE_WIDTH
        state.selectedCard.locY + CARD_SCALE_WIDTH * 2,
        state.selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
      );
      if (otherCard) {
        state.selectedCard.isSelected = false;
        state.selectedCard = otherCard;
      } else {
        card.locX = state.selectedCard.locX;
        state.selectedCard.isSelected = false;
        mergeProcessFoundMatch(card);
      }
    }
  }
}

function mergeProcessFoundMatch(card) {
  const otherCard = cardUtil.getLeftmostCardOnTopRow(state.deck);
  if (!otherCard) {
    state.isSorted = true;
  }
  state.selectedCard = cardUtil.getLeftmostCard(state.deck);
  cardUtil.unswapAll(state.deck);
  card.swapped = true;
  state.cycles++;
  state.isDirty = false;
}

function shiftAllRight() {
  if (state.selectedCard) {
    cardUtil.shiftAllHorz(state.selectedCard, state.deck, false);
  }
}

function shiftAllLeft() {
  if (state.selectedCard) {
    cardUtil.shiftAllHorz(state.selectedCard, state.deck, true);
  }
}

function shiftAllDown() {
  if (state.selectedCard) {
    cardUtil.shiftAllVert(state.selectedCard, state.deck, false);
  }
}

function shiftAllUp() {
  if (state.selectedCard) {
    cardUtil.shiftAllVert(state.selectedCard, state.deck, true);
  }
}

function lineupCards() {
  cardUtil.snapCards(state.deck);
  cardUtil.lineupCards(state.deck);
}

function snapSelectedCard() {
  cardUtil.snapCards(state.deck);
}

function resetDeck() {
  state.selectedCard = null;
  cardUtil.placeCardPostions(state.deck);
  state.isDirty = false;
  state.comparisons = 0;
  state.cycles = 0;
  state.isSorted = false;
  //state.mergeStage = 0;
  _merge.reset(state);
  state.selectedCard = cardUtil.getLeftmostCard(state.deck);
}

function bubbleNextMove(shortcut) {
  if (state.selectedCard) {
    let skip = false;
    state.comparisons++;
    var otherCard = cardUtil.getSelectedCard(
      state.deck,
      state.selectedCard.locY + CARD_SCALE_WIDTH * 2,
      state.selectedCard.locX + CARD_SCALE_HEIGHT * 0.2
    );
    if (shortcut && otherCard) {
      var anotherCard = cardUtil.getSelectedCard(
        state.deck,
        otherCard.locY + CARD_SCALE_WIDTH * 2,
        otherCard.locX + CARD_SCALE_HEIGHT * 0.6
      );
      if (!anotherCard) {
        skip = true;
      }
    }

    if (otherCard) {
      if (otherCard.value < state.selectedCard.value) {
        cardUtil.cardSwapAndShift(state.selectedCard, otherCard, state);
      } else {
        state.selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
        state.selectedCard.isSelected = false;
        state.selectedCard = otherCard;
      }
      if (skip) {
        state.selectedCard = cardUtil.getLeftmostCard(state.deck);
        cardUtil.unswapAll(state.deck);
        state.isSorted = !state.isDirty;
        state.cycles++;
        state.isDirty = false;
      }
    } else {
      state.selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
      state.selectedCard.isSelected = false;
      state.selectedCard = cardUtil.getLeftmostCard(state.deck);
      cardUtil.unswapAll(state.deck);
      state.isSorted = !state.isDirty;
      state.cycles++;
      state.isDirty = false;
    }
  }
}

function moveDown() {
  if (state.selectedCard) {
    state.comparisons++;
    state.selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
    var otherCard = cardUtil.getLeftmostCard(
      state.deck,
      //state.selectedCard.locY + CARD_SCALE_WIDTH
      state.selectedCard.locY + CARD_SCALE_WIDTH * 2,
      state.selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (otherCard) {
      state.selectedCard.isSelected = false;
      state.selectedCard = otherCard;
    } else {
      state.selectedCard.isSelected = false;
      state.selectedCard = cardUtil.getLeftmostCard(state.deck);
      cardUtil.unswapAll(state.deck);
      state.cycles++;
      state.isDirty = false;
    }
  }
}

function swapAndMoveDown() {
  if (state.selectedCard) {
    state.comparisons++;
    var otherCard = cardUtil.getLeftmostCard(
      state.deck,
      //state.selectedCard.locY + CARD_SCALE_WIDTH
      state.selectedCard.locY + CARD_SCALE_WIDTH * 2,
      state.selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (otherCard) {
      cardUtil.cardSwapAndShift(state.selectedCard, otherCard, state);
    }
  }
}

function rect(x, y, w, h) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.closePath();
  ctx.fill();
}

function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  cardUtil.offsetLeft = canvas.offsetLeft;
  cardUtil.offsetTop = canvas.offsetTop;

  return setInterval(myDraw, 10);
}

function myDraw() {
  drawer.draw(ctx, state.deck, state.selectedCard, state);
}

function myMove(e) {
  if (dragok) {
    x = e.pageX - cardUtil.offsetLeft;
    y = e.pageY - cardUtil.offsetTop;
    state.selectedCard.locX =
      y - (state.selectedCard.locOffX - cardUtil.offsetLeft);
    state.selectedCard.locY =
      x - (state.selectedCard.locOffY - cardUtil.offsetTop);
  }
}

function myDown(e) {
  if (state.selectedCard) {
    state.selectedCard.isSelected = false;
    state.selectedCard = null;
  }
  state.selectedCard = cardUtil.getSelectedCard(
    state.deck,
    e.pageX,
    e.pageY
  );
  if (state.selectedCard) {
    state.selectedCard.isSelected = true;
    x = e.pageX - cardUtil.offsetLeft;
    y = e.pageY - cardUtil.offsetTop;
    dragok = true;
    canvas.onmousemove = myMove;
  }
}

function myUp() {
  dragok = false;
  canvas.onmousemove = null;
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getInitalOrder() {
  order = getParameterByName("order");
  if (!order) {
    let returnValue = [...Array(14).keys()];
    returnValue.shift();
    return returnValue;
  }
  return order.split(",").map(item => parseInt(item));
}

init();
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;

linkControls();
