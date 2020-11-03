var exampleSocket = new WebSocket("ws://127.0.0.1:3000");
exampleSocket.onmessage = function (event) {
  console.log(event.data);
}
localStorage.gameID = 0
localStorage.deck = JSON.stringify(['Stickman BOi','Stickman BOi','Stickman BOi','Stickman BOi'])
exampleSocket.onopen = function (event) {
  exampleSocket.send(JSON.stringify({type:'joinGame',id:JSON.parse(localStorage.gameID),deck:JSON.parse(localStorage.deck)}));
};
exampleSocket.onmessage = function(message){
  
}
