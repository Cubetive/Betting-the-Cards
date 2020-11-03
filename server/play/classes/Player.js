const Card = require('./Card.js').Card
const Game = require('./Game.js').Game
const util = require('../../util.js')
class Player {
  constructor(id){
    this.id=id
    this.hp = 30
    this.mana = 0
    this.manaNext = 1
    this.hand = []
    this.actionsToSend = []
    this.fatigueNext = 1
    this.webSocket = false
    this.numOfCardsMax = 10
    this.name = "TrainingDummy"
    this.hpMax = 30
    this.slots = [null,null,null,null,null,null,null]
  }
  beginGame(socket,deck){
    this.webSocket = socket
    this.deck = deck
    for(let i=0;i<this.deck.length;i++){
      this.deck[i] = new Card(deck[i],this.id)
    }
    util.shuffle(deck)
    this.draw(3)
    this.webSocket.on('message',(message)=>{this.handleSocketMessage(message)})
  }
  handleSocketMessage(message){
    this.webSocket.send(message)
  }
  sendActions(){

  }
  startTurn(game){
    this.mana = this.manaNext
    if(this.manaNext<10){
      this.manaNext++
    }
    this.draw(1)
    for(let i=0;i<7;i++){
      if(this.slots[i]!=null){
        this.slots[i].turnStart(game)
      }
    }
  }
  endTurn(game){
    for(let i=0;i<7;i++){
      if(this.slots[i]!=null){
        this.slots[i].turnEnd(game)
      }
    }
  }
  draw(amount){
    if(amount<=this.deck.length){
      let cards = this.deck.splice(0,amount)
      let cardsToHand = cards.splice(0,this.numOfCardsMax-this.hand.length)
      this.hand = this.hand.concat(cardsToHand)
    }else{
      for(let i=0;i<amount-this.deck.length;i++){
        this.takeDamage(this.fatigueNext)
        this.fatigueNext+=1
      }
      let cards = this.deck.splice(0,this.deck.length)
      let cardsToHand = cards.splice(0,this.numOfCardsMax-this.hand.length)
      this.hand = this.hand.concat(cardsToHand)
    }
  }
  playCharacter(cardPos,slotPos,game){
    if(this.slots[slotPos]!=null || this.slots[slotPos]==undefined || cardPos>=this.hand.length){
      return
    }
    let card = this.hand[cardPos]
    if(this.mana<card.cost){
      return;
    }
    this.mana-=card.cost
    this.slots[slotPos] = card
    this.hand.splice(cardPos,0)
    game.applyAuraEffects()
    this.slots[slotPos].onSummon(game,true)
    game.applyAuraEffects()
  }
  takeDamage(source,amount,game){
    this.hp-=amount
    if(this.hp<=0){
      game.win(+!this.id)
    }
    game.updateAuraEffects()
  }
  getPublicInfo(){
    return {
      cardsInHand:this.hand.length,
      maxCardsInHand:this.numOfCardsMax,
      hp,
      hpMax,
      name,
      fatigueNext,
      mana,
      manaNext,
      slots,
    }
  }
}
module.exports = {Player}
