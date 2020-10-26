const cardList = {
  "Stickman BOi":{
    baseHP:5,
    baseAttack:5,
    baseKeywords:["Charge"],
    cost:5,
    type:"character",
    baseText:"",
    imageLink:"",
    rarity:0,
  },
  "aura test":{
    baseHP:5,
    baseAttack:5,
    baseKeywords:[""],
    cost:5,
    type:"character",
    baseText:"",
    imageLink:"",
    outgoingAuras: [(card)=>{
      return {
        stats:{
          attack:2,
          hp:-1,
        }
      }
    }],
    rarity:0,
  },
}
module.exports = {cardList}
