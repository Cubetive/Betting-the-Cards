function handleNextAnimation(animations,cardData) {
  let animation = animations.splice(0,1)[0]
  let data = animation.data
  const gameEndStyle = new PIXI.TextStyle({
    fontSize: 50,
    fill:[0xFFFFFF],
  });
  switch (animation.type) {
    //updates
    case "updateAllyGeo":
      allyStats[1].text = "Geo: "+data.value
      geo = data.value
      break
    case "updateEnemyGeo":
      enemyStats[1].text = "Enemy Geo: "+data.value
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
    console.log(data)
      if(data.ally){
        allySlots[data.pos].children[3].text = data.hp
        allySlots[data.pos].children[4].text = data.attack
      }else{
        enemySlots[data.pos].children[3].text = data.hp
        enemySlots[data.pos].children[4].text = data.attack
      }
      break
    case "beginTurn":
      isOurTurn = true
      break
    case "endTurn":
      isOurTurn = false
      break
    //onesided
    case "addCardHand":
      makeCardHand(data.card)
      break
    case "removeCardHand":
      gameContainer.removeChild(hand[data.handPos])
      hand.splice(data.handPos,1)
      for(let i=data.handPos;i<hand.length;i++){
        hand[i].x = i*128+50
        hand[i].handPos = i
      }
      break
    //attacking
    case "displayAttackOverlay":
      gameContainer.addChild(attackOverlay)
      if(data.ally){
        attackOverlay.x = allySlots[data.slot].x
        attackOverlay.y = allySlots[data.slot].y
      }else{
        attackOverlay.x = enemySlots[data.slot].x
        attackOverlay.y = enemySlots[data.slot].y
      }
      break
    case "hideAttackOverlay":
      gameContainer.removeChild(attackOverlay)
      break
    case "displayDefendOverlay":
      gameContainer.addChild(defendOverlay)
      if(data.ally){
        defendOverlay.x = allySlots[data.slot].x
        defendOverlay.y = allySlots[data.slot].y
      }else{
        defendOverlay.x = enemySlots[data.slot].x
        defendOverlay.y = enemySlots[data.slot].y
      }
      break
    case "hideDefendOverlay":
      gameContainer.removeChild(defendOverlay)
      break
    case "displayAvatarAttacked":
      if(data.ally){
        allyStats[3].texture = attackedAvatarFrame
      }else{
        enemyStats[3].texture = attackedAvatarFrame
      }
      break
    case "hideAvatarAttacked":
      if(data.ally){
        allyStats[3].texture = normalAvatarFrame
      }else{
        enemyStats[3].texture = normalAvatarFrame
      }
      break
    //boardRelated
    case "summonCharacter":
      makeCardSlot(true,data.card,data.slot)
      /*
      allySlots[data.slot] = hand.splice(data.handPos,1)[0]
      allySlots[data.slot].x = 80+data.slot*1340/7
      allySlots[data.slot].y = 270
      allySlots[data.slot].removeAllListeners()
      allySlots[data.slot].on('pointerdown', cardToggleAttacking)
                          .on('pointerdown', characterAttacked);*/
      break
    case "enemySummonCharacter":
      makeCardSlot(false,data.card,data.slot)
      break
    case "awaitDeath":
      if(data.ally){
        allySlots[data.slot].children[0].texture = dyingSkin
      }else{
        enemySlots[data.slot].children[0].texture = dyingSkin
      }
      break
    case "disappear":
      if(data.ally){
        gameContainer.removeChild(allySlots[data.slot])
        allySlots[data.slot] = null
      }else{
        gameContainer.removeChild(enemySlots[data.slot])
        enemySlots[data.slot] = null
      }
      break
    //winning or losing
    case "lose":
      game.stage.removeChild(gameContainer)
      let loseText = new PIXI.Text("YOU LOSE",gameEndStyle)
      loseText.x = 60;
      loseText.y = 300;
      game.stage.addChild(loseText)
      gameEnded = true
      clearInterval(pingInterval)
      break
    case "win":
      game.stage.removeChild(gameContainer)
      let winText = new PIXI.Text("YOU WIN",gameEndStyle)
      winText.x = 60;
      winText.y = 300;
      game.stage.addChild(winText)
      gameEnded = true
      clearInterval(pingInterval)
      break
    //verificationResult
    case "verificationResult":
      localStorage.loginID == 'loggedOut'
      localStorage.username == 'loggedOut'
      location.assign('login.html')
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
  console.log(isOurTurn)
  if(animations.length==0 && isOurTurn){
    highlightCards()
  }
}
