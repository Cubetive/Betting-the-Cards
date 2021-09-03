const util = require('../util.js')
const fs = require('fs')
const cardList = require('../play/data/cards.js').cardList
const rarityList = require('../play/data/rarity.js').rarityList
const keywords = require('../play/data/keywords.js').keywords
const retrieve = () => {
    return JSON.parse(fs.readFileSync(`./data.json`))
}
const hash = function (value, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < value.length; i++) {
        ch = value.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
class Database {
    constructor(beginGame, playerInGame) {
        this.data = retrieve()
        this.sockets = []
        this.playerList = Object.keys(this.data.players)
        this.queue = []
        this.beginGame = beginGame
        this.playerInGame = playerInGame
    }
    save() {
        for (const [key, value] of Object.entries(this.data.players)) {
            this.data.players[key].activeGame = null
        }
        fs.writeFileSync(`./data.json`, JSON.stringify(this.data))
    }
    //ACCOUNT STUFF
    newPlayer(name, password) {
        if (hash(name) == 1195078955293984) {
            name = "horny"
        }
        if (this.data.players[name]) {
            return false
        }
        this.data.players[name] = {
            cards: {},
            name,
            level: 1,
            xp: 0,
            history: [],
            password: hash(password),
            xpToNext: 1000,
            dust: 1000000,
            money: 0,
            packs: 0,
            activeGame: null,
            loginID: "" + hash(name) + hash(password),
            //bugs, infection, grimm troupe, spiders???/godhome
            decks: [{ name: "deck1", factions: [0, 0], cards: {} }, { name: "deck2", factions: [0, 1], cards: {} }, { name: "deck3", factions: [1, 0], cards: {} }, { name: "deck4", factions: [1, 1], cards: {} }],
        }

        this.playerList.push(name)
        this.setDust(name, 10000000000)
        this.craftAllCards(name)
        return true
    }
    incXP(name, amount) {
        let player = this.data.players[name]
        if (player == undefined) {
            return
        }
        player.xp += amount
        while (player.xp > player.xpToNext) {
            player.xp = player.xp - player.xpToNext
            player.level += 1
            if (player.xpToNext < 5000) {
                player.xpToNext += 250
            }
        }
    }
    craftAllCards(name) {
        let player = this.data.players[name]
        if (player == undefined) {
            return
        }
        for (const [key, value] of Object.entries(cardList)) {
            if (value.rarity < 0) {
                continue
            }
            if (player.dust < rarityList[value.rarity].craftCost) {
                continue
            } else {
                while (this.craftCard(name, key)) { }
            }
        }
    }
    dustCard(name, cardName) {
        let player = this.data.players[name]
        if (player == undefined) {
            return
        }
        if (player.cards[cardName] != undefined) {
            player.cards[cardName].amount -= 1
            player.dust += rarityList[cardList[cardName].rarity].dustAmount
            if (player.cards[cardName].amount == 0) {
                player.cards[cardName] = undefined
            }
        }
    }
    craftCard(name, cardName) {
        let player = this.data.players[name]
        if (player == undefined || player.dust <= rarityList[cardList[cardName].rarity].craftCost) {
            return false
        }
        if (cardList[cardName].rarity < 0 || (player.cards[cardName] && player.cards[cardName].amount >= rarityList[cardList[cardName].rarity].maxPerCollection)) {
            return false
        }
        player.dust -= rarityList[cardList[cardName].rarity].craftCost
        if (player.cards[cardName] == undefined) {
            player.cards[cardName] = {
                amount: 1,
            }
        } else {
            player.cards[cardName].amount += 1
        }
        return true
    }
    setDust(name, amount) {
        let player = this.data.players[name]
        if (player == undefined) {
            return
        }
        player.dust = amount
    }
    setMoney(name, amount) {
        let player = this.data.players[name]
        if (player == undefined) {
            return
        }
        player.money = amount
    }
    buyPack(name) {
        let player = this.data.players[name]
        if (player == undefined || player.money < 100) {
            return
        }
        player.money -= 100
        player.packs += 1
    }
    openPack(name) {
        let player = this.data.players[name]
        if (player == undefined || player.packs < 1) {
            return
        }
        player.packs -= 1
        for (let i = 0; i < 4; i++) {
            let rarity = util.weightedRandomChance({ 0: 8750, 1: 1000, 2: 200, 3: 50 })
            let cardName = util.getRandomCards(1, (card) => { return card.rarity == rarity })
            if (player.cards[cardName] == undefined) {
                player.cards[cardName] = {
                    amount: 1,
                }
            } else {
                player.cards[cardName].amount += 1
            }
        }
    }
    autoDisenchant(name) {
        let player = this.data.players[name]
        if (player == undefined) {
            return
        }
        let entries = Object.entries(player.cards)
        for (let i = 0; i < entries.length; i++) {
            while (entries[i][1].amount > rarityList[cardList[entries[i][0]].rarity].maxPerCollection) {
                this.dustCard(name, entries[i][0])
            }
        }
    }
    changeFaction(player, deckID, factionPos, newFaction) {
        if (newFaction !== 0 && newFaction !== 1) {
            return false
        }
        let oldFaction = player.decks[deckID].factions[factionPos]
        player.decks[deckID].factions[factionPos] = newFaction
        for (const [name, value] of Object.entries(player.decks[deckID].cards)) {
            if (cardList[name].factions[factionPos] == oldFaction) {
                delete player.decks[deckID].cards[name]
            }
        }
        return true
    }
    addCardDeck(player, deckID, card) {
        let amountInDeck = player.decks[deckID].cards[card] ? player.decks[deckID].cards[card].amount : 0
        if (amountInDeck == player.cards[card].amount || amountInDeck == rarityList[cardList[card].rarity].maxPerDeck) {
            return false
        }
        if (player.decks[deckID].cards[card]) {
            player.decks[deckID].cards[card].amount += 1
        } else {
            player.decks[deckID].cards[card] = { amount: 1 }
        }
        return true
    }
    removeCardDeck(player, deckID, card) {
        if (!player.decks[deckID].cards[card]) {
            return false
        }
        player.decks[deckID].cards[card].amount -= 1
        if (player.decks[deckID].cards[card].amount == 0) {
            delete player.decks[deckID].cards[card]
        }
        return true
    }
    //websocket STUFF
    newWebSocket(socket) {
        this.sockets.push(socket)
        socket.on('message', message => {
            try {
                this.handleMessage(message, socket)
            } catch (e) {
                console.log(e)
            }
        });
    }
    enterQueue(player, deckID) {
        if (!this.isDeckValid(player.decks[deckID]) || this.queue.includes(player.name) || this.playerInGame(player.name)) {
            return false
        }
        player.activeDeck = deckID
        if (this.queue.length >= 1) {
            let socket1 = this.getWebsocket(this.queue[0])
            let socket2 = this.getWebsocket(player.name)
            if (!socket1 || socket1.page != 'play.html') {
                this.queue = [player.name]
                return true
            }
            let newGame = this.beginGame(this.data.players[this.queue[0]], player)
            player.activeGame = newGame
            this.data.players[this.queue[0]].activeGame = newGame
            this.queue = []
            socket1.send(JSON.stringify({ type: "gameFound" }))
            socket2.send(JSON.stringify({ type: "gameFound" }))
            return false
        } else {
            this.queue.push(player.name)
            return true
        }
    }
    isDeckValid(deck) {
        //removed for testing purposes, still needs some work.
        /*if (util.convertToDeck(deck).length != 30) {
            return false
        }*/
        return true
    }
    getWebsocket(player) {
        for (let i = 0; i < this.sockets.length; i++) {
            if (this.sockets[i].owner == player && this.sockets[i].readyState == 1) {
                return this.sockets[i]
            } else if (this.sockets[i].owner == player) {
                this.sockets[i].close()
                if (this.queue.includes(player.name)) {
                    this.queue.splice(this.queue.index(player.name),1)
                }
                this.sockets.splice(i, 1)
                i -= 1
            }
        }
        return false
    }
    updateSockets() {
        for (let i = 0; i < this.sockets.length; i++) {
            if (this.sockets[i].readyState != 1) {
                this.sockets[i].close()
                this.sockets.splice(i, 1)
                i -= 1
            }
        }
        return false
    }
    handleMessage(message, socket) {
        try {
            message = JSON.parse(message)
            let messageData = message.data
            switch (message.type) {
                case "newAccount":
                    if (this.newPlayer(messageData.username, messageData.password)) {
                        socket.send(JSON.stringify({ type:"registerResults",successful: true, username: messageData.username, loginID: this.data.players[messageData.username].loginID }))
                    } else {
                        socket.send(JSON.stringify({ type: "registerResults",successful: false }))
                    }
                    break
                case "login":
                    if (this.data.players[messageData.username] && this.data.players[messageData.username].password == messageData.password) {
                        socket.send(JSON.stringify({ successful: true, username: messageData.username, loginID: this.data.players[messageData.username].loginID }))
                    } else {
                        socket.send(JSON.stringify({ successful: false }))
                    }
                    break
                case "verifyIdentity":
                    if (this.data.players[messageData.username] && this.data.players[messageData.username].loginID == messageData.loginID) {
                        let oldSocket = this.getWebsocket(messageData.username)
                        if (oldSocket) {
                            oldSocket.close()
                            this.updateSockets()
                        }
                        socket.owner = messageData.username
                        socket.verified = true
                        socket.page = messageData.page
                        socket.send(JSON.stringify({ type: "verificationResult", successful: true, username: messageData.username, loginID: this.data.players[messageData.username].loginID }))
                    } else {
                        socket.send(JSON.stringify({ type: "verificationResult", successful: false }))
                    }
                    break
                case "getCollectionAndDecks":
                    if (socket.owner) {
                        let player = this.data.players[socket.owner]
                        socket.send(JSON.stringify({ type: "sendCollectionAndDecks", decks: player.decks, collection: Object.entries(player.cards) }))
                        break
                    } else {
                        socket.send(JSON.stringify({ type: "verificationResult", successful: false }))
                    }
                case "setFaction":
                    if (socket.owner) {
                        let player = this.data.players[socket.owner]
                        if (this.changeFaction(player, messageData.deckID, messageData.factionPos, messageData.newFaction)) {
                            socket.send(JSON.stringify({ type: "sendDeck", deck: player.decks[messageData.deckID], deckID: messageData.deckID }))
                        }
                        break
                    } else {
                        socket.send(JSON.stringify({ type: "verificationResult", successful: false }))
                    }
                case "loadAllCards":
                    socket.send(JSON.stringify({ type: "allCardList", allCardList: cardList, rarityData: rarityList, keywordData: keywords }))
                    break
                case "addCardDeck":
                    if (socket.owner) {
                        let player = this.data.players[socket.owner]
                        if (this.addCardDeck(player, messageData.deckID, messageData.card)) {
                            socket.send(JSON.stringify({ type: "sendDeck", deck: player.decks[messageData.deckID], deckID: messageData.deckID }))
                        }
                        break
                    } else {
                        socket.send(JSON.stringify({ type: "verificationResult", successful: false }))
                    }
                    break
                case "removeCardDeck":
                    if (socket.owner) {
                        let player = this.data.players[socket.owner]
                        if (this.removeCardDeck(player, messageData.deckID, messageData.card)) {
                            socket.send(JSON.stringify({ type: "sendDeck", deck: player.decks[messageData.deckID], deckID: messageData.deckID }))
                        }
                        break
                    } else {
                        socket.send(JSON.stringify({ type: "verificationResult", successful: false }))
                    }
                    break
                case "enterQueue":
                    if (socket.owner) {
                        let player = this.data.players[socket.owner]
                        if (this.enterQueue(player, messageData.deckID)) {
                            socket.send(JSON.stringify({ type: "enterQueue", successful: true }))
                        }
                        break
                    } else {
                        socket.send(JSON.stringify({ type: "verificationResult", successful: false }))
                    }
                    break
                case "saveServer":
                    console.log("Save requested...")
                    if (socket.owner && socket.owner == "eagleclaw774") {
                        console.log("Sure, oh grand exalted master.")
                        this.save()
                        break
                    } else if (socket.owner) {
                        console.log("Nope.")
                        this.data.players[socket.owner].decks = [{ name: "deck1", factions: [0, 0], cards: { "garbage": { amount: 25 } } }, { name: "deck2", factions: [0, 1], cards: { "garbage": { amount: 25 } } }, { name: "deck3", factions: [1, 0], cards: { "garbage": { amount: 25 } } }, { name: "deck4", factions: [1, 1], cards: { "garbage": { amount: 25 }} }]
                    }
                    break
                default:
                    break
            }
        } catch (e) {
            console.log(e)
        }
    }
}
module.exports = { Database }
