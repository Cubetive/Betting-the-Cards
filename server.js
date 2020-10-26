const express = require("express")
const hbs = require('hbs')
const Game = require('./server/play/classes/Game.js').Game
const tests = require('./server/runtests.js')
const bodyParser = require("body-parser");
var nextGameState = 0
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"))
app.set('view engine','hbs')
gameStates = {}
//handle requests
app.get("/gameState",(request,response)=>{
  if(!gameStates[request.query.gameID]){
    gameStates[request.query.gameID]={
      preventInfiniteLoop:true,
      gameID:request.query.gameID,
      messages:[],
      players:[],
      votes:[],
      policiesDeck:['Fascist','Fascist','Fascist','Fascist','Fascist','Fascist','Fascist','Fascist','Fascist','Fascist','Fascist','Liberal','Liberal','Liberal','Liberal','Liberal','Liberal'],
      policiesDiscard:[],
      liberalRowPlaced:0,
      curPolicyChoice:"",
      savePresident:-1,
      fascistsRowPlaced:0,
      playerInfo:{
        curMessage:'',
        isHost:false,
        investigated:[],
        topThreeCards:[],
        id:-1,
        name:'',
        message:'',
        identity:'',
        choiceType:'',
        choices:[],
      },
      names:[],
      started:false,
      fascistId:-1,
      presidentId:-1,
      prevPresidentId:-1,
      chancellorId:-1,
      prevChancellorId:-1,
      voting:false,
      failedVotes:0,
    }
  }
  response.send(gameStates[request.query.gameID])
})
app.post("/sendVote",(request,response)=>{
  gameStates[request.body.gameID].players[request.body.vote.id].vote = request.body.vote.choice
  gameStates[request.body.gameID].votes.push(request.body.vote.choice)
  response.send("yes")
})
app.post("/sendMessage",(request,response)=>{
  gameStates[request.body.gameID].messages.push(request.body.message)
  response.send("yes")
})
app.post("/addPlayer",(request,response)=>{
  gameStates[request.body.gameID].players.push(request.body.player)
  gameStates[request.body.gameID].names.push(request.body.player.name)
  response.send("yes")
})
app.post("/clearChoices",(request,response)=>{
  gameStates[request.body.gameID].players[request.body.id].choices=[]
  response.send("yes")
})
app.post("/newGameState",(request,response)=>{
  gameStates[nextGameState] = new Game(["Stickman BOi","Stickman BOi","Stickman BOi","Stickman BOi"],["Stickman BOi","Stickman BOi","Stickman BOi","Stickman BOi"])
  nextGameState++
  response.send("yes")
})
app.post("/nextTurn",(request,response)=>{
  gameStates[request.body.gameID].nextTurn()
  response.send("yes")
  nextGameState++
})
app.get("/gameStates",(request,response)=>{
  console.log(gameStates)
  response.send(JSON.stringify(gameStates))
})
app.get("/hell",(request,rep)=>{
  rep.send({whoCanLeaveHell:["not you puny mortal"],isSatanAllPowerful:true,doIdeserverToBeInHell:"who cares",IsInHell:"yes",temperature:"500 degress celsius",colour:"red"})
})
app.listen(8081)
//do not uncomment this when using nodemon or you will get stuck in an infinte loop
//tests.runDBTests()
