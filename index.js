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
const { Server } = require('ws');
var app = express()
    .use(helmet({
        contentSecurityPolicy: false,
    }))
    .use(express.static(__dirname + "/public"))
    .listen(process.env.PORT || 8081)
var nextGameState = 0
gameStates = {}
const endGame = function (gameID) {
    Database.data.players[gameStates[gameID].players[0].name].activeGame = null
    Database.data.players[gameStates[gameID].players[1].name].activeGame = null
    delete gameStates[gameID]
}
//websocket
const wsServer = new Server({ server: app });
wsServer.on('connection', socket => {
    socket.on('message', message => {
        if (socket.added) {
            return
        }
        try {
            let data = JSON.parse(message)
            if (data.socketType == "gameWS") {
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
            } else if (data.socketType == "dbWS") {
                Database.newWebSocket(socket)
                socket.added = true;
                Database.handleMessage(message, socket)
            }
        } catch (e) {
            console.log(e)
        }
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
const Database = new db.Database(beginGame, playerInGame)
tests.runDBTests(Database)
//gameplay - 3000
//accountstuff - 3001
