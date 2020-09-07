const friendlyCardArea = document.getElementById('friendlycardarea');

function addCard(el, cardData) {
  const newCard = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newCard.setAttribute("width", "100");
  newCard.setAttribute("height", "100");

  const dummyCardText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  dummyCardText.setAttribute("x", 50);
  dummyCardText.setAttribute("y", 50);
  dummyCardText.textContent = cardData.weed;
  newCard.appendChild(dummyCardText);
  
  el.appendChild(newCard);
}

addCard({weed: "420"});
