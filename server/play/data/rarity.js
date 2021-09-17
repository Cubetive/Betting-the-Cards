//0: common, 1: rare, 2: epic, 3: legendary
//101: token, 102: not a card
const rarityList = {
  0:{
    maxPerDeck:4,
    maxPerCollection:4,
    dustAmount:10,
    craftCost:40,
    collectible:true,
  },
  1:{
    maxPerDeck:3,
    maxPerCollection:3,
    dustAmount:40,
    craftCost: 100,
    collectible: true,
  },
  2:{
    maxPerDeck:3,
    maxPerCollection:3,
    dustAmount:100,
    craftCost: 400,
    collectible: true,
  },
  3:{
    maxPerDeck:3,
    maxPerCollection:3,
    dustAmount:400,
    craftCost: 1600,
    collectible: true,
  },
  101:{
    maxPerDeck: 0,
    maxPerCollection: 0,
    dustAmount: 0,
    craftCost: 0,
    collectible: false,
  },
  102:{
    maxPerDeck: 0,
    maxPerCollection: 0,
    dustAmount: 0,
    craftCost: 0,
    collectible: false,
  },
}
module.exports = {rarityList}
