const Card = require('./Card.js').Card
const util = require('../../util.js')
class Player {
  constructor(id,game){
    this.id=id
    this._hp = 30
    this._mana = 1
    this.manaNext = 1
    this.hand = []
    this._manaMax = 1
    this.deck = []
    this.animationsToSend = []
    this.fatigueNext = 1
    this.game = game
    this.webSocket = false
    this.numOfCardsMax = 10
    this.animationsLocked = false
    this.name = "TrainingDummy"
    this.hpMax = 30
    this.slots = [null,null,null,null,null,null,null]
  }
  set mana(value){
    this._mana = value
    this.addAnimation("updateAllyMana",{value:this._mana+"/"+this._manaMax,amount:this._mana},0)
    this.addEnemyAnimation("updateEnemyMana",{value:this._mana+"/"+this._manaMax,amount:this._mana},0)
  }
  get mana(){
    return this._mana
  }
  get hp(){
    return this._hp
  }
  set hp(value){
    this._hp = value
    this.addAnimation("updateAllyHealth",{value:this._hp+"/"+this.hpMax,amount:this._hp},0)
    this.addEnemyAnimation("updateEnemyHealth",{value:this._hp+"/"+this.hpMax,amount:this._hp},0)
  }
  set manaMax(value){
    this._manaMax = value
    this.addAnimation("updateAllyMana",{value:this._mana+"/"+this._manaMax,amount:this._mana},0)
    this.addEnemyAnimation("updateEnemyMana",{value:this._mana+"/"+this._manaMax,amount:this._mana},0)
  }
  get manaMax(){
    return this._manaMax
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
    this.addAnimation("setID",{id:this.id},0)
    this.webSocket.on('message',(message)=>{this.handleSocketMessage(message)})
  }
  handleSocketMessage(message){
    try {
      message = JSON.parse(message)
      switch (message.type) {
        case "getHand":
          this.webSocket.send(JSON.stringify({type:sendHand,hand:this.hand}))
          break;
        case "endTurn":
          if(this.game.whosTurnCurrent == this.id){
            this.game.nextTurn()
            this.game.sendAnimations()
          }
          break;
        case "playCard":
          this.playCharacter(message.position,message.slotNumber)
          this.game.sendAnimations()
          break;
        case "characterAttack":
          if(message.initiator.team==this.id){
            let attackingMonster = this.game.players[this.id].slots[message.initiator.slot]
            let defendingMonster = this.game.players[message.target.team].slots[message.target.slot]
            attackingMonster.attackMonster(defendingMonster,false)
            this.game.sendAnimations()
          }
          break
        case "playerAttack":
          if(message.initiator.team==this.id){
            let attackingMonster = this.game.players[this.id].slots[message.initiator.slot]
            attackingMonster.attackPlayer(this.game.players[message.target],false)
            this.game.sendAnimations()
          }
          break
        default:
          break;
      }
    } catch (e) {
      console.log(message)
      console.log(e)
    }
    //this.webSocket.send(message)
  }
  sendAnimations(){
    let allySlots = []
    for(let i=0;i<this.slots.length;i++){
      if(this.slots[i]!=null){
        allySlots.push(this.slots[i].getNonCircularCopy())
      }else{
        allySlots.push(null)
      }
    }
    let enemySlots = []
    for(let i=0;i<this.game.players[+!this.id].slots.length;i++){
      if(this.game.players[+!this.id].slots[i]!=null){
        enemySlots.push(this.game.players[+!this.id].slots[i].getNonCircularCopy())
      }else{
        enemySlots.push(null)
      }
    }
    let hand = []
    for(let i=0;i<this.hand.length;i++){
      hand.push(this.hand[i].getNonCircularCopy())
    }
    this.webSocket.send(
      JSON.stringify(
        {
          animationList:this.animationsToSend,
          cardData:{
            allySlots,
            enemySlots,
            hand,
          }
        }
      )
    )
    this.animationsToSend = []
  }
  addAnimation(type,data,time){
    if(this.animationsLocked){
      return
    }
    let animation = {type,data,time}
    this.animationsToSend.push(animation)
  }
  startTurn(){
    this.addAnimation("beginTurn",{},0)
    this.mana = this.manaNext
    this.manaMax = this.manaNext
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
    this.addAnimation("endTurn",{},0)
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
    if(this.slots[slotPos]!=null || slotPos>=7 || cardPos>=this.hand.length){
      return
    }
    let card = this.hand[cardPos]
    if(this.mana<card.cost){
      return;
    }
    this.mana-=card.cost
    this.slots[slotPos] = card
    this.hand.splice(cardPos,1)
    this.addAnimation("playCard",{card:this.slots[slotPos].getNonCircularCopy(),slot:slotPos,handPos:cardPos})
    card.setupSummon(slotPos)
    this.game.applyAuraEffects()
    card.onSummon(true)
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
