var playSocket = new WebSocket("ws://127.0.0.1:3001");
let loginID = localStorage.loginID
if(undefined == loginID || loginID == "loggedOut"){
  location.replace("/login.html");
}
console.log(loginID)
playSocket.onopen = function (event) {
  sendThroughWebSocket(JSON.stringify({type:"verifyIdentity",data:{username:localStorage.username,loginID:loginID,page:'play.html'}}))
  if(!localStorage.allCardList || true){
    sendThroughWebSocket(JSON.stringify({
      type:"loadAllCards"
    }))
  }
};
let collection = {}
let decks = []
playSocket.onmessage = function(message){
  data = JSON.parse(message.data)
  switch(data.type){
    case "verificationResult":
      if(data.successful){
        playSocket.verified = true
        sendThroughWebSocket(JSON.stringify({
          type:"getCollectionAndDecks"
        }))
      }else{
        localStorage.loginID = "loggedOut"
        localStorage.username = "loggedOut"
        location.assign("/login.html");
      }
      break
    case "allCardList":
      localStorage.allCardList = JSON.stringify(data.allCardList)
      App.allCardList = data.allCardList
      App.rarityData = data.rarityData
      break
    case "sendCollectionAndDecks":
      App.decks = data.decks
      App.collection = data.collection
      break
    case "gameFound":
      location.assign('gameVue.html')
      break
    default:
      break
  }
}
let sendThroughWebSocket = function(message){
  if(playSocket.readyState==1){
    playSocket.send(message);
  }else{
    alert('You have been disconnected from the server. Please close or reload the page.')
  }
}
