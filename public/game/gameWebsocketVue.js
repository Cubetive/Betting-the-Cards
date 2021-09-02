var HOST = location.origin.replace(/^http/, 'ws')
var exampleSocket = new WebSocket(HOST);
exampleSocket.onmessage = function (event) {
}
exampleSocket.onopen = function (event) {
    sendThroughWebSocket(JSON.stringify({ type: 'verifyIdentity', loginID: localStorage.loginID, username: localStorage.username, page: 'game.html',socketType:"gameWS" }));
    sendThroughWebSocket(JSON.stringify({ type: 'loadAllCards',socketType:"gameWS" }));
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
