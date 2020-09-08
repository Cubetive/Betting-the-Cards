const friendlyCardArea = document.getElementById('friendlycardarea');
const STANDARD_CARD_SIZE = 100;

function addCard(el, cardData) {
  const newCard = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  let cardSize = STANDARD_CARD_SIZE;
  newCard.setAttribute("width", cardSize);
  newCard.setAttribute("height", cardSize);

  const cardBorder = document.createElementNS("http://www.w3.org/2000/svg", "rectangle");
  cardBorder.setAttribute("width", cardSize);
  cardBorder.setAttribute("height", cardSize);
  cardBorder.setAttribute("fill-opacity", 0);
  cardBorder.setAttribute("stroke", "black");
  newCard.appendChild(cardBorder);
  
  const dummyCardText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  dummyCardText.setAttribute("x", 50);
  dummyCardText.setAttribute("y", 50);
  dummyCardText.textContent = cardData.weed;
  newCard.appendChild(dummyCardText);
  
  el.appendChild(newCard);
}

addCard(friendlyCardArea, {weed: "420"});
