var HOST = location.origin.replace(/^http/, 'ws')
registerSocket = new WebSocket(HOST);
registerSocket.onopen = function (event) {
    sendThroughWebSocket(JSON.stringify({ type: "verifyIdentity", data: { username: localStorage.username, loginID: localStorage.loginID, page: 'register.html' }, socketType: "dbWS"  }))
};
registerSocket.onmessage = function (message) {
    data = JSON.parse(message.data)
    console.log(data)
    if (data.type == 'registerResults' && data.successful) {
        registerResults.innerHTML = "Successfully registered."
        localStorage.loginID = data.loginID
        localStorage.username = data.username
        location.assign("/decks.html");
    } else if (data.type == 'registerResults') {
        registerResults.innerHTML = "That name is already taken."
    }
}
let sendThroughWebSocket = function (message) {
    if (registerSocket.readyState == 1) {
        registerSocket.send(message);
    } else {
        alert('You have been disconnected from the server. Please close or reload the page.')
    }
}
let submitRegister = function () {
    if (password.value !== cpassword.value) {
        registerResults.innerHTML = "Passwords do not match."
        return
    }
    if (password.value == "" || username.value == "") {
        registerResults.innerHTML = "Please fill out all fields."
    }
    sendThroughWebSocket(JSON.stringify({ type: "newAccount", data: { username: username.value, password: password.value } }))
}
submitButton.addEventListener("click", submitRegister)
