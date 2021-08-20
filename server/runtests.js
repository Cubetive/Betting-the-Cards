const util = require('./util.js')
const runDBTests = (db)=>{
  db.newPlayer("Steve","password")
  db.newPlayer("John","password")
  db.incXP("Steve",1500)
  db.incXP("Steve",7000)
  db.setDust("Steve",7000000)
  db.craftAllCards("Steve")
  db.craftAllCards("John")
  db.setMoney("Steve",700)
  db.buyPack("Steve")
  db.openPack("Steve")
  for(let i=0;i<2500;i++){
    db.setMoney("Steve",100)
    db.buyPack("Steve")
    db.openPack("Steve")
  }
//  db.autoDisenchant("Steve")
  console.log(JSON.stringify(db))
}
module.exports = {runDBTests}
