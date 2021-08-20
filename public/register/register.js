var registerSocket = new WebSocket("ws://127.0.0.1:3001");
registerSocket.onopen = function (event) {
  sendThroughWebSocket(JSON.stringify({type:"verifyIdentity",data:{username:localStorage.username,loginID:localStorage.loginID,page:'register.html'}}))
};
registerSocket.onmessage = function(message){
  data = JSON.parse(message.data)
  if(data.type=='registerResults'&&data.successful){
    registerResults.innerHTML = "Successfully registered."
    localStorage.loginID = data.loginID
    localStorage.username = data.username
    location.assign("/decks.html");
  }else if(data.type=='registerResults'){
    registerResults.innerHTML = "That name is already taken."
  }
}
let sendThroughWebSocket = function(message){
  if(registerSocket.readyState==1){
    registerSocket.send(message);
  }else{
    alert('You have been disconnected from the server. Please close or reload the page.')
  }
}
let submitRegister = function(){
  console.log("submitting")
  if(password.value!==cpassword.value){
    registerResults.innerHTML = "Passwords do not match."
    return
  }
  console.log("submitting")
  sendThroughWebSocket(JSON.stringify({type:"newAccount",data:{username:username.value,password:password.value}}))
}
