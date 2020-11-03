const cardList = require('../data/cards.js').cardList
const util = require('../../util.js')
class Card {
  constructor(name,team){
    this.name = name
    this.team = team
    this.slot = null
    this.statsSwapped = false
    this.outgoingAuras = []
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
  attack(game,target,override){
    if(!override && !this.canAttack){
      return
    }
    this.attacking = true
    game.applyAuraEffects()
    if(target.fail!=undefined){
      //it's a monster
      target.takeDamage(this,this.outgoingAttack,game)
      this.takeDamage(target,target.outgoingAttack,game)
    }else{
      //it's a player
      target.takeDamage(this,this.outgoingAttack,game)
    }
    this.attacking = false
    this.canAttack = false
    game.applyAuraEffects()
  }
  takeDamage(source,amount,game){
    this.realHP-=amount
    game.applyAuraEffects()
  }
  checkDeath(game){
    if(this.outgoingHP<=0){
      game.players[team].slots[this.slot] = null
      game.applyAuraEffects()
      for(let i=0;i<this.fail.length;i++){
        this.fail[i](game)
        game.applyAuraEffects()
      }
    }
  }
  turnStart(game){
    if(this.frozen){
      this.frozen = false
      this.canAttack = false
    }else{
      this.canAttack = true
    }
    for(let i=0;i<this.turnStartEffects.length;i++){
      this.turnStartEffects[i](game)
      game.applyAuraEffects()
    }
  }
  turnEnd(game){
    for(let i=0;i<this.turnEndEffects.length;i++){
      this.turnEndEffects[i](game)
      game.applyAuraEffects()
    }
  }
  onSummon(game,played,slot){
    if(this.keywords.include('Charge')){
      this.canAttack = true
    }
    this.slot = slot
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
        for(let j=0;j<game.players[+!this.team].slots[i].outgoingAuras.length;j++){
          let setStats = game.players[+!this.team].slots[i].outgoingAuras[j](this).setStats
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
      if(game.players[this.team].slots[i]!=null && game.players[this.team].slots[i]!=this){
        for(let j=0;j<game.players[this.team].slots[i].outgoingAuras.length;j++){
          let setStats = game.players[this.team].slots[i].outgoingAuras[j](this).setStats
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
      if(game.players[+!this.team].slots[i]!=null && game.players[+!this.team].slots[i]!=this){
        for(let j=0;j<game.players[+!this.team].slots[i].outgoingAuras.length;j++){
          let aura = game.players[+!this.team].slots[i].outgoingAuras[j](this)
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
      if(game.players[this.team].slots[i]!=null && game.players[this.team].slots[i]!=this){
        for(let j=0;j<game.players[this.team].slots[i].outgoingAuras.length;j++){
          let aura = game.players[this.team].slots[i].outgoingAuras[j](this)
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
      if(game.players[+!this.team].slots[i]!=null && game.players[+!this.team].slots[i]!=this){
        for(let j=0;j<game.players[+!this.team].slots[i].outgoingAuras.length;j++){
          let aura = game.players[+!this.team].slots[i].outgoingAuras[j](this)
          if(aura.swapStats!=undefined){
            this.outgoingStatsSwapped = this.outgoingStatsSwapped==!aura.swapStats
          }
        }
      }
    }
    for(let i=0;i<7;i++){
      if(game.players[this.team].slots[i]!=null && game.players[this.team].slots[i]!=this){
        for(let j=0;j<game.players[this.team].slots[i].outgoingAuras.length;j++){
          let aura = game.players[this.team].slots[i].outgoingAuras[j](this)
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
    this.checkDeath(game)
  }
}
module.exports = {Card}
