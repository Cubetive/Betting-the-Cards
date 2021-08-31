const express = require("express")
const hbs = require('hbs')
const Game = require('./server/play/classes/Game.js').Game
const tests = require('./server/runtests.js')
const db = require('./server/accounts/databaseInteraction.js')
const util = require('./server/util.js')
const cardList = require('./server/play/data/cards.js').cardList
const rarityList = require('./server/play/data/rarity.js').rarityList
const keywords = require('./server/play/data/keywords.js').keywords
const bodyParser = require("body-parser");
var helmet = require('helmet');
const ws = require('ws');
var app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"))
app.set('view engine', 'hbs')
var nextGameState = 0
gameStates = {}
const endGame = function (gameID) {
    Database.data.players[gameStates[gameID].players[0].name].activeGame = null
    Database.data.players[gameStates[gameID].players[1].name].activeGame = null
    delete gameStates[gameID]
}

//websocket
const gameWsServer = new ws.Server({ noServer: true });
gameWsServer.on('connection', socket => {
    socket.on('message', message => {
        if (socket.added) {
            return
        }
        try {
            data = JSON.parse(message)
            if (data.type == "verifyIdentity") {
                if (Database.data.players[data.username] && Database.data.players[data.username].loginID == data.loginID) {
                    let oldSocket = Database.getWebsocket(data.username)
                    if (oldSocket) {
                        oldSocket.close()
                        Database.updateSockets()
                    }
                    if (Database.data.players[data.username].activeGame != null) {
                        gameStates[Database.data.players[data.username].activeGame].addSocket(socket, data.username)
                    } else {
                        socket.send(JSON.stringify({ animationList: [{ 'type': 'gameFound', data: { successful: false } }] }))
                    }
                } else {
                    socket.send(JSON.stringify({ animationList: [{ 'type': 'verificationResult', data: { successful: false } }] }))
                }
            } else if (data.type == "loadAllCards") {
                socket.send(JSON.stringify({ animationList: [{ type: "allCardList", data: { allCardList: cardList, keywordData: keywords } }] }))
            }
        } catch (e) {
            console.log(e)
        }
    });
});
const gameServer = app.listen(3000);
gameServer.on('upgrade', (request, socket, head) => {
    gameWsServer.handleUpgrade(request, socket, head, socket => {
        gameWsServer.emit('connection', socket, request);
    });
});

const accountWsServer = new ws.Server({ noServer: true });
accountWsServer.on('connection', socket => {
    Database.newWebSocket(socket)
});
const accountServer = app.listen(3001);
accountServer.on('upgrade', (request, socket, head) => {
    accountWsServer.handleUpgrade(request, socket, head, socket => {
        accountWsServer.emit('connection', socket, request);
    });
});
const beginGame = function (player1, player2) {
    if (Math.random() < 0.5) {
        let save = player1
        player1 = player2
        player2 = save
    }
    gameStates[nextGameState] = new Game(nextGameState, [player1.decks[player1.activeDeck], player2.decks[player2.activeDeck]], [player1.name, player2.name], endGame)
    nextGameState += 1
    return nextGameState - 1
}
const playerInGame = function (playerName) {
    for (const [key, value] of Object.entries(gameStates)) {
        if (value.players[0].name == playerName || value.players[1].name == playerName) {
            return true
        }
    }
    return false
}
//handle requests
app.listen(process.env.PORT || 8081)
const Database = new db.Database(beginGame, playerInGame)
tests.runDBTests(Database)
//gameplay - 3000
//accountstuff - 3001
