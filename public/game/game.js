
const gamearea = document.getElementById("gamearea");
let sendThroughWebSocket
let game = new PIXI.Application({
    width: 1440,
    height: 775,
    antialias: true,
    transparent: false,
    resolution: 1
});
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
gamearea.appendChild(game.view)
// TODO: reject pixi.js, return to Vue.
/*const normalSkins = { 'character': PIXI.Texture.fromImage('images/CardFrame.png'), 'spell': PIXI.Texture.fromImage('images/SpellCardFrame.png') }
const highlightedSkins = { 'character': PIXI.Texture.fromImage('images/CardFrameHighlighted.png'), 'spell': PIXI.Texture.fromImage('images/SpellCardFrameHighlighted.png') }
const dyingSkin = PIXI.Texture.fromImage('images/CardFrameDying.png')
const selectedSkin = PIXI.Texture.fromImage('images/CardFrameSelected.png')
const targetableSkin = PIXI.Texture.fromImage('images/CardFrameTargetable.png')
const normalAvatarFrame = PIXI.Texture.fromImage('images/AvatarFrame.png')
const targetableAvatarFrame = PIXI.Texture.fromImage('images/AvatarFrameTargetable.png')
const baseAvatar = PIXI.Texture.fromImage('images/BaseAvatar.png')
const attackOverlay = PIXI.Sprite.from('images/AttackOverlay.png')
const defendOverlay = PIXI.Sprite.from('images/DefendOverlay.png')
attackOverlay.anchor.set(0);
defendOverlay.anchor.set(0);
const attackedAvatarFrame = PIXI.Texture.fromImage('images/AvatarFrameAttacked.png')*/
let endTurnButton
let isOurTurn = false
let ID = -1
let enemyStats = []
let allyStats = []
let geo = 0
let gameContainer
let cardAttacking = false
function setup() {

    gameContainer = new PIXI.Container()
    game.stage.addChild(gameContainer)
    const slots = new PIXI.Graphics()
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
    for (let i = 0; i < 7; i++) {
        slots.moveTo(1340 / 7 * i + 50, 65)
        slots.lineTo(1340 / 7 * i + 50, 465)
    }
    gameContainer.addChild(slots)
    //end turn button
    endTurnButton = PIXI.Sprite.from('images/EndTurn.png');

    // Set the initial position
    endTurnButton.anchor.set(0);
    endTurnButton.x = 750;
    endTurnButton.y = 465;

    // Opt-in to interactivity
    endTurnButton.interactive = true;

    // Shows hand cursor
    endTurnButton.buttonMode = true;

    // Pointers normalize touch and mouse
    endTurnButton.on('pointerdown', endTurn);
    function endTurn() {
        sendThroughWebSocket(JSON.stringify({ type: "endTurn" }))
    }
    gameContainer.addChild(endTurnButton)

    const statsStyle = new PIXI.TextStyle({
        fontSize: 20,
        fill: [0xFFFFFF],
    });
    allyStats.push(new PIXI.Text("HP: 30/30", statsStyle))
    allyStats[0].x = 500;
    allyStats[0].y = 485;
    gameContainer.addChild(allyStats[0]);
    allyStats.push(new PIXI.Text("Geo: 1", statsStyle))
    allyStats[1].x = 888;
    allyStats[1].y = 485;
    gameContainer.addChild(allyStats[1]);
    allyStats.push(new PIXI.Text("Cards in Hand: 3", statsStyle))
    allyStats[2].x = 1024;
    allyStats[2].y = 485;
    gameContainer.addChild(allyStats[2]);
    allyStats.push(new PIXI.Sprite(normalAvatarFrame))
    allyStats[3].x = 650;
    allyStats[3].y = 465;
    gameContainer.addChild(allyStats[3]);
    allyStats[3].on('pointerdown', playerAttacked)
    let image = new PIXI.Sprite(baseAvatar)
    image.x = 4
    image.y = 4
    allyStats[3].addChild(image);



    enemyStats.push(new PIXI.Text("Enemy HP: 30/30", statsStyle))
    enemyStats[0].x = 450;
    enemyStats[0].y = 20;
    gameContainer.addChild(enemyStats[0]);
    enemyStats.push(new PIXI.Text("Enemy Geo: 1", statsStyle))
    enemyStats[1].x = 748;
    enemyStats[1].y = 20;
    gameContainer.addChild(enemyStats[1]);
    enemyStats.push(new PIXI.Text("Enemy Cards in Hand: 3", statsStyle))
    enemyStats[2].x = 944;
    enemyStats[2].y = 20;
    gameContainer.addChild(enemyStats[2]);
    enemyStats.push(new PIXI.Sprite(normalAvatarFrame))
    enemyStats[3].x = 650;
    enemyStats[3].y = 0;
    gameContainer.addChild(enemyStats[3]);
    enemyStats[3].on('pointerdown', playerAttacked)
    image = new PIXI.Sprite(baseAvatar)
    image.x = 4
    image.y = 4
    enemyStats[3].addChild(image);
}
let hand = []
let allySlots = [null, null, null, null, null, null, null]
let enemySlots = [null, null, null, null, null, null, null]
function makeCardHand(card) {
    const container = new PIXI.Container();
    container.card = card
    gameContainer.addChild(container);
    // move the sprite to the center of the screen
    container.x = hand.length * 128 + 50
    container.y = 529
    //cardski
    let frame

    const costStyle = new PIXI.TextStyle({
        fontSize: 13,
    });
    if (card.type == 'character') {
        frame = new PIXI.Sprite(normalSkins['character'])
        frame.anchor.set(0)

        container.addChild(frame)
        //hp and atk
        const hpText = new PIXI.Text(card.outgoingHP, costStyle);
        hpText.x = 105;
        hpText.y = 170;
        container.addChild(hpText);
        const attackText = new PIXI.Text(card.outgoingAttack, costStyle);
        attackText.x = 10;
        attackText.y = 170;
        container.addChild(attackText);
    } else {
        frame = new PIXI.Sprite(normalSkins['spell'])
        frame.anchor.set(0)

        container.addChild(frame)
        //hp and atk
        const soulText = new PIXI.Text(card.soulCost, costStyle);
        soulText.x = 105;
        soulText.y = 143;
        container.addChild(soulText);
    }
    //abilityText
    const abilityStyle = new PIXI.TextStyle({
        fontSize: 9,
        wordWrap: true,
        wordWrapWidth: 95,
    });
    const abilityText = new PIXI.Text(card.outgoingText, abilityStyle);
    abilityText.x = 10;
    abilityText.y = 100;
    //cost and name
    const costText = new PIXI.Text(card.cost, costStyle);
    costText.x = 105;
    costText.y = 7;
    container.addChild(costText);
    const nameStyle = new PIXI.TextStyle({
        fontSize: 12,
    });
    const nameText = new PIXI.Text(card.name, nameStyle);
    nameText.x = 10;
    nameText.y = 7;
    container.addChild(nameText);
    container.addChild(abilityText);
    container.on('pointerdown', onCardDragStart)
        .on('pointerup', onCardDragEnd)
        .on('pointerupoutside', onCardDragEnd)
        .on('pointermove', onCardDragMove)
    hand.push(container)
    container.handPos = hand.length - 1
}
function makeCardSlot(ally, card, slotPos) {
    const container = new PIXI.Container();
    container.card = card
    gameContainer.addChild(container);
    // move the sprite to the center of the screen
    container.x = slotPos * 1340 / 7 + 80
    container.y = ally ? 270 : 70
    //cardskin
    const frame = new PIXI.Sprite(normalSkins['character'])
    frame.anchor.set(0)

    container.addChild(frame)
    //cost and name
    const costStyle = new PIXI.TextStyle({
        fontSize: 13,
    });
    const costText = new PIXI.Text(card.cost, costStyle);
    costText.x = 105;
    costText.y = 7;
    container.addChild(costText);
    const nameStyle = new PIXI.TextStyle({
        fontSize: 12,
    });
    const nameText = new PIXI.Text(card.name, nameStyle);
    nameText.x = 10;
    nameText.y = 7;
    container.addChild(nameText);
    //hp and atk
    const hpText = new PIXI.Text(card.outgoingHP, costStyle);
    hpText.x = 105;
    hpText.y = 170;
    container.addChild(hpText);
    const attackText = new PIXI.Text(card.outgoingAttack, costStyle);
    attackText.x = 10;
    attackText.y = 170;
    container.addChild(attackText);
    //abilityText
    const abilityStyle = new PIXI.TextStyle({
        fontSize: 9,
        wordWrap: true,
        wordWrapWidth: 95,
    });
    const abilityText = new PIXI.Text(card.outgoingText, abilityStyle);
    abilityText.x = 10;
    abilityText.y = 100;
    container.addChild(abilityText);
    if (ally) {
        container.on('pointerdown', cardToggleAttacking)
            .on('pointerdown', characterAttacked)
        allySlots[slotPos] = container
    } else {
        container.on('pointerdown', characterAttacked)
        enemySlots[slotPos] = container
    }
    container.slotPos = slotPos
}
function highlightCards() {
    for (let i = 0; i < hand.length; i++) {
        if (hand[i].card.cost <= geo) {
            if (hand[i].card.type == 'character') {
                hand[i].children[0].texture = highlightedSkins['character']
            } else if (hand[i].card.type == 'Spell') {
                hand[i].children[0].texture = highlightedSkins['spell']
            }
            hand[i].interactive = true;

            // Shows hand cursor
            hand[i].buttonMode = true;
            hand[i].defaultX = hand[i].x
            hand[i].defaultY = hand[i].y
        }
    }
    for (let i = 0; i < allySlots.length; i++) {
        if (allySlots[i] == null) {
            continue
        }
        if (allySlots[i].card.canAttack && (!allySlots[i].card.summoningSick || allySlots[i].card.outgoingKeywords.includes("Charge"))) {
            allySlots[i].children[0].texture = highlightedSkins['character']
            allySlots[i].interactive = true;
            allySlots[i].buttonMode = true;
        }
    }
}
function deHighlightCards() {
    for (let i = 0; i < hand.length; i++) {
        if (hand[i].card.type == 'character') {
            hand[i].children[0].texture = normalSkins['character']
        } else if (hand[i].card.type == 'Spell') {
            hand[i].children[0].texture = normalSkins['spell']
        }
        hand[i].interactive = false;
        hand[i].buttonMode = false;
    }
    for (let i = 0; i < allySlots.length; i++) {
        if (allySlots[i] == null) {
            continue
        }
        allySlots[i].children[0].texture = normalSkins['character']
        allySlots[i].interactive = false;
        allySlots[i].buttonMode = false;
    }
    for (let i = 0; i < enemySlots.length; i++) {
        if (enemySlots[i] == null) {
            continue
        }
        enemySlots[i].children[0].texture = normalSkins['character']
        enemySlots[i].interactive = false;
        enemySlots[i].buttonMode = false;
    }
    allyStats[3].texture = normalAvatarFrame
    allyStats[3].buttonMode = false
    allyStats[3].interactive = false
    enemyStats[3].texture = normalAvatarFrame
    enemyStats[3].buttonMode = false
    enemyStats[3].interactive = false
}
function updateCardData(data) {
    console.log(data)
    for (let i = 0; i < allySlots.length; i++) {
        if (allySlots[i] != null) {
            allySlots[i].card = data.allySlots[i]
        }
    }
    for (let i = 0; i < enemySlots.length; i++) {
        if (enemySlots[i] != null) {
            enemySlots[i].card = data.enemySlots[i]
        }
    }
    for (let i = 0; i < hand.length; i++) {
        hand[i].card = data.hand[i]
    }
}

//dragging functions
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
    if (!this.dragging) { return }
    this.alpha = 1;
    this.dragging = false;
    // set the interaction data to null
    this.data = null;
    //detect if over slot
    let releasedX = this.x + this.offsetX
    let releasedY = this.y + this.offsetY
    if (releasedY > 265 & releasedY < 465) {
        if (this.card.type == 'character') {
            let slotNumber = Math.floor((releasedX - 50) / (1340 / 7))
            if (slotNumber >= 0 && slotNumber < 7) {
                sendThroughWebSocket(JSON.stringify({ type: 'playCard', slotNumber, position: this.handPos }))
            }
        } else {

        }
    } else {
    }
    this.x = this.defaultX
    this.y = this.defaultY
}
function onCardDragMove() {
    if (this.dragging) {
        const newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x - this.offsetX;
        this.y = newPosition.y - this.offsetY;
    }
}
// attack functions
function cardToggleAttacking() {
    console.log("Toggling")
    if (!this.selected) {
        if (cardAttacking != false) {
            return
        }
        deHighlightCards()
        this.selected = true
        cardAttacking = this
        highlightAttackable(this.card)
        this.children[0].texture = selectedSkin
        this.interactive = true;
        this.buttonMode = true;
    } else {
        this.selected = false
        cardAttacking = false;
        deHighlightCards()
        highlightCards()
    }
}
function highlightAttackable(card) {
    for (let i = 0; i < enemySlots.length; i++) {
        if (card.ableToAttack.enemySlots.includes(i)) {
            enemySlots[i].children[0].texture = targetableSkin
            enemySlots[i].interactive = true;
            enemySlots[i].buttonMode = true;
        }
    }
    if (card.ableToAttack.enemyPlayer) {
        enemyStats[3].texture = targetableAvatarFrame
        enemyStats[3].interactive = true;
        enemyStats[3].buttonMode = true;
    }
    if (card.ableToAttack.allyPlayer) {
        allyStats[3].texture = targetableAvatarFrame
        allyStats[3].interactive = true;
        allyStats[3].buttonMode = true;
    }
}
function characterAttacked() {
    if (this == cardAttacking || cardAttacking == false) {
        return
    }
    sendThroughWebSocket(JSON.stringify({ type: 'characterAttack', initiator: cardAttacking.card, target: this.card }))
    cardAttacking = false
    deHighlightCards()
}
function playerAttacked() {
    if (cardAttacking == false) {
        return
    }
    console.log(this.y)
    //find out player id and send through.
    sendThroughWebSocket(JSON.stringify({ type: 'playerAttack', initiator: cardAttacking.card, target: this.y != 0 ? ID : +!ID }))
    cardAttacking = false
    deHighlightCards()
}
setup()
