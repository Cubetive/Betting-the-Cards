const util = require('../util.js')
const db = require('databaseInteraction')
const save = ()=>{
  fs.writeFileSync(`./data.json`,JSON.stringify(data))
}
const editData = (callback)=>{
  data = callback(data)
}
const newPlayer = (name,password)=>{
  editData((data)=>{
    data.players.push({
      cards:{},
      name:name,
      level:1,
      xp:0,
      decks:[],
      history:[],
      password,
    })
    return data
  })
}
module.exports = {editData,newPlayer,data}
