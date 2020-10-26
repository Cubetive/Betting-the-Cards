const util = require('./util.js')
const db = require('./accounts/databaseInteraction.js')
const runDBTests = ()=>{
  db.newPlayer("Steve")
  console.log(db.retrieve())
}
module.exports = {runDBTests}
