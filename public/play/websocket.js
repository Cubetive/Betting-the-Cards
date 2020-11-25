var exampleSocket = new WebSocket("ws://127.0.0.1:3000");
exampleSocket.onmessage = function (event) {
}
localStorage.gameID = 0
localStorage.deck = JSON.stringify(['Stickman BOi','Stickman BOi','Stickman BOi','Stickman BOi','auraTest','auraTest','auraTest'])
exampleSocket.onopen = function (event) {
  exampleSocket.send(JSON.stringify({type:'joinGame',id:JSON.parse(localStorage.gameID),deck:JSON.parse(localStorage.deck)}));
};
exampleSocket.onmessage = function(message){
  let data = JSON.parse(message.data)
  console.log(message,data)
  deHighlightCards()
  handleNextAnimation(JSON.parse(JSON.stringify(data.animationList)),data.cardData)
}
sendThroughWebSocket = function(message){
  exampleSocket.send(message);
}
