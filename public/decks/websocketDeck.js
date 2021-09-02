var HOST = location.origin.replace(/^http/, 'ws')
var deckSocket = new WebSocket(HOST);
let loginID = localStorage.loginID
if(undefined == loginID || loginID == "loggedOut"){
  location.replace("/login.html");
}
console.log(loginID)
deckSocket.onopen = function (event) {
  sendThroughWebSocket(JSON.stringify({type:"verifyIdentity",data:{username:localStorage.username,loginID:loginID,page:'decks.html'},socketType:"dbWS"}))
  if(!localStorage.allCardList || true){
    sendThroughWebSocket(JSON.stringify({
        type: "loadAllCards", socketType: "dbWS"
    }))
  }
};
let collection = {}
let decks = []
deckSocket.onmessage = function(message){
  data = JSON.parse(message.data)
  switch(data.type){
    case "verificationResult":
      if(data.successful){
        deckSocket.verified = true
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
      App.keywordData = data.keywordData
      break
    case "sendDeck":
      App.$set(App.decks,data.deckID, data.deck)
      break
    case "sendCollectionAndDecks":
    console.log(data)
      App.decks = data.decks
      App.collection = data.collection
      break
    default:
      break
  }
}
let sendThroughWebSocket = function(message){
  if(deckSocket.readyState==1){
    deckSocket.send(message);
  }else{
    alert('You have been disconnected from the server. Please close or reload the page.')
  }
}
