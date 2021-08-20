const Player = require('./Player.js').Player
const ListenerReceiver = require('./ListenerReceiver.js').ListenerReceiver
const ListenerEmitter = require('./ListenerEmitter.js').ListenerEmitter
class Game {
    constructor(gameID, decks, names, deleteFunc) {
        this.effectStack = []
        this._stackClosed = true
        this.players = [new Player(0, this, decks[0], names[0]), new Player(1, this, decks[1], names[1])]
        this.whosTurnNext = 1
        this.whosTurnCurrent = 0
        this.listenerEmitter = new ListenerEmitter(this)
        this.started = false
        this.ended = false
        this.gameID = gameID
        this.deleteFunc = deleteFunc
        this.players[0].beginGame()
        this.players[1].beginGame()
        this.stackClosed = false
       /* this.players[0].listenerReceiver.addEventHandler(
            "gameLogEvent",
            (data) => { console.log(data)},
            (data) => { return true },
            this.listenerEmitter
        )*/
        this.listenerEmitter.emitPassiveEvent({}, "triggerGameStartEffects");
    }
    get stackClosed() {
        return this._stackClosed
    }
    set stackClosed(value) {
        this._stackClosed = value
        if (value == false) {
            this.evalNextStackEntry()
        }
    }
    sendAnimations() {
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].sendAnimations()
        }
    }
    addSocket(socket, name) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].name == name) {
                if (this.players[i].webSocket) {
                    this.players[i].webSocket.close()
                    this.players[i].engageWebsocket(socket)
                    this.players[i].sendFullGamestate()
                } else {
                    this.players[i].engageWebsocket(socket)
                }
                break
            }
        }
        if (this.players[1].webSocket && this.players[0].webSocket && !this.started) {
            this.started = true
            this.players[0].addDataAnimations()
            this.players[1].addDataAnimations()
            this.players[0].startTurn()
            this.sendAnimations()
        } else {
        }
    }
    checkActive(player) {
        if (player.webSocket.readyState != 1) {
            this.onDisconnect(player)
        }
    }
    onDisconnect(player) {
        if (this.players[+!player.id].webSocket) {
            this.win(+!player.id)
        } else {
            clearInterval(player.pingInterval)
            this.players[0].webSocket = undefined
            this.players[0].deck = []
            this.players[0].hand = []
            this.players[0].animationsToSend = []
        }
    }
    disconnect(player) {
        this.players[player].webSocket.close()
    }
    nextTurn() {
        this.players[this.whosTurnCurrent].endTurn(this)
        this.players[this.whosTurnNext].startTurn(this)
        let save = this.whosTurnNext
        this.whosTurnNext = this.whosTurnCurrent
        this.whosTurnCurrent = save
    }
    win(team) {
        //Win code here
        this.ended = true
        this.players[team].addAnimation("win", {}, 1000)
        this.players[team].animationsLocked = true
        this.players[+!team].addAnimation("lose", {}, 1000)
        this.players[+!team].animationsLocked = true
        this.sendAnimations()
        this.players[0].webSocket.close()
        this.players[1].webSocket.close()
        this.deleteFunc(this.gameID)
    }
    addToStack(func) {
        if (!this.stackClosed) {
            this.stackClosed = true
            if (!func()) {
                this.stackClosed = false
            }
        } else {
            this.effectStack.push(func)
        }
    }
    evalNextStackEntry() {
        if (this.effectStack.length == 0) {
            return
        }
        this.stackClosed = true
        if (!this.effectStack[this.effectStack.length - 1]()) {
            this.effectStack.splice(this.effectStack.length - 1, 1)
            this.stackClosed = false
        } else {
            this.effectStack.splice(this.effectStack.length - 1, 1)
        }
    }
}
module.exports = { Game }
