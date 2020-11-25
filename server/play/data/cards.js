const cardList = {
  "Stickman BOi":{
    baseHP:5,
    baseAttack:5,
    baseKeywords:["Charge"],
    cost:1,
    type:"character",
    baseText:"Charge",
    imageLink:"",
    rarity:0,
  },
  "auraTest":{
    baseHP:2,
    baseAttack:3,
    baseKeywords:[""],
    cost:1,
    type:"character",
    baseText:"Other monsters have +2/-1",
    imageLink:"",
    outgoingAuras: [(card)=>{
      return {
        stats:{
          attack:2,
          hp:-1,
        }
      }
    }],
    rarity:1,
  },
  "packTest":{
    rarity:2,
  },
  "packTest2":{
    rarity:3,
  },
  "packTest3":{
    rarity:0,
  },
}
module.exports = {cardList}
