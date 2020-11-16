const cardList = require('../data/cards.js').cardList
const util = require('../../util.js')
class Card {
  constructor(name,team,game){
    this.name = name
    this.team = team
    this.slot = null
    this.statsSwapped = false
    this.outgoingAuras = []
    this.game = game
    this.ingoingAuras = []
    this.enter = []
    this.fail = []
    this.turnStartEffects = []
    this.turnEndEffects = []
    for(const [key,value] of Object.entries(cardList[name])){
      this[key]=value
    }
    //HP after damage
    this.realHP = this.baseHP
    //base means the base stats of the card. Outgoing means after all auras
    this.outgoingAttack = this.baseAttack
    this.outgoingHP = this.realHP
    this.attacking = false
    this.canAttack = false
    this.outgoingKeywords = this.baseKeywords
    this.outgoingText = this.baseText
    this.outgoingStatsSwapped = this.statsSwapped
  }
  getNonCircularCopy(){
    let game = this.game
    this.game = undefined
    let toReturn = JSON.parse(JSON.stringify(this))
    this.game = game
    return toReturn
  }
  attack(target,override){
    if(!override && !this.canAttack){
      return
    }
    this.attacking = true
    this.game.applyAuraEffects()
    if(target.fail!=undefined){
      //it's a monster
      target.takeDamage(this,this.outgoingAttack,this.game)
      this.takeDamage(target,target.outgoingAttack,this.game)
    }else{
      //it's a player
      target.takeDamage(this,this.outgoingAttack,this.game)
    }
    this.attacking = false
    this.canAttack = false
    this.game.applyAuraEffects()
  }
  takeDamage(source,amount){
    this.realHP-=amount
    this.game.applyAuraEffects()
  }
  checkDeath(){
    if(this.outgoingHP<=0){
      this.game.players[team].slots[this.slot] = null
      this.game.applyAuraEffects()
      for(let i=0;i<this.fail.length;i++){
        this.fail[i](this.game)
        this.game.applyAuraEffects()
      }
    }
  }
  turnStart(){
    if(this.frozen){
      this.frozen = false
      this.canAttack = false
    }else{
      this.canAttack = true
    }
    for(let i=0;i<this.turnStartEffects.length;i++){
      this.turnStartEffects[i](this.game)
      this.game.applyAuraEffects()
    }
  }
  turnEnd(){
    for(let i=0;i<this.turnEndEffects.length;i++){
      this.turnEndEffects[i](this.game)
      this.game.applyAuraEffects()
    }
  }
  onSummon(played,slot){
    if(this.keywords.include('Charge')){
      this.canAttack = true
    }
    this.slot = slot
    this.canAttack = false
  }
  applyAuraEffects(){
    this.outgoingHP = this.realHP
    this.outgoingKeywords = this.baseKeywords
    this.outgoingAttack = this.baseAttack
    this.outgoingStatsSwapped = this.statsSwapped
    //set stats auras
    for(let i=0;i<7;i++){
      if(this.game.players[+!this.team].slots[i]!=null && this.game.players[+!this.team].slots[i]!=this){
        for(let j=0;j<this.game.players[+!this.team].slots[i].outgoingAuras.length;j++){
          let setStats = this.game.players[+!this.team].slots[i].outgoingAuras[j](this).setStats
          if(setStats!=undefined){
            if(setStats.attack != undefined){
              this.outgoingAttack = setStats.attack
            }
            if(setStats.hp != undefined){
              this.outgoingHP = setStats.hp
            }
          }
        }
      }
    }
    for(let i=0;i<7;i++){
      if(this.game.players[this.team].slots[i]!=null && this.game.players[this.team].slots[i]!=this){
        for(let j=0;j<this.game.players[this.team].slots[i].outgoingAuras.length;j++){
          let setStats = this.game.players[this.team].slots[i].outgoingAuras[j](this).setStats
          if(setStats!=undefined){
            if(setStats.attack != undefined){
              this.outgoingAttack = setStats.attack
            }
            if(setStats.hp != undefined){
              this.outgoingHP = setStats.hp
            }
          }
        }
      }
    }
    for(let i=0;i<this.ingoingAuras.length;i++){
      let setStats = this.ingoingAuras[i]().setStats
      if(setStats!=undefined){
        if(setStats.attack != undefined){
          this.outgoingAttack = setStats.attack
        }
        if(setStats.hp != undefined){
          this.outgoingHP = setStats.hp
        }
      }
    }
    // modify stats auras and keyword auras
    for(let i=0;i<7;i++){
      if(this.game.players[+!this.team].slots[i]!=null && this.game.players[+!this.team].slots[i]!=this){
        for(let j=0;j<this.game.players[+!this.team].slots[i].outgoingAuras.length;j++){
          let aura = this.game.players[+!this.team].slots[i].outgoingAuras[j](this)
          if(aura.stats.attack != undefined){
            this.outgoingAttack += aura.stats.attack
          }
          if(aura.stats.hp != undefined){
            this.outgoingHP += aura.stats.hp
          }
          if(aura.keywords!=undefined){
            this.outgoingKeywords = util.stripDuplicates(this.outgoingKeywords.concat(aura.keywords))
          }
        }
      }
    }
    for(let i=0;i<7;i++){
      if(this.game.players[this.team].slots[i]!=null && this.game.players[this.team].slots[i]!=this){
        for(let j=0;j<this.game.players[this.team].slots[i].outgoingAuras.length;j++){
          let aura = this.game.players[this.team].slots[i].outgoingAuras[j](this)
          if(aura.stats.attack != undefined){
            this.outgoingAttack += aura.stats.attack
          }
          if(aura.stats.hp != undefined){
            this.outgoingHP += aura.stats.hp
          }
          if(aura.keywords!=undefined){
            this.outgoingKeywords = util.stripDuplicates(this.outgoingKeywords.concat(aura.keywords))
          }
        }
      }
    }
    for(let i=0;i<this.ingoingAuras.length;i++){
      let aura = this.ingoingAuras[i]()
      if(aura!=undefined){
        if(aura.stats.attack != undefined){
          this.outgoingAttack = aura.stats.attack
        }
        if(aura.stats.hp != undefined){
          this.outgoingHP = aura.stats.hp
        }
        if(aura.keywords != undefined){
          this.outgoingKeywords = util.stripDuplicates(this.outgoingKeywords.concat(aura.keywords))
        }
      }
    }
    //swap stats auras
    for(let i=0;i<7;i++){
      if(this.game.players[+!this.team].slots[i]!=null && this.game.players[+!this.team].slots[i]!=this){
        for(let j=0;j<this.game.players[+!this.team].slots[i].outgoingAuras.length;j++){
          let aura = this.game.players[+!this.team].slots[i].outgoingAuras[j](this)
          if(aura.swapStats!=undefined){
            this.outgoingStatsSwapped = this.outgoingStatsSwapped==!aura.swapStats
          }
        }
      }
    }
    for(let i=0;i<7;i++){
      if(this.game.players[this.team].slots[i]!=null && this.game.players[this.team].slots[i]!=this){
        for(let j=0;j<this.game.players[this.team].slots[i].outgoingAuras.length;j++){
          let aura = this.game.players[this.team].slots[i].outgoingAuras[j](this)
          if(aura.swapStats!=undefined){
            this.outgoingStatsSwapped = this.outgoingStatsSwapped==!aura.swapStats
          }
        }
      }
    }
    for(let i=0;i<this.ingoingAuras.length;i++){
      let aura = this.ingoingAuras[i](this)
      if(aura.swapStats!=undefined){
        this.outgoingStatsSwapped = this.outgoingStatsSwapped==!aura.swapStats
      }
    }
    //alter card text to match keywords
    this.outgoingText = this.outgoingKeywords.join(', ')+'\n'+this.baseText
    this.checkDeath(this.game)
  }
}
module.exports = {Card}
