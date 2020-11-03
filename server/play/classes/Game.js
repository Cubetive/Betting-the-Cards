const Player = require('./Player.js').Player
class Game {
  constructor(){
    this.players = [new Player(0),new Player(1)]
    this.whosTurnNext = 1
    this.whosTurnCurrent = 0
    this.started = false
  }
  addPlayer(socket,deck){
    if(this.started){
      return
    }
    for(let i=0;i<this.players.length;i++){
      if(!this.players[i].webSocket){
        this.players[i].beginGame(socket,deck)
        break
      }
    }
  }
  nextTurn(){
    this.players[this.whosTurnCurrent].endTurn(this)
    this.players[this.whosTurnNext].startTurn(this)
    let save = this.whosTurnNext
    this.whosTurnNext = this.whosTurnCurrent
    this.whosTurnCurrent = save
    this.applyAuraEffects()
  }
  applyAuraEffects(){
    for(let i=0;i<7;i++){
      if(this.players[0].slots[i]!=null){
        this.players[0].slots[i].applyAuraEffects(this)
      }
    }
    for(let i=0;i<7;i++){
      if(this.players[1].slots[i]!=null){
        this.players[1].slots[i].applyAuraEffects(this)
      }
    }
  }
  win(team){
    //Win code here

  }
}
module.exports = {Game}
