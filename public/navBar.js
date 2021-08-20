document.getElementById('navBar').innerHTML=`
  <a class="menu" href="index.html">Home</a>
  <a class="menu" href="play.html">Play</a>
  <a class="menu" href="decks.html">Your decks</a>
  <a class="menu">Crafting</a>
  <a class="menu" href="login.html">Login</a>
  <a class="menu" href="register.html">Register</a>
  <button class="menu" onclick="localStorage.loginID='loggedOut';localStorage.username = 'loggedOut';location.assign('login.html')">Logout</button>
  <span id="name" style="float:right;"></span>
`
if(localStorage.username!='loggedOut' && localStorage.username!=undefined){
  document.getElementById('name').innerHTML=`${localStorage.username}`
}
