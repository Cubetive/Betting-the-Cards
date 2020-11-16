const express = require("express")
const hbs = require('hbs')
const Game = require('./server/play/classes/Game.js').Game
const tests = require('./server/runtests.js')
const db = require('./server/accounts/databaseInteraction.js')
const bodyParser = require("body-parser");
const ws = require('ws');
var nextGameState = 0
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"))
app.set('view engine','hbs')
gameStates = {}
//handle requests
gameStates[nextGameState] = new Game([],[])
nextGameState++
app.listen(8081)
Database = new db.Database()
tests.runDBTests(Database)

app.get("/gameStates",(request,response)=>{
  response.send(gameStates)
})
//websocket
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  socket.on('message', message => {
    if(socket.connected){
      return
    }
    try {
      data = JSON.parse(message)
      if(data.type=="joinGame" && data.id!=undefined && gameStates[data.id] && !gameStates[data.id].started){
        gameStates[data.id].addPlayer(socket,data.deck)
        socket.connected = true
      }
    } catch (e) {
      console.log(e)
    }
  });
});
const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});
