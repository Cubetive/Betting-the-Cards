var HOST = location.origin.replace(/^http/, 'ws')
let saveSocket = new WebSocket(HOST);
let sendThroughWebSocket = function (message) {
    if (saveSocket.readyState == 1) {
        saveSocket.send(message);
    } else {
        alert('You have been disconnected from the server. Please close or reload the page.')
    }
}
saveSocket.onopen = function (event) {
    sendThroughWebSocket(JSON.stringify({ type: "verifyIdentity", data: { username: localStorage.username, loginID: localStorage.loginID, page: 'index.html' }, socketType: "dbWS" }))
};
let submitSave = function () {
    sendThroughWebSocket(JSON.stringify({ type: "saveServer", data: {}}))
}
if (localStorage.username == "eagleclaw774") {
    
    document.getElementById("SuspiciousLookingSpan").innerHTML="<button onclick = \"submitSave()\" > SAVE SERVER</button >"
}