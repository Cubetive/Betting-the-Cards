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
    this.damage = 0
    this.turnEndEffects = []
    for(const [key,value] of Object.entries(cardList[name])){
      this[key]=value
    }
    //HP after damage
    this.realHP = this.baseHP
    //base means the base stats of the card. Outgoing means after all auras
    this.outgoingAttack = this.baseAttack
    this.outgoingBaseHP = this.realHP
    this.outgoingHP = this.realHP
    this.attacking = false
    this.canAttack = false
    this.outgoingKeywords = this.baseKeywords
    this.ableToAttack = {}
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
  updateAttackable(){
    let tauntCharacters = []
    let allEnemyCharacters = []
    let attackable = {}
    for(let i=0;i<this.game.players[+!this.team].slots.length;i++){
      let character = this.game.players[+!this.team].slots[i]
      if(character!=this && character!=null){
        if(character.outgoingKeywords.includes("Taunt")){
          tauntCharacters.push(character)
        }
        allEnemyCharacters.push(character)
      }
    }
    let enemySlots = []
    if(tauntCharacters.length===0){
      for(let i=0;i<allEnemyCharacters.length;i++){
        enemySlots.push(allEnemyCharacters[i].slot)
      }
      attackable.enemySlots = enemySlots
      attackable.allySlots = []
      attackable.allyPlayer = false
      attackable.enemyPlayer = true
    }else{
      for(let i=0;i<tauntCharacters.length;i++){
        attackable.push(tauntCharacters[i].slot)
      }
      attackable.enemySlots = enemySlots
      attackable.allySlots = []
      attackable.allyPlayer = false
      attackable.enemyPlayer = false
    }
    this.ableToAttack = attackable
  }
  attackMonster(target,override){
    if(!override && !this.canAttack){
      return
    }
    if(!(target.team == this.team && this.ableToAttack.allySlots.includes(target.slot))&&!(target.team !== this.team && this.ableToAttack.enemySlots.includes(target.slot))){
      return
    }
    this.attacking = "monster"
    this.game.applyAuraEffects()
    target.takeDamage(this,this.outgoingAttack)
    this.takeDamage(target,target.outgoingAttack)
    this.attacking = false
    this.canAttack = false
    this.game.applyAuraEffects()
  }
  attackPlayer(target,override){
    if(!override && !this.canAttack){
      return
    }
    if(!(target.id == this.team && this.ableToAttack.allyPlayer)&&!(target.id !== this.team && this.ableToAttack.enemyPlayer)){
      return
    }
    this.attacking = "player"
    this.game.applyAuraEffects()
    target.takeDamage(this,this.outgoingAttack)
    this.attacking = false
    this.canAttack = false
    this.game.applyAuraEffects()
  }
  takeDamage(source,amount){
    this.damage+=amount
    console.log(this.damage)
    this.game.applyAuraEffects()
  }
  checkDeath(){
    if(this.outgoingHP<=0){
      this.die()
    }
  }
  die(){
    this.game.players[this.team].slots[this.slot] = null
    this.game.players[this.team].addAnimation("awaitDeath",{ally:true,slot:this.slot},300)
    this.game.players[this.team].addAnimation("die",{ally:true,slot:this.slot},0)
    this.game.players[+!this.team].addAnimation("awaitDeath",{ally:false,slot:this.slot},300)
    this.game.players[+!this.team].addAnimation("die",{ally:false,slot:this.slot},0)
    this.game.applyAuraEffects()
    for(let i=0;i<this.fail.length;i++){
      this.fail[i](this.game)
      this.game.applyAuraEffects()
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
  onSummon(played){
    if(this.outgoingKeywords.includes('Charge')){
      this.canAttack = true
    }
  }
  setupSummon(slot){
    this.slot = slot
    this.canAttack = false
    this.game.players[+!this.team].addAnimation("enemySummonCard",{card:this.getNonCircularCopy(),slotNum:slot},0)
  }
  applyAuraEffects(){
    let prevATK = this.outgoingAttack
    let prevHP = this.outgoingHP
    this.outgoingBaseHP = this.baseHP
    this.outgoingHP = this.baseHP - this.damage
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
              this.outgoingBaseHP = setStats.hp
              this.outgoingHP = this.outgoingBaseHP - this.damage
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
              this.outgoingBaseHP = setStats.hp
              this.outgoingHP = this.outgoingBaseHP - this.damage
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
          this.outgoingBaseHP = setStats.hp
          this.outgoingHP = this.outgoingBaseHP - this.damage
        }
      }
    }
    // modify stats auras and keyword auras
    for(let i=0;i<7;i++){
      if(this.game.players[+!this.team].slots[i]!=null && this.game.players[+!this.team].slots[i]!=this){
        for(let j=0;j<this.game.players[+!this.team].slots[i].outgoingAuras.length;j++){
          let aura = this.game.players[+!this.team].slots[i].outgoingAuras[j](this)
          if(aura.stats!=undefined){
            if(aura.stats.attack != undefined){
              this.outgoingAttack += aura.stats.attack
            }
            if(aura.stats.hp != undefined){
              this.outgoingBaseHP += aura.stats.hp
              this.outgoingHP = this.outgoingBaseHP - this.damage
            }
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
          if(aura.stats!=undefined){
            if(aura.stats.attack != undefined){
              this.outgoingAttack += aura.stats.attack
            }
            if(aura.stats.hp != undefined){
              this.outgoingBaseHP += aura.stats.hp
              this.outgoingHP = this.outgoingBaseHP - this.damage
            }
          }
          if(aura.keywords!=undefined){
            this.outgoingKeywords = util.stripDuplicates(this.outgoingKeywords.concat(aura.keywords))
          }
        }
      }
    }
    for(let i=0;i<this.ingoingAuras.length;i++){
      let aura = this.ingoingAuras[i]()
      if(aura.stats!=undefined){
        if(aura.stats.attack != undefined){
          this.outgoingAttack = aura.stats.attack
        }
        if(aura.stats.hp != undefined){
          this.outgoingBaseHP += aura.stats.hp
          this.outgoingHP = this.outgoingBaseHP - this.damage
        }
      }
      if(aura.keywords != undefined){
        this.outgoingKeywords = util.stripDuplicates(this.outgoingKeywords.concat(aura.keywords))
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
    if(this.outgoingStatsSwapped){
      this.outgoingHP = this.outgoingAttack - this.damage
      this.outgoingAttack = this.outgoingBaseHP
    }
    if(this.outgoingHP!=prevHP||prevATK!=this.outgoingAttack){
      this.game.players[this.team].addAnimation("cardStatChange",{ally:true,pos:this.slot,hp:this.outgoingHP,attack:this.outgoingAttack},0)
      this.game.players[+!this.team].addAnimation("cardStatChange",{ally:false,pos:this.slot,hp:this.outgoingHP,attack:this.outgoingAttack},0)
    }
    //alter card text to match keywords
    this.updateAttackable()
    this.checkDeath(this.game)
  }
}
module.exports = {Card}
