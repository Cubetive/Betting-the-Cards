var HOST = location.origin.replace(/^http/, 'ws')
var playSocket = new WebSocket(HOST);
let loginID = localStorage.loginID
if (undefined == loginID || loginID == "loggedOut") {
    location.replace("/login.html");
}
console.log(loginID)
playSocket.onopen = function (event) {
    sendThroughWebSocket(JSON.stringify({ type: "verifyIdentity", data: { username: localStorage.username, loginID: loginID, page: 'play.html' },socketType:"dbWS" }))
    if (!localStorage.allCardList || true) {
        sendThroughWebSocket(JSON.stringify({
            type: "loadAllCards"
        }))
    }
};
let collection = {}
let decks = []
playSocket.onmessage = function (message) {
    data = JSON.parse(message.data)
    switch (data.type) {
        case "verificationResult":
            if (data.successful) {
                playSocket.verified = true
                sendThroughWebSocket(JSON.stringify({
                    type: "getCollectionAndDecks"
                }))
                if (data.queueClosed) {
                    document.getElementById("enterQueueButton").remove()
                    document.getElementById("SuspiciousLookingDiv").innerHTML = "The queue is currently closed."
                }
            } else {
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
        case "enterQueue":
            if (data.successful) {
                document.getElementById("SuspiciousLookingDiv").innerHTML = "You are now in the queue. To leave the queue, navigate away from the page."
            }
        default:
            break
    }
}
let sendThroughWebSocket = function (message) {
    if (playSocket.readyState == 1) {
        playSocket.send(message);
    } else {
        alert('You have been disconnected from the server. Please close or reload the page.')
    }
}
