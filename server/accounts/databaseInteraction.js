const util = require('../util.js')
const fs = require('fs')
const retrieve = ()=>{
  return JSON.parse(fs.readFileSync(`./data.json`))
}
class Database{
  constructor(){
    this.data = retrieve()
  }
  save(){
    fs.writeFileSync(`./data.json`,JSON.stringify(data))
  }
  newPlayer(name,password){
    if(this.data.players[name]){
      return
    }
    this.data.players[name] = {
      cards:{},
      name:name,
      level:1,
      xp:0,
      decks:[],
      history:[],
      password,
      xpToNext:1000,
      dust:0,
    }
  }
  incXP(name,amount){
    let player = this.data.players[name]
    if(player==undefined){
      return
    }
    player.xp+=amount
    while(player.xp>player.xpToNext){
      player.xp = player.xp-player.xpToNext
      player.level+=1
      if(player.xpToNext<5000){
        player.xpToNext+=250
      }
    }
  }
}
module.exports = {Database}
