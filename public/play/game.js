/* Main script for Betting The Cards */

/*
  * Betting The Cards© Copyright 2020
  * Owner: F.U.C.C, Cubetive
  * Licensed under the MIT License
*/
// Initalisation
const gamearea = document.getElementById("gamearea");

let game = new PIXI.Application({
  width: 1440,
  height: 675,
  antialias: true,
  transparent: false,
  resolution: 1
});
gamearea.appendChild(game.view);
// Player variables
var friendly = {
  name: "Cubetive",
  numOfCards: 8,
  numOfCardsMax: 10,
  mana: 5,
  health: 28,
  healthMax: 30,
  deck: []
}

var enemy = {
  name: "UrMom",
  numOfCards: 6,
  numOfCardsMax: 10,
  mana: 5,
  health: 24,
  healthMax: 30,
  deck: []
}

// Main
function setup() {

}

function gameloop() {

}
