function handleNextAnimation(animations,cardData) {
  let animation = animations.splice(0,1)[0]
  let data = animation.data
  const gameEndStyle = new PIXI.TextStyle({
    fontSize: 50,
    fill:[0xFFFFFF],
  });
  switch (animation.type) {
    case "beginTurn":
      isOurTurn = true
      break
    case "endTurn":
      isOurTurn = false
      break
    case "drawCard":
      makeCardHand(data.card)
      break
    case "updateAllyMana":
      allyStats[1].text = "Mana: "+data.value
      mana = data.amount
      break
    case "updateEnemyMana":
      enemyStats[1].text = "Enemy Mana: "+data.value
      break
    case "updateAllyCards":
      allyStats[2].text = "Cards in Hand: "+data.value
      break
    case "updateEnemyCards":
      enemyStats[2].text = "Enemy Cards in Hand: "+data.value
      break
    case "updateAllyHealth":
      allyStats[0].text = "HP: "+data.value
      break
    case "updateEnemyHealth":
      enemyStats[0].text = "Enemy HP: "+data.value
      break
    case "setID":
      ID = data.id
      break
    case "cardStatChange":
      if(data.ally){
        allySlots[data.pos].children[3].text = data.hp
        allySlots[data.pos].children[4].text = data.attack
      }else{
        enemySlots[data.pos].children[3].text = data.hp
        enemySlots[data.pos].children[4].text = data.attack
      }
      break
    case "playCard":
      allySlots[data.slot] = hand.splice(data.handPos,1)[0]
      allySlots[data.slot].x = 80+data.slot*1340/7
      allySlots[data.slot].y = 270
      allySlots[data.slot].removeAllListeners()
      allySlots[data.slot].on('pointerdown', cardToggleAttacking)
                          .on('pointerdown', characterAttacked);
      for(let i=data.handPos;i<hand.length;i++){
        hand[i].x = i*128+50
        hand[i].handPos = i
      }
      break
    case "enemySummonCard":
      makeCardSlot(false,data.card,data.slotNum)
      break
    case "awaitDeath":
      if(data.ally){
        allySlots[data.slot].children[0].texture = dyingSkin
      }else{
        enemySlots[data.slot].children[0].texture = dyingSkin
      }
      break
    case "die":
      if(data.ally){
        gameContainer.removeChild(allySlots[data.slot])
        allySlots[data.slot] = null
      }else{
        gameContainer.removeChild(enemySlots[data.slot])
        enemySlots[data.slot] = null
      }
      break
    case "lose":
      game.stage.removeChild(gameContainer)
      let loseText = new PIXI.Text("YOU LOSE",gameEndStyle)
      loseText.x = 60;
      loseText.y = 300;
      game.stage.addChild(loseText);
      break
    case "win":
      game.stage.removeChild(gameContainer)
      let winText = new PIXI.Text("YOU WIN",gameEndStyle)
      winText.x = 60;
      winText.y = 300;
      game.stage.addChild(winText);
      break
    default:
      break
  }
  //mandatory code practice states that most code should have comments. I don't often remember, but I did here as evidenced by this comment. Hope this helps.
  if(animations.length>0){
    if(animation.time>0){
      setTimeout(handleNextAnimation,animation.time,animations,cardData)
    }else{
      handleNextAnimation(animations,cardData)
    }
  }
  if(animations.length==0){
    updateCardData(cardData)
  }
  if(animations.length==0 && isOurTurn){
    highlightCards()
  }
}
