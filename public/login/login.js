const hash = function (value, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < value.length; i++) {
        ch = value.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
let submitLogin = function(){
  sendThroughWebSocket(JSON.stringify({type:"login",data:{username:username.value,password:hash(password.value)}}))
}
let loginSocket
let sendThroughWebSocket
if (localStorage.loginID!="loggedOut" && localStorage.loginID!=undefined) {
  location.assign("/decks.html");
}else{
  loginSocket = new WebSocket("ws://127.0.0.1:3001");
  loginSocket.onopen = function (event) {
  };
  loginSocket.onmessage = function(message){
    data = JSON.parse(message.data)
    if(data.successful){
      loginResults.innerHTML = "Successfully logged in."
      localStorage.loginID = data.loginID
      localStorage.username = data.username
      console.log(localStorage.loginID)
      location.assign("/decks.html");
    }else{
      loginResults.innerHTML = "Invalid username or password"
    }
  }
  sendThroughWebSocket = function(message){
    if(loginSocket.readyState==1){
      loginSocket.send(message);
    }else{
      alert('You have been disconnected from the server. Please close or reload the page.')
    }
  }
}
