function CardUtil(
  offsetLeft,
  offsetTop,
  topLine = 47,
  leftOffset = 16,
  spacing = 13,
) {
  this.topLine = topLine;
  this.leftOffset = leftOffset;
  this.spacing = spacing;
  this.cardWidth = CARD_WIDTH * CARD_SCALE + this.spacing;

  this.offsetLeft = offsetLeft;
  this.offsetTop = offsetTop;
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
CardUtil.prototype.shuffle = function(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
};

CardUtil.prototype.getSuitOfCards = function(suit, order) {
  var deckOfCards = [];
  const suiteId = suit - 1;
  for (var cardId of order) {
    deckOfCards.push(
      new Card(
        suiteId,
        cardId,
        (cardId - 1) * CARD_WIDTH,
        suiteId * CARD_HEIGHT
      )
    );
  }
  return deckOfCards;
};

CardUtil.prototype.placeCardPostions = function(cards) {
  for (var i = 0; i < cards.length; ++i) {
    var card = cards[i];
    card.locX = this.topLine;
    card.locY = Math.floor(this.cardWidth * i) + this.leftOffset;
    card.isSelected = false;
    card.swapped = false;
  }
};

CardUtil.prototype.getSelectedCard = function(deck, pageX, pageY) {
  for (var card of deck) {
    if (
      pageX < card.locY + CARD_SCALE_WIDTH + this.offsetLeft &&
      pageX > card.locY + this.offsetLeft &&
      pageY < card.locX + CARD_SCALE_HEIGHT + this.offsetTop &&
      pageY > card.locX + this.offsetTop
    ) {
      card.locOffY = pageX - card.locY;
      card.locOffX = pageY - card.locX;
      return card;
    }
  }
};

CardUtil.prototype.unswapAll = function(deck) {
  for (var card of deck) {
    card.swapped = false;
    card.isSelected = false;
  }
};

CardUtil.prototype.getLeftmostCard = function(deck, startLeft = 0) {
  var leftMostCard = null;
  var minYSoFar = 99999;
  for (var card of deck) {
    if (card.locY < minYSoFar && card.locY >= startLeft) {
      leftMostCard = card;
      minYSoFar = card.locY;
    }
  }
  return leftMostCard;
};

CardUtil.prototype.cardSwap = function(cardLeft, cardRight, state) {
  var swapY = cardLeft.locY;
  cardLeft.locY = cardRight.locY;
  cardRight.locY = swapY;
};

CardUtil.prototype.cardSwapAndShift = function(cardLeft, cardRight, state) {
  this.cardSwap(cardLeft, cardRight);
  cardRight.locX += CARD_SCALE_HEIGHT / 3 + this.spacing;
  cardRight.swapped = true;
  state.isDirty = true;
};

CardUtil.prototype.snapCards = function(deck) {
  for (var card of deck) {
    this.snapCard(card);
  }
};

CardUtil.prototype.snapCard = function(card) {
  const snapFactorX =
    Math.floor(card.locX / (CARD_SCALE_HEIGHT / 3 + this.spacing)) - 1;
  card.locX =
    Math.floor((CARD_SCALE_HEIGHT / 3 + 13) * snapFactorX) + this.topLine;
  const snapFactorY = Math.floor(card.locY / this.cardWidth);
  card.locY = Math.floor(this.cardWidth * snapFactorY) + this.leftOffset;
};

CardUtil.prototype.lineupCards = function(deck) {
  for (var card of deck) {
    card.locX = this.topLine;
  }
};

CardUtil.prototype.shiftAllHorz = function(card, deck, shiftLeft) {
  let thisCard = card;
  do {
    var otherCard = cardUtil.getSelectedCard(
      deck,
      thisCard.locY + CARD_SCALE_WIDTH * 2,
      thisCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    const snapFactorY = shiftLeft
      ? Math.floor(thisCard.locY / this.cardWidth) - 1
      : Math.floor(thisCard.locY / this.cardWidth) + 1;
    thisCard.locY = Math.floor(this.cardWidth * snapFactorY) + this.leftOffset;

    if (otherCard) {
      thisCard = otherCard;
    }
  } while (otherCard);
};

CardUtil.prototype.shiftAllVert = function(card, deck, shiftUp) {
  let thisCard = card;
  do {
    var otherCard = cardUtil.getSelectedCard(
      deck,
      thisCard.locY + CARD_SCALE_WIDTH * 2,
      thisCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    const snapFactorX = shiftUp
      ? Math.floor(thisCard.locX / (CARD_SCALE_HEIGHT / 3 + this.spacing)) - 2
      : Math.floor(thisCard.locX / (CARD_SCALE_HEIGHT / 3 + this.spacing));
    thisCard.locX =
      Math.floor((CARD_SCALE_HEIGHT / 3 + 13) * snapFactorX) + this.topLine;
    if (otherCard) {
      thisCard = otherCard;
    }
  } while (otherCard);
};

CardUtil.prototype.getLeftmostCardOnTopRow = function(deck, startLeft = 0) {
  var leftMostCard = null;
  var minYSoFar = 99999;
  for (var card of deck) {
    if (
      card.locX <= this.topLine + 20 &&
      this.topLine + 20 <= card.locX + CARD_SCALE_HEIGHT &&
      card.locY >= startLeft &&
      card.locY < minYSoFar
    ) {
      leftMostCard = card;
      minYSoFar = card.locY;
    }
  }
  return leftMostCard;
};

CardUtil.prototype.areThereCardsBelowTopRow = function(deck) {
  for (var card of deck) {
    if (card.locX > this.topLine + CARD_SCALE_HEIGHT) {
      return true;
    }
  }
  return false;
};

CardUtil.prototype.getEndOfRow = function(card, deck, toLeft) {
  card.isSelected = false;
  const getLocY = toLeft
    ? y => y - CARD_SCALE_WIDTH * 0.9
    : y => y + CARD_SCALE_WIDTH * 1.7;
  let otherCard;
  let thisCard = card;
  do {
    otherCard = cardUtil.getSelectedCard(
      deck,
      getLocY(thisCard.locY),
      thisCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (otherCard) {
      thisCard = otherCard;
    }
  } while (otherCard);
  thisCard.isSelected = true;
  return thisCard;
};

CardUtil.prototype.getMiddleOfRow = function(selectedCard, deck) {
  selectedCard.isSelected = false;
  let foo = this.getEndOfRow(selectedCard, deck, true);
  foo.isSelected = false;
  let cardCount = this.getCountItemToRight(foo, deck);
  const middleCard = this.getGetNthItemFromLeft(
    foo,
    deck,
    Math.ceil((cardCount + 0.1) / 2)
  );
  return middleCard;
};

CardUtil.prototype.getGetNthItemFromLeft = function(card, deck, n) {
  let count = 1;
  const getLocY = y => y + CARD_SCALE_WIDTH * 1.7;
  let otherCard;
  let thisCard = card;
  do {
    otherCard = cardUtil.getSelectedCard(
      deck,
      getLocY(thisCard.locY),
      thisCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (otherCard) {
      thisCard = otherCard;
      count++;
    }
  } while (otherCard && count < n);
  return thisCard;
};

CardUtil.prototype.getCountItemToRight = function(card, deck) {
  let count = 1;
  const getLocY = y => y + CARD_SCALE_WIDTH * 1.7;
  let otherCard;
  let thisCard = card;
  do {
    otherCard = cardUtil.getSelectedCard(
      deck,
      getLocY(thisCard.locY),
      thisCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (otherCard) {
      thisCard = otherCard;
      count++;
    }
  } while (otherCard);
  return count;
};

CardUtil.prototype.getCardOrder = function(deck) {
  let thisCard = this.getLeftmostCard(deck);
  let cardOrderQuerystring = `?suit=${thisCard.suit}&order=${thisCard.value}`;
  const getLocY = y => y + CARD_SCALE_WIDTH * 1.7;
  let otherCard;
  do {
    otherCard = cardUtil.getSelectedCard(
      deck,
      getLocY(thisCard.locY),
      thisCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (otherCard) {
      thisCard = otherCard;
      cardOrderQuerystring += `,${thisCard.value}`;
    }
  } while (otherCard);
  return cardOrderQuerystring;
};
