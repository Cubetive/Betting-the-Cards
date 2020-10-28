const cardList = require('./play/data/cards.js').cardList
const stripDuplicates = function(array){
  let newArray = []
  for(let i=0;i<array.length;i++){
    if(!newArray.includes(array[i])){
      newArray.push(array[i])
    }
  }
  return newArray
}
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
const weightedRandomChance = (choices)=>{
  let values = Object.entries(choices)
  let totalWeight = 0
  for(let i=0;i<values.length;i++){
    totalWeight+=values[i][1]
  }
  let chosen = Math.random()*totalWeight
  let soFar = 0
  for(let i=0;i<values.length;i++){
    soFar+=values[i][1]
    if(soFar>chosen){
      return values[i][0]
    }
  }
}
const getRandomCards = (amount,requirements)=>{
  let entries = Object.entries(cardList)
  let possibilities = []
  for(let i=0;i<entries.length;i++){
    if(requirements(entries[i][1])){
      possibilities.push(entries[i][0])
    }
  }
  shuffle(possibilities)
  return possibilities.splice(0,amount)
}
module.exports = {stripDuplicates,shuffle,weightedRandomChance,getRandomCards}
