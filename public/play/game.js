/* Main script for Betting The Cards */

/*
  * Betting The Cards© Copyright 2020
  * Owner: F.U.C.C, Cubetive
  * Licensed under the MIT License
*/
// Initalisation
const gamearea = document.getElementById("gamearea");
let sendThroughWebSocket
let game = new PIXI.Application({
  width: 1440,
  height: 775,
  antialias: true,
  transparent: false,
  resolution: 1
});
gamearea.appendChild(game.view);// center the sprite's anchor point
let exampleCard = {"name":"Stickman BOi","team":0,"slot":null,"statsSwapped":false,"outgoingAuras":[],"ingoingAuras":[],"enter":[],"fail":[],"turnStartEffects":[],"turnEndEffects":[],"baseHP":5,"baseAttack":5,"baseKeywords":["Charge"],"cost":5,"type":"character","baseText":"","imageLink":"","rarity":0,"realHP":5,"outgoingAttack":5,"outgoingHP":5,"attacking":false,"canAttack":false,"outgoingKeywords":["Charge"],"outgoingText":"When this attacks burn your hand then draw three cards","outgoingStatsSwapped":false}
// Main
const normalSkin = PIXI.Texture.fromImage('play/CardFrame.png')
const highlightedSkin = PIXI.Texture.fromImage('play/CardFrameHighlighted.png')
let endTurnButton
let enemyStats = []
let allyStats = []
let mana = 0
function setup() {
  const slots = new PIXI.Graphics()
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
  //enemyslots
  slots.lineStyle(2, 0xFFFFFF, 1)
  slots.beginFill(0x666666)
  slots.drawRect(50, 65, 1340, 200)
  slots.endFill()
  slots.lineStyle(2, 0xFFFFFF, 1)
  slots.beginFill(0x666666)
  slots.drawRect(50, 265, 1340, 200)
  slots.endFill()
  slots.lineStyle(2, 0xFFFFFF, 1)
  for(let i=0;i<7;i++){
    slots.moveTo(1340/7*i+50, 65)
    slots.lineTo(1340/7*i+50, 465)
  }
  game.stage.addChild(slots)
  //end turn button
  endTurnButton = PIXI.Sprite.from('play/EndTurn.png');

  // Set the initial position
  endTurnButton.anchor.set(0);
  endTurnButton.x = 550;
  endTurnButton.y = 465;

  // Opt-in to interactivity
  endTurnButton.interactive = true;

  // Shows hand cursor
  endTurnButton.buttonMode = true;

  // Pointers normalize touch and mouse
  endTurnButton.on('pointerdown', onClick);
  function onClick() {
    sendThroughWebSocket(JSON.stringify({type:"endTurn"}))
  }
  game.stage.addChild(endTurnButton)

  const statsStyle = new PIXI.TextStyle({
    fontSize: 20,
    fill:[0xFFFFFF],
  });
  allyStats.push(new PIXI.Text("HP: 30/30",statsStyle))
  allyStats[0].x = 450;
  allyStats[0].y = 485;
  game.stage.addChild(allyStats[0]);
  allyStats.push(new PIXI.Text("Mana: 1/1",statsStyle))
  allyStats[1].x = 688;
  allyStats[1].y = 485;
  game.stage.addChild(allyStats[1]);
  allyStats.push(new PIXI.Text("Cards in Hand: 3",statsStyle))
  allyStats[2].x = 824;
  allyStats[2].y = 485;
  game.stage.addChild(allyStats[2]);

  enemyStats.push(new PIXI.Text("Enemy HP: 30/30",statsStyle))
  enemyStats[0].x = 450;
  enemyStats[0].y = 20;
  game.stage.addChild(enemyStats[0]);
  enemyStats.push(new PIXI.Text("Enemy Mana: 1/1",statsStyle))
  enemyStats[1].x = 648;
  enemyStats[1].y = 20;
  game.stage.addChild(enemyStats[1]);
  enemyStats.push(new PIXI.Text("Enemy Cards in Hand: 3",statsStyle))
  enemyStats[2].x = 844;
  enemyStats[2].y = 20;
  game.stage.addChild(enemyStats[2]);
}
const hand = []
const allySlots = []
const enemySlots = []
function makeCardHand(card){

  const container = new PIXI.Container();
  container.card = card
  game.stage.addChild(container);
  // move the sprite to the center of the screen
  container.x = hand.length*128+50
  container.y = 529
  //cardskin
  const frame = new PIXI.Sprite(normalSkin)
  frame.anchor.set(0)

  container.addChild(frame)
  //cost and name
  const costStyle = new PIXI.TextStyle({
    fontSize: 13,
  });
  const costText = new PIXI.Text(card.cost,costStyle);
  costText.x = 105;
  costText.y = 7;
  container.addChild(costText);
  const nameStyle = new PIXI.TextStyle({
    fontSize: 12,
  });
  const nameText = new PIXI.Text(card.name,nameStyle);
  nameText.x = 10;
  nameText.y = 7;
  container.addChild(nameText);
  //hp and atk
  const hpText = new PIXI.Text(card.outgoingHP,costStyle);
  hpText.x = 105;
  hpText.y = 170;
  container.addChild(hpText);
  const attackText = new PIXI.Text(card.outgoingAttack,costStyle);
  attackText.x = 10;
  attackText.y = 170;
  container.addChild(attackText);
  //abilityText
  const abilityStyle = new PIXI.TextStyle({
    fontSize: 9,
    wordWrap: true,
    wordWrapWidth: 95,
  });
  const abilityText = new PIXI.Text(card.outgoingText,abilityStyle);
  abilityText.x = 10;
  abilityText.y = 100;
  container.addChild(abilityText);
  container.on('pointerdown', onCardDragStart)
    .on('pointerup', onCardDragEnd)
    .on('pointerupoutside', onCardDragEnd)
    .on('pointermove', onCardDragMove);
  hand.push(container)
}
function handleNextAnimation(animations) {
  animation = animations.splice(0,1)[0]
  switch (animation.type) {
    case "drawCard":
      makeCardHand(animation.data.card)
      break
    case "updateAllyMana":
      allyStats[1].text = "Mana: "+animation.data.value
      mana = animation.data.amount
      break
    case "updateEnemyMana":
      enemyStats[1].text = "Enemy Mana: "+animation.data.value
      break
    case "updateAllyCards":
      allyStats[2].text = "Cards in Hand: "+animation.data.value
      break
    case "updateEnemyCards":
      enemyStats[2].text = "Enemy Cards in Hand: "+animation.data.value
      break
    default:
      break
  }
  if(animations.length>0){
    if(animation.time>0){
      setTimeout(handleNextAnimation,animation.time,animations)
    }else{
      handleNextAnimation(animations)
    }
  }
  if(animations.length==0){
    highlightPlayables()
  }
}
function highlightPlayables(){
  for(let i=0;i<hand.length;i++){
    if(hand[i].card.cost<=mana){
      hand[i].children[0].texture = highlightedSkin
      hand[i].interactive = true;

      // Shows hand cursor
      hand[i].buttonMode = true;
      hand[i].defaultX = hand[i].x
      hand[i].defaultY = hand[i].y
      // Pointers normalize touch and mouse
      hand[i].on('pointerdown', onCardDragStart)
        .on('pointerup', onCardDragEnd)
        .on('pointerupoutside', onCardDragEnd)
        .on('pointermove', onCardDragMove);
      function onCardDragStart(event) {
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        this.data = event.data;
        this.alpha = 0.5;
        this.dragging = true;
        this.offsetX = event.data.getLocalPosition(this.parent).x - this.x
        this.offsetY = event.data.getLocalPosition(this.parent).y - this.y
      }

      function onCardDragEnd() {
        if(!this.dragging){return}
        this.alpha = 1;
        this.dragging = false;
        // set the interaction data to null
        this.data = null;
        //detect if over slot
        let releasedX = this.x+this.offsetX
        let releasedY = this.y+this.offsetY
        if(releasedY>265 & releasedY<465){
          let slotNumber = Math.floor((releasedX - 50)/(1340/7))
          console.log(slotNumber)
          if(slotNumber >= 0 && slotNumber < 7){
            this.x = this.defaultX
            this.y = this.defaultY
            sendThroughWebSocket(JSON.stringify({type:'playCard',slotNumber,position:i}))
          }else{
            this.x = this.defaultX
            this.y = this.defaultY
          }
        }else{
          this.x = this.defaultX
          this.y = this.defaultY
        }
      }

      function onCardDragMove() {
        if (this.dragging) {
          const newPosition = this.data.getLocalPosition(this.parent);
          this.x = newPosition.x-this.offsetX;
          this.y = newPosition.y-this.offsetY;
        }
      }
    }
  }
}
function deHighlightPlayables(){
  for(let i=0;i<hand.length;i++){
    hand[i].children[0].texture = normalSkin
    hand[i].interactive = false;

    // Shows hand cursor
    hand[i].buttonMode = false;
  }
}

function onCardDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
  this.offsetX = event.data.getLocalPosition(this.parent).x - this.x
  this.offsetY = event.data.getLocalPosition(this.parent).y - this.y
}
function onCardDragEnd() {
  if(!this.dragging){return}
  this.alpha = 1;
  this.dragging = false;
  // set the interaction data to null
  this.data = null;
  //detect if over slot
  let releasedX = this.x+this.offsetX
  let releasedY = this.y+this.offsetY
  if(releasedY>265 & releasedY<465){
    let slotNumber = Math.floor((releasedX - 50)/(1340/7))
    console.log(slotNumber)
    if(slotNumber >= 0 && slotNumber < 7){
      this.x = this.defaultX
      this.y = this.defaultY
      sendThroughWebSocket(JSON.stringify({type:'playCard',slotNumber,position:i}))
    }else{
      this.x = this.defaultX
      this.y = this.defaultY
    }
  }else{
    this.x = this.defaultX
    this.y = this.defaultY
  }
}
function onCardDragMove() {
  if (this.dragging) {
    const newPosition = this.data.getLocalPosition(this.parent);
    this.x = newPosition.x-this.offsetX;
    this.y = newPosition.y-this.offsetY;
  }
}
setup()
