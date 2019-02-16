var canvas;
var ctx;

var x = 75;
var y = 50;

const drawer = new Drawer();
const cardUtil = new CardUtil();

const state = {
  isDirty: false,
  comparisons: 0,
  cycles: 0,
  isSorted: false
};
var dragok = false;

var order = getInitalOrder();

let suit = parseInt(getParameterByName("suit") || 2);
//let suit = Math.floor(Math.random() * 4);
let deck = cardUtil.getSuitOfCards(suit, order);
//deck = cardUtil.setDeckOrder(deck, order);
let selectedCard;
resetDeck();

var img = new Image();
img.src = "cards.png";

function linkControls() {
  bindCtlTo("btnComShuffle", "click", shuffle);
  bindCtlTo("btnBubMoveDown", "click", moveDown);
  bindCtlTo("btnBubSwapNext", "click", swapAndMoveDown);
  bindCtlTo("btnBubNextMove", "click", e => nextMove(false));
  bindCtlTo("btnBubNextMoveShortcut", "click", e => nextMove(true));
  bindCtlTo("btnComReset", "click", resetDeck);
  bindCtlTo("btnComSnap", "click", snapSelectedCard);
  bindCtlTo("btnComLineUp", "click", lineupCards);
  bindCtlTo("btnInsShiftAllRight", "click", shiftAllRight);
  bindCtlTo("btnInsNextMove", "click", mergeNextMove);
  bindCtlTo("btnMerShiftAllDown", "click", shiftAllDown);
  bindCtlTo("btnInsMoveDown", "click", moveDown);
  bindCtlTo("btnMerShiftAllUp", "click", shiftAllUp);
  bindCtlTo("btnMerSwapRight", "click", swapRight);
  bindCtlTo("btnQusMoveToCol", "click", moveToCol);
  bindCtlTo("btnQusFirstInRow", "click", firstInRow);
  bindCtlTo("btnQusLastInRow", "click", lastInRow);
  bindCtlTo("btnMerGetMiddleOfRow", "click", middleOfRow);
  bindCtlTo("body", "keydown", canvasKeyDown);
}

function bindCtlTo(id, event, action) {
  const ctl = document.getElementById(id);
  ctl.addEventListener(event, action);
}

function canvasKeyDown(e) {
  switch (e.key) {
    case "1":
      return nextMove(false);
    case "2":
      return nextMove(true);
    case "3":
      return mergeNextMove();
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

function middleOfRow() {
  if (selectedCard) {
    selectedCard.isSelected = false;
    selectedCard = cardUtil.getMiddleOfRow(selectedCard, deck);
  }
}

function firstInRow() {
  if (selectedCard) {
    selectedCard.isSelected = false;
    selectedCard = cardUtil.getEndOfRow(selectedCard, deck, true);
  }
}

function lastInRow() {
  if (selectedCard) {
    selectedCard.isSelected = false;
    selectedCard = cardUtil.getEndOfRow(selectedCard, deck, false);
  }
}

function moveToCol() {
  if (selectedCard) {
    selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
    selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
    selectedCard.locY =
      Math.floor(cardUtil.cardWidth * (selectedCard.value - 1)) +
      cardUtil.leftOffset;
  }
}

function swapRight() {
  if (selectedCard) {
    //state.comparisons++;
    var otherCard = cardUtil.getSelectedCard(
      deck,
      selectedCard.locY + CARD_SCALE_WIDTH * 2,
      selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (otherCard) {
      cardUtil.cardSwap(selectedCard, otherCard, state);
    }
  }
}

function shuffle() {
  cardUtil.shuffle(deck);
  resetDeck();
}

function mergeNextMove() {
  if (!cardUtil.areThereCardsBelowTopRow(deck)) {
    selectedCard = cardUtil.getLeftmostCard(deck);
    selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
    selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
    selectedCard.isSelected = true;
    return;
  }
  if (selectedCard) {
    const card = cardUtil.getLeftmostCardOnTopRow(deck);
    state.comparisons++;
    if (card && card.value < selectedCard.value) {
      selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
      card.swapped = true;
      card.isSelected = false;
      selectedCard.isSelected = false;
      const x = selectedCard.locX;
      const y = selectedCard.locY;
      cardUtil.shiftAllHorz(selectedCard, deck, false);
      card.locX = x;
      card.locY = y;
      var otherCard = cardUtil.getSelectedCard(
        deck,
        selectedCard.locY + CARD_SCALE_WIDTH * 2,
        selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
      );
      if (otherCard) {
        cardUtil.shiftAllVert(otherCard, deck, false);
      }
      mergeProcessFoundMatch(card);
    } else {
      selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
      var otherCard = cardUtil.getSelectedCard(
        deck,
        selectedCard.locY + CARD_SCALE_WIDTH * 2,
        selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
      );
      if (otherCard) {
        selectedCard.isSelected = false;
        selectedCard = otherCard;
      } else {
        card.locX = selectedCard.locX;
        selectedCard.isSelected = false;
        mergeProcessFoundMatch(card);
      }
    }
  }
}

function mergeProcessFoundMatch(card) {
  const otherCard = cardUtil.getLeftmostCardOnTopRow(deck);
  if (!otherCard) {
    state.isSorted = true;
  }
  selectedCard = cardUtil.getLeftmostCard(deck);
  cardUtil.unswapAll(deck);
  card.swapped = true;
  state.cycles++;
  state.isDirty = false;
}

function shiftAllRight() {
  if (selectedCard) {
    cardUtil.shiftAllHorz(selectedCard, deck, false);
  }
}

function shiftAllLeft() {
  if (selectedCard) {
    cardUtil.shiftAllHorz(selectedCard, deck, true);
  }
}

function shiftAllDown() {
  if (selectedCard) {
    cardUtil.shiftAllVert(selectedCard, deck, false);
  }
}

function shiftAllUp() {
  if (selectedCard) {
    cardUtil.shiftAllVert(selectedCard, deck, true);
  }
}

function lineupCards() {
  cardUtil.snapCards(deck);
  cardUtil.lineupCards(deck);
}

function snapSelectedCard() {
  cardUtil.snapCards(deck);
}

function resetDeck() {
  selectedCard = null;
  cardUtil.placeCardPostions(deck);
  state.isDirty = false;
  state.comparisons = 0;
  state.cycles = 0;
  state.isSorted = false;
  selectedCard = cardUtil.getLeftmostCard(deck);
}

function nextMove(shortcut) {
  if (selectedCard) {
    let skip = false;
    state.comparisons++;
    var otherCard = cardUtil.getSelectedCard(
      deck,
      selectedCard.locY + CARD_SCALE_WIDTH * 2,
      selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (shortcut && otherCard) {
      var anotherCard = cardUtil.getSelectedCard(
        deck,
        otherCard.locY + CARD_SCALE_WIDTH * 2,
        otherCard.locX + CARD_SCALE_HEIGHT * 0.6
      );
      if (!anotherCard) {
        skip = true;
      }
    }

    if (otherCard) {
      if (otherCard.value < selectedCard.value) {
        cardUtil.cardSwapAndShift(selectedCard, otherCard, state);
      } else {
        selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
        selectedCard.isSelected = false;
        selectedCard = otherCard;
      }
      if (skip) {
        selectedCard = cardUtil.getLeftmostCard(deck);
        cardUtil.unswapAll(deck);
        state.isSorted = !state.isDirty;
        state.cycles++;
        state.isDirty = false;
      }
    } else {
      selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
      selectedCard.isSelected = false;
      selectedCard = cardUtil.getLeftmostCard(deck);
      cardUtil.unswapAll(deck);
      state.isSorted = !state.isDirty;
      state.cycles++;
      state.isDirty = false;
    }
  }
}

function moveDown() {
  if (selectedCard) {
    state.comparisons++;
    selectedCard.locX += CARD_SCALE_HEIGHT / 3 + 13;
    var otherCard = cardUtil.getSelectedCard(
      deck,
      selectedCard.locY + CARD_SCALE_WIDTH * 2,
      selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (otherCard) {
      selectedCard.isSelected = false;
      selectedCard = otherCard;
    } else {
      selectedCard.isSelected = false;
      selectedCard = cardUtil.getLeftmostCard(deck);
      cardUtil.unswapAll(deck);
      state.cycles++;
      state.isDirty = false;
    }
  }
}

function swapAndMoveDown() {
  if (selectedCard) {
    state.comparisons++;
    var otherCard = cardUtil.getSelectedCard(
      deck,
      selectedCard.locY + CARD_SCALE_WIDTH * 2,
      selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (otherCard) {
      cardUtil.cardSwapAndShift(selectedCard, otherCard, state);
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
  drawer.draw(ctx, deck, selectedCard, state);
}

function myMove(e) {
  if (dragok) {
    x = e.pageX - cardUtil.offsetLeft;
    y = e.pageY - cardUtil.offsetTop;
    selectedCard.locX = y - (selectedCard.locOffX - cardUtil.offsetLeft);
    selectedCard.locY = x - (selectedCard.locOffY - cardUtil.offsetTop);
  }
}

function myDown(e) {
  if (selectedCard) {
    selectedCard.isSelected = false;
    selectedCard = null;
  }
  selectedCard = cardUtil.getSelectedCard(deck, e.pageX, e.pageY);
  if (selectedCard) {
    selectedCard.isSelected = true;
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
