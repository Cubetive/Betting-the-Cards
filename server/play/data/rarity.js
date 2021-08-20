//0: common, 1: rare, 2: epic, 3: legendary
const rarityList = {
  0:{
    maxPerDeck:4,
    maxPerCollection:4,
    dustAmount:10,
    craftCost:40,
  },
  1:{
    maxPerDeck:3,
    maxPerCollection:3,
    dustAmount:40,
    craftCost:100,
  },
  2:{
    maxPerDeck:3,
    maxPerCollection:3,
    dustAmount:100,
    craftCost:400,
  },
  3:{
    maxPerDeck:3,
    maxPerCollection:3,
    dustAmount:400,
    craftCost:1600,
  },
}
module.exports = {rarityList}
