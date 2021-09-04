var HOST = location.origin.replace(/^http/, 'ws')
let saveSocket = new WebSocket(HOST);
let sendThroughWebSocket = function (message) {
    if (saveSocket.readyState == 1) {
        saveSocket.send(message);
    } else {
        alert('You have been disconnected from the server. Please close or reload the page.')
    }
}
saveSocket.onmessage = function (message) {
    console.log(message)
};
saveSocket.onopen = function (event) {
    sendThroughWebSocket(JSON.stringify({ type: "verifyIdentity", data: { username: localStorage.username, loginID: localStorage.loginID, page: 'index.html' }, socketType: "dbWS" }))
};
let pullServerData = function (password) {
    sendThroughWebSocket(JSON.stringify({ type: "pullServerData", data: {password} }))
}
let sendServerData = function (password,data) {
    sendThroughWebSocket(JSON.stringify({ type: "sendServerData", data: { newData:data, password } }))
}
if (localStorage.username == "eagleclaw774") {
    document.getElementById("SuspiciousLookingSpan").innerHTML ="<button onclick = \"pullServerData()\" > PULL DATA</button >"
}