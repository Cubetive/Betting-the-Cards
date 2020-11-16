const Card = require('./Card.js').Card
const util = require('../../util.js')
class Player {
  constructor(id,game){
    this.id=id
    this.hp = 30
    this._mana = 0
    this.manaNext = 1
    this.hand = []
    this.deck =
    this.animationsToSend = []
    this.fatigueNext = 1
    this.game = game
    this.webSocket = false
    this.numOfCardsMax = 10
    this.name = "TrainingDummy"
    this.hpMax = 30
    this.slots = [null,null,null,null,null,null,null]
  }
  set mana(value){
    this._mana = value
    this.addAnimation("updateAllyMana",{value:this._mana+"/"+this.manaNext,amount:this._mana},0)
    this.addEnemyAnimation("updateEnemyMana",{value:this._mana+"/"+this.manaNext,amount:this._mana},0)
  }
  get mana(){
    return this._mana
  }
  addEnemyAnimation(type,data,time){
    this.game.players[+!this.id].addAnimation(type,data,time)
  }
  beginGame(socket,deck){
    console.log(deck)
    this.webSocket = socket
    this.deck = deck
    for(let i=0;i<this.deck.length;i++){
      this.deck[i] = new Card(deck[i],this.id,this.game)
    }
    util.shuffle(deck)
    this.draw(3,this.game,true)
    this.webSocket.on('message',(message)=>{this.handleSocketMessage(message)})
  }
  handleSocketMessage(message){
    console.log(message)
    try {
      message = JSON.parse(message)
      if(message.type == "getHand"){
        this.webSocket.send(JSON.stringify({type:sendHand,hand:this.hand}))
      }
      if(message.type == "endTurn"){
        if(this.game.whosTurnCurrent == this.id){
          this.game.nextTurn()
          this.game.sendAnimations()
        }
      }
      if(message.type == "playCard"){
        this.playCharacter(message.position,message.slotNumber)
        this.game.sendAnimations()
      }
    } catch (e) {
      console.log(message)
      console.log(e)
    }
    //this.webSocket.send(message)
  }
  sendAnimations(){
    this.webSocket.send(JSON.stringify(this.animationsToSend))
    this.animationsToSend = []
  }
  addAnimation(type,data,time){
    let animation = {type,data,time}
    this.animationsToSend.push(animation)
  }
  startTurn(){
    this.mana = this.manaNext
    if(this.manaNext<10){
      this.manaNext++
    }
    this.draw(1)
    for(let i=0;i<7;i++){
      if(this.slots[i]!=null){
        this.slots[i].turnStart(this.game)
      }
    }
  }
  endTurn(){
    for(let i=0;i<7;i++){
      if(this.slots[i]!=null){
        this.slots[i].turnEnd(this.game)
      }
    }
  }
  draw(amount,override){
    if(amount>1){
      for(let i=0;i<amount;i++){
        this.draw(1)
      }
    }else{
      if(this.deck.length>0){
        let card = this.deck.splice(0,1)
        let cardToHand = card.splice(0,this.numOfCardsMax-this.hand.length)
        this.hand = this.hand.concat(cardToHand)
        if(!override){
          if(card.length==0){
            this.addAnimation("drawCard",{card:cardToHand[0].getNonCircularCopy()},100)
            this.addAnimation("updateAllyCards",{value:this.hand.length},0)
            this.addEnemyAnimation("updateEnemyCards",{value:this.hand.length},0)
          }
        }
      }else{
        this.takeDamage(null,this.fatigueNext,this.game)
        this.fatigueNext+=1
      }
    }
  }
  playCharacter(cardPos,slotPos){
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
    this.game.applyAuraEffects()
    this.slots[slotPos].onSummon(this.game,true)
    this.game.applyAuraEffects()
  }
  takeDamage(source,amount){
    this.hp-=amount
    if(this.hp<=0){
      this.game.win(+!this.id)
    }
    this.game.applyAuraEffects()
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
