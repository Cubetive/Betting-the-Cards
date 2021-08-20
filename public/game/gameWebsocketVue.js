let exampleSocket = new WebSocket("ws:/127.0.0.1:3000");
exampleSocket.onmessage = function (event) {
}
exampleSocket.onopen = function (event) {
    sendThroughWebSocket(JSON.stringify({ type: 'verifyIdentity', loginID: localStorage.loginID, username: localStorage.username, page: 'game.html' }));
    sendThroughWebSocket(JSON.stringify({ type: 'loadAllCards' }));
};
exampleSocket.onmessage = function (message) {
    let data = JSON.parse(message.data)
    console.log(message, data)
    if (data.animationList[0].type != "allCardList") {
        App.deHighlightCards()
    }
    handleNextAnimation(JSON.parse(JSON.stringify(data.animationList)), data.cardData)
}
let notified = false
let gameEnded = false
sendThroughWebSocket = function (message) {
    if (exampleSocket.readyState > 1 && !gameEnded) {
        alert('You have been disconnected from the server. Please close or reload the page.')
    } else {
        exampleSocket.send(message);
    }
}
