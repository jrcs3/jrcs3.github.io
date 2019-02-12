function Card(suit, value, iOffY, iOffX) {
  this.suit = suit;
  this.value = value;
  this.iOffY = iOffY;
  this.iOffX = iOffX;
  this.locY = 0;
  this.locX = 0;
  this.locOffY = 0;
  this.locOffX = 0;
  this.isSelected = false;
  this.swapped = false;
}
