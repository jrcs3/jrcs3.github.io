function Merge(cardUtil) {
  this.mergeStage = 0;
  this.cardUtil = cardUtil;
}

Merge.prototype.reset = function() {
  this.mergeStage = 0;
};

Merge.prototype.mergeDivide = function(state) {
  const cardCount = this.cardUtil.getCountItemToRight(
    state.selectedCard,
    state.deck
  );
  const stepFactor = Math.ceil(Math.log2(cardCount));
  if (stepFactor === 0) {
    // is sorted by default
  } else if (stepFactor === 1) {
    state.comparisons++;
    const otherCard = this.cardUtil.getstate.selectedCard(
      state.deck,
      state.selectedCard.locY + CARD_SCALE_WIDTH * 2,
      state.selectedCard.locX + CARD_SCALE_HEIGHT * 0.4
    );
    if (otherCard && state.selectedCard.value > otherCard.value) {
      otherCard.swapped = true;
      this.cardUtil.cardSwap(state.selectedCard, otherCard, state);
    }
  } else {
    state.selectedCard.isSelected = false;
    const stepsDown = this.getSteps(stepFactor);
    state.selectedCard = this.cardUtil.getMiddleOfRow(
      state.selectedCard,
      state.deck
    );
    for (let i = 0; i < stepsDown; ++i) {
      this.cardUtil.shiftAllVert(state.selectedCard, state.deck, false);
    }
    state.isDirty = true;
    // split again
  }
  if (state.selectedCard) {
    state.selectedCard.isSelected = false;
    state.selectedCard = this.cardUtil.getEndOfRow(
      state.selectedCard,
      state.deck,
      false
    );
    state.selectedCard.isSelected = false;
    state.selectedCard = this.cardUtil.getLeftmostCard(
      state.deck,
      state.selectedCard.locY + 1
    );
    if (state.selectedCard === null) {
      state.selectedCard = this.cardUtil.getLeftmostCard(state.deck);
      state.cycles++;
      if (stepFactor <= 1) {
        state.mergeStage = 2;
      }
      state.isDirty = false;
    }
    state.selectedCard.isSelected = true;
  }
};

Merge.prototype.mergeCombineTwoLists = function(state) {
  console.log("stage 2");
};

Merge.prototype.getSteps = function(stepFactor) {
  switch (stepFactor) {
    case 4:
      return 8;
    case 3:
      return 4;
    case 2:
      return 2;
    case 1:
      return 1;
    default:
      return 0;
  }
};
