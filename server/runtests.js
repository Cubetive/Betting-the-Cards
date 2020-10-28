const util = require('./util.js')
const runDBTests = (db)=>{
  db.newPlayer("Steve","password")
  db.incXP("Steve",1500)
  console.log(JSON.stringify(db))
  db.incXP("Steve",7000)
  console.log(JSON.stringify(db))
}
module.exports = {runDBTests}
