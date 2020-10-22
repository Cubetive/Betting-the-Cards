const cardList = require('../data/cards.js').cardList
const util = require('../../util.js')
class Card {
  constructor(name,team,game){
    this.name = name
    this.team = team
    this.statsSwapped = false
    this.turnStartEffects = ()=>{}
    for(const [key,value] of Object.entries(cardList[name])){
      this[key]=value
    }
    //HP after damage
    this.realHP = this.baseHP
    //base means the base stats of the card. Outgoing means after all auras
    this.outgoingAttack = this.baseAttack
    this.outgoingHP = this.realHP
    this.canAttack = false
    this.outgoingKeywords = this.baseKeywords
    this.outgoingText = this.baseText
    this.outgoingStatsSwapped = this.statsSwapped
  }
  takeDamage(amount,game){
    this.realHP-=amount
    game.applyAuraEffects()
  }
  turnStart(){
    if(this.frozen){
      this.frozen = false
    }else{
      this.canAttack = true
    }
    this.turnStartEffects()
  }
  onPlay(){
    if(this.keywords.include('charge')){
      this.canAttack = true
    }
    this.canAttack = false
  }
  applyAuraEffects(game){
    this.outgoingHP = this.realHP
    this.outgoingKeywords = this.baseKeywords
    this.outgoingAttack = this.baseAttack
    this.outgoingStatsSwapped = this.statsSwapped
    //set stats auras
    for(let i=0;i<7;i++){
      if(game.players[+!this.team].slots[i]!=null && game.players[+!this.team].slots[i]!=this){
        let setStats = game.players[+!this.team].slots[i].getOutgoingAura(this).setStats
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
    for(let i=0;i<7;i++){
      if(game.players[this.team].slots[i]!=null && game.players[this.team].slots[i]!=this){
        let setStats = game.players[this.team].slots[i].getOutgoingAura(this).setStats
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
    let setStats = this.getIngoingAura().setStats
    if(setStats!=undefined){
      if(setStats.attack != undefined){
        this.outgoingAttack = setStats.attack
      }
      if(setStats.hp != undefined){
        this.outgoingHP = setStats.hp
      }
    }
    // modify stats auras and keyword auras
    for(let i=0;i<7;i++){
      if(game.players[+!this.team].slots[i]!=null && game.players[+!this.team].slots[i]!=this){
        let aura = game.players[+!this.team].slots[i].getOutgoingAura(this)
        if(aura.stats!=undefined){
          if(aura.stats.attack != undefined){
            this.outgoingAttack += aura.stats.attack
          }
          if(setStats.hp != undefined){
            this.outgoingHP += aura.stats.hp
          }
        }
        if(aura.keywords!=undefined){
          this.outgoingKeywords = util.stripDuplicates(this.outgoingKeywords.concat(aura.keywords))
        }
      }
    }
    for(let i=0;i<7;i++){
      if(game.players[this.team].slots[i]!=null && game.players[this.team].slots[i]!=this){
        let aura = game.players[this.team].slots[i].getOutgoingAura(this)
        if(aura.stats!=undefined){
          if(aura.stats.attack != undefined){
            this.outgoingAttack += aura.stats.attack
          }
          if(setStats.hp != undefined){
            this.outgoingHP += aura.stats.hp
          }
        }
        if(aura.keywords!=undefined){
          this.outgoingKeywords = util.stripDuplicates(this.outgoingKeywords.concat(aura.keywords))
        }
      }
    }
    let aura = this.getIngoingAura()
    if(aura.stats!=undefined){
      if(aura.stats.attack != undefined){
        this.outgoingAttack += aura.stats.attack
      }
      if(setStats.hp != undefined){
        this.outgoingHP += aura.stats.hp
      }
    }
    if(aura.keywords!=undefined){
      this.outgoingKeywords = util.stripDuplicates(this.outgoingKeywords.concat(aura.keywords))
    }
    //swap stats auras
    for(let i=0;i<7;i++){
      if(game.players[+!this.team].slots[i]!=null && game.players[+!this.team].slots[i]!=this){
        let aura = game.players[+!this.team].slots[i].getOutgoingAura(this)
        if(aura.swapStats!=undefined){
          this.outgoingStatsSwapped = this.outgoingStatsSwapped==!aura.swapStats
        }
      }
    }
    for(let i=0;i<7;i++){
      if(game.players[this.team].slots[i]!=null && game.players[this.team].slots[i]!=this){
        let aura = game.players[this.team].slots[i].getOutgoingAura(this)
        if(aura.swapStats!=undefined){
          this.outgoingStatsSwapped = this.outgoingStatsSwapped==!aura.swapStats
        }
      }
    }
    aura = this.getIngoingAura()
    if(aura.swapStats!=undefined){
      this.outgoingStatsSwapped = this.outgoingStatsSwapped==!aura.swapStats
    }
    //alter card text to match keywords
    this.outgoingText = this.keywords.join(', ')+'\n'+this.baseText
  }
  getOutgoingAura(card){
    return {}
  }
  getIngoingAura(){
    return {}
  }
}
module.exports = {Card}
