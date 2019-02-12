function Drawer() {}

Drawer.prototype.drawGrid = function(ctx) {
  for (var colLine = 0; colLine < WIDTH; colLine += CARD_SCALE_WIDTH + 13) {
    ctx.beginPath();
    ctx.moveTo(10 + colLine, CARD_SCALE_HEIGHT / 3 + 22);
    ctx.lineTo(10 + colLine, HEIGHT - 17);
    ctx.stroke();
  }
  for (
    var rowLine = CARD_SCALE_HEIGHT / 3 + 13;
    rowLine < HEIGHT;
    rowLine += CARD_SCALE_HEIGHT / 3 + 13
  ) {
    ctx.beginPath();
    ctx.moveTo(10, 10 + rowLine);
    ctx.lineTo(WIDTH - 10, 10 + rowLine);
    ctx.stroke();
  }
};

Drawer.prototype.draw = function(
  ctx,
  deck,
  selectedCard,
  state
) {
  clear();
  if (state.isDirty) {
    ctx.beginPath();
    ctx.arc(20, 20, 7, 0, 2 * Math.PI, false);
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fill();
  }
  if (state.comparisons > 0) {
    ctx.fillStyle = "blue";
    ctx.font = "18px Arial";
    ctx.fillText(`Comparisons: ${state.comparisons}, Cycles: ${state.cycles}`, 70, 30);
  }
  if (state.isSorted) {
    ctx.fillStyle = "red";
    ctx.font = "bold 20px Arial";
    ctx.fillText(`SORTED!!`, 330, 30);
  }
  this.drawGrid(ctx);
  for (var card of deck) {
    if (!card.isSelected) {
      if (card.swapped) {
        ctx.fillStyle = "blue";
        rect(
          card.locY - 4,
          card.locX - 4,
          CARD_SCALE_WIDTH + 8,
          CARD_SCALE_HEIGHT + 8
        );
      }
      ctx.drawImage(
        img,
        card.iOffY,
        card.iOffX,
        CARD_WIDTH,
        CARD_HEIGHT,
        card.locY,
        card.locX,
        CARD_SCALE_WIDTH,
        CARD_SCALE_HEIGHT
      );
    }
  }
  if (selectedCard && selectedCard.locY) {
    ctx.fillStyle = "red";
    rect(
      selectedCard.locY - 4,
      selectedCard.locX - 4,
      CARD_SCALE_WIDTH + 8,
      CARD_SCALE_HEIGHT + 8
    );
    ctx.drawImage(
      img,
      selectedCard.iOffY,
      selectedCard.iOffX,
      CARD_WIDTH,
      CARD_HEIGHT,
      selectedCard.locY,
      selectedCard.locX,
      CARD_SCALE_WIDTH,
      CARD_SCALE_HEIGHT
    );
  }
};
