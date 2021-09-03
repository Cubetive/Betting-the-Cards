document.getElementById('navBar').innerHTML=`
  <a class="menu" href="index.html">Home</a>
  <a class="menu" href="play.html">Play</a>
  <a class="menu" href="decks.html">Your decks</a>
  <a class="menu" href="login.html" id="loginLink">Login</a>
  <a class="menu" href="register.html" id="registerLink">Register</a>
  <button class="menu" id="logOutButton" onclick="localStorage.loginID='loggedOut';localStorage.username = 'loggedOut';location.assign('login.html')">Logout</button>
  <span id="name" style="float:right;"></span>
`
if (localStorage.username != 'loggedOut' && localStorage.username != undefined) {
    document.getElementById('name').innerHTML = `${localStorage.username}`
    document.getElementById('loginLink').remove()
    document.getElementById('registerLink').remove()
} else {
    document.getElementById('logOutButton').remove()
}
