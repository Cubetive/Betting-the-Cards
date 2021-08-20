let saveSocket = new WebSocket("ws://127.0.0.1:3001");
let sendThroughWebSocket = function(message){
  if(saveSocket.readyState==1){
    saveSocket.send(message);
  }else{
    alert('You have been disconnected from the server. Please close or reload the page.')
  }
}
let submitSave = function(){
  sendThroughWebSocket(JSON.stringify({type:"saveServer",data:{}}))
}
