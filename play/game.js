/* Main script for Betting The Cards */

/*
  * Betting The Cards© Copyright 2020
  * Owner: F.U.C.C, Cubetive
  * Licensed under the MIT License
*/

// Player variables
var friendly = {
  name: "Cubetive",
  numOfCards: 8,
  numOfCardsMax: 10,
  mana: 5,
  health: 28,
  healthMax: 30,
  deck: []
}

var enemy = {
  name: "UrMom",
  numOfCards: 6,
  numOfCardsMax: 10,
  mana: 5,
  health: 24,
  healthMax: 30,
  deck: []
}

// Card Management
const friendlyCardArea = document.getElementById('friendlycardarea');
const enemyCardArea = document.getElementById('enemyCardArea');
const STANDARD_CARD_WIDTH = 150;
const STANDARD_CARD_HEIGHT = 200;

function addCard(el, cardData) {
  const newCard = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  let cardSizeWidth = STANDARD_CARD_WIDTH;
  let cardSizeHeight = STANDARD_CARD_HEIGHT;
  newCard.setAttribute("width", cardSizeWidth);
  newCard.setAttribute("height", cardSizeHeight);

  const cardBorder = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  cardBorder.setAttribute("width", "100%");
  cardBorder.setAttribute("height", "100%");
  cardBorder.setAttribute("style", "fill:lightgrey;stroke:black;stroke-width:3");
  newCard.appendChild(cardBorder);

  const name = document.createElementNS("http://www.w3.org/2000/svg", "text");
  name.setAttribute("x", "50%");
  name.setAttribute("y", (STANDARD_CARD_HEIGHT / 2) + (STANDARD_CARD_HEIGHT / 4));
  name.textContent = cardData.name;
  newCard.appendChild(name);
  el.appendChild(newCard);
}

async function UpdateFrame() {

}

addCard(friendlyCardArea, {name: "Tran Dan"});
// funny number!!!! no
