const util = require('../util.js')
const fs = require('fs')
const cardList = require('../play/data/cards.js').cardList
const rarityList = require('../play/data/rarity.js').rarityList
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
      money:0,
      packs:0,
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
  dustCard(name,cardName){
    let player = this.data.players[name]
    if(player==undefined){
      return
    }
    if(player.cards[cardName]!=undefined){
      player.cards[cardName].amount-=1
      player.dust+=rarityList[cardList[cardName].rarity].dustAmount
      if(player.cards[cardName].amount == 0){
        player.cards[cardName] = undefined
      }
    }
  }
  craftCard(name,cardName){
    let player = this.data.players[name]
    if(player==undefined || player.dust<=rarityList[cardList[cardName].rarity].craftCost){
      return
    }
    player.dust-=rarityList[cardList[cardName].rarity].craftCost
    if(player.cards[cardName]==undefined){
      player.cards[cardName] = {
        amount:1,
      }
    }else{
      player.cards[cardName].amount +=1
    }
  }
  setDust(name,amount){
    let player = this.data.players[name]
    if(player==undefined){
      return
    }
    player.dust=amount
  }
  setMoney(name,amount){
    let player = this.data.players[name]
    if(player==undefined){
      return
    }
    player.money=amount
  }
  buyPack(name){
    let player = this.data.players[name]
    if(player==undefined || player.money<100){
      return
    }
    player.money-=100
    player.packs+=1
  }
  openPack(name){
    let player = this.data.players[name]
    if(player==undefined || player.packs<1){
      return
    }
    player.packs-=1
    let results = []
    for(let i=0;i<4;i++){
      let rarity = util.weightedRandomChance({0:8750,1:1000,2:200,3:50})
      let cardName = util.getRandomCards(1,(card)=>{return card.rarity==rarity})
      if(player.cards[cardName]==undefined){
        player.cards[cardName] = {
          amount:1,
        }
      }else{
        player.cards[cardName].amount +=1
      }
    }
  }
  autoDisenchant(name){
    let player = this.data.players[name]
    if(player==undefined){
      return
    }
    let entries = Object.entries(player.cards)
    for(let i=0;i<entries.length;i++){
      while(entries[i][1].amount>rarityList[cardList[entries[i][0]].rarity].maxPerCollection){
        this.dustCard(name,entries[i][0])
      }
    }
  }
}
module.exports = {Database}
