//TODO: Setup overlay, and connect it to keywords/dream variants

const App = new Vue({
	el: '#app',
	data: {
		allCardList: {},
		tempCard: null,
		keywordData: {},
		overlayText: '',
		allySlots: [null, null, null, null, null, null, null],
		enemySlots: [null, null, null, null, null, null, null],
		hand: [],
		JSON,
		sendThroughWebSocket,
		allyAvatarFrameState: 'normal',
		selectingTarget: false,
		enemyAvatarFrameState: 'normal',
		allyData: {
			geo: 0,
			cardsInHand: 0,
			HP: '30/30',
			maxHP: 30,
			soul: 0,
			name:''
		},
		enemyData: {
			geo: 0,
			cardsInHand: 0,
			HP: '30/30',
			maxHP: 30,
			soul: 0,
			name: ''
		},
		ID: -1,
		turn: false,
		attackOverlay: {
			displayed: false,
			x: -1,
			y: -1,
		},
		avatarFrames: [
			normalAvatarFrame,
			normalAvatarFrame
		],
		heldCard: null,
		selectedToAttack: null,
		heldCardOrigX: 0,
		heldCardOrigY: 0,
		mouseX: 0,
		mouseY: 0,
		heldCardOrigMouseX: 0,
		heldCardOrigMouseY: 0,
		interactible: true,
		gameEnded: false,
		won: false,
		defendOverlay: {
			display: false,
			ally: false,
			slotNum: -1
		},
		attackOverlay: {
			display: false,
			ally: false,
			slotNum: -1
		},
		temporaryDisplayingCard:null,
	},
	methods: {
		getAvatarFrameSprite: function (state) {
			if (state == 'normal') {
				return normalAvatarFrame
			} else if (state == 'targetable') {
				return targetableAvatarFrame
			} else if (state == 'attacked') {
				return attackedAvatarFrame
			} else if (state == 'targeted') {
				return targetedAvatarFrame
			}
		},
		calcHandX: function (i) {
			if (i == this.heldCard) {
				return (this.heldCardOrigX + this.mouseX - this.heldCardOrigMouseX) + "px"
			}
			return (50 + (i * 128)) + "px"
		},
		shouldDisplayOverlay: function (overlay, ally, slot) {
			if (overlay == "defendOverlay") {
				return this.defendOverlay.ally == ally && this.defendOverlay.slotNum == slot && this.defendOverlay.display
			} else if (overlay == "attackOverlay") {
				return this.attackOverlay.ally == ally && this.attackOverlay.slotNum == slot && this.attackOverlay.display
            }
        },
		setOverlayText: function (text) {
			this.overlayText = text
		},
		calcHandY: function (i) {
			if (i == this.heldCard) {
				return (this.heldCardOrigY + this.mouseY - this.heldCardOrigMouseY) + "px"
			}
			return "0px"
		},
		calcBoardX: function (i) {
			return (i * 189 + 189 / 2 - 128 / 2) + "px"
		},
		calcHandOpacity: function (i) {
			if (i == this.heldCard) {
				return "0.5"
			}
			return "1"
		},
		calcStyle: function (i) {
			style = { 'left': this.calcHandX(i), 'top': this.calcHandY(i), position: 'absolute' }
			if (this.hand[i].cardFrameState == 'highlighted') {
				style["cursor"] = "pointer"
			}
			return style
		},
		getCardData: function (cardName) {
			return this.allCardList[cardName]
		},
		getKeywordData: function (keywordName) {
			return this.keywordData[keywordName]
		},
		updateheldCard: function (eventData) {
			this.mouseX = eventData.clientX + eventData.path[eventData.path.length - 1].scrollX
			this.mouseY = eventData.clientY + eventData.path[eventData.path.length - 1].scrollY
		},
		setHeldCard: function (eventData, i) {
			console.log(eventData, i)
			if (this.hand[i].cardFrameState != "highlighted") {
				return
			}
			this.heldCardOrigY = -(-(this.calcHandY(i).slice(0, this.calcHandY(i).length - 2)))
			this.heldCardOrigX = -(-(this.calcHandX(i).slice(0, this.calcHandX(i).length - 2)))
			this.heldCardOrigMouseY = eventData.clientY + eventData.path[eventData.path.length - 1].scrollY
			this.heldCardOrigMouseX = eventData.clientX + eventData.path[eventData.path.length - 1].scrollX

			this.heldCard = i
		},
		handleCardPlayed: function (eventData) {
			if (null === this.heldCard) { return }
			//detect if over slot
			let releasedX = eventData.clientX + eventData.path[eventData.path.length - 1].scrollX
			let releasedY = eventData.clientY + eventData.path[eventData.path.length - 1].scrollY
			if (this.hand[this.heldCard].type == 'character') {
				if (releasedY > 261 + 67.83 & releasedY < 461 + 67.83) {
					let slotNumber = Math.floor((releasedX - 50) / (1324.53 / 7))
					if (slotNumber >= 0 && slotNumber < 7) {
						sendThroughWebSocket(JSON.stringify({ type: 'playCharacterCard', slotNumber, position: this.heldCard }))
					}
				}
			} else if (this.hand[this.heldCard].type == 'spell') {
				if (releasedX > 50 && releasedX < 50 + 1324.53 && releasedY > 61 + 67.83 & releasedY < 461 + 67.83) {
					console.log("PlayingCard")
					sendThroughWebSocket(JSON.stringify({ type: 'playSpellCard', position: this.heldCard }))
				}
			}
			this.heldCard = null
		},
		updateCardData: function (cardData) {
			for (let i = 0; i < this.allySlots.length; i++) {
				if (this.allySlots[i] != null) {
					for (const [key, value] of Object.entries(cardData.allySlots[i])) {
						Vue.set(this.allySlots[i], key, value)
					}
				}
			}
			for (let i = 0; i < this.enemySlots.length; i++) {
				if (this.enemySlots[i] != null) {
					for (const [key, value] of Object.entries(cardData.enemySlots[i])) {
						Vue.set(this.enemySlots[i], key, value)
					}
				}
			}
			for (let i = 0; i < this.hand.length; i++) {
				for (const [key, value] of Object.entries(cardData.hand[i])) {
					Vue.set(this.hand[i], key, value)
				}
			}
		},
		highlightCards: function () {
			this.deHighlightCards();
			if (this.turn) {
				for (let i = 0; i < this.allySlots.length; i++) {
					if (this.allySlots[i] != null && this.allySlots[i].canAttack) {
						this.allySlots[i].cardFrameState = 'highlighted'
					}
				}
				for (let i = 0; i < this.hand.length; i++) {
					if (this.hand[i].isCardPlayable) {
						this.hand[i].cardFrameState = 'highlighted'
					}
				}
			} else {
				for (let i = 0; i < this.enemySlots.length; i++) {
					if (this.enemySlots[i] != null && this.enemySlots[i].canAttack) {
						this.enemySlots[i].cardFrameState = 'highlighted'
					}
				}
			}
		},
		deHighlightCards: function () {
			for (let i = 0; i < this.enemySlots.length; i++) {
				if (this.enemySlots[i] != null) {
					this.enemySlots[i].cardFrameState = 'normal'
				}
			}
			for (let i = 0; i < this.allySlots.length; i++) {
				if (this.allySlots[i] != null) {
					this.allySlots[i].cardFrameState = 'normal'
				}
			}
			for (let i = 0; i < this.hand.length; i++) {
				this.hand[i].cardFrameState = 'normal'
			}
			this.enemyAvatarFrameState = 'normal'
			this.allyAvatarFrameState = 'normal'
		},
		toggleAttacking: function (pos) {
			if (this.selectedToAttack == null) {
				this.selectedToAttack = pos;
				this.highlightAttackable(this.allySlots[pos])
				this.allySlots[pos].cardFrameState = 'selected';
			} else {
				this.selectedToAttack = null;
				this.highlightCards();
			}
		},
		highlightAttackable: function (card) {
			this.deHighlightCards()
			for (let i = 0; i < this.enemySlots.length; i++) {
				if (card.ableToAttack.enemySlots.includes(i)) {
					this.enemySlots[i].cardFrameState = 'targetable'
				}
			}
			for (let i = 0; i < this.allySlots.length; i++) {
				if (card.ableToAttack.allySlots.includes(i)) {
					this.allySlots[i].cardFrameState = 'targetable'
				}
			}
			if (card.ableToAttack.enemyPlayer) {
				this.enemyAvatarFrameState = "targetable"
			}
			if (card.ableToAttack.allyPlayer) {
				this.allyAvatarFrameState = "targetable"
			}
		},
		highlightTargets: function (validTargets) {
			this.deHighlightCards()
			this.selectingTarget = true
			for (let i = 0; i < this.enemySlots.length; i++) {
				if (validTargets.enemySlots.includes(i)) {
					this.enemySlots[i].cardFrameState = 'targetable'
				}
			}
			for (let i = 0; i < this.allySlots.length; i++) {
				if (validTargets.allySlots.includes(i)) {
					this.allySlots[i].cardFrameState = 'targetable'
				}
			}
			if (validTargets.enemyPlayer) {
				this.enemyAvatarFrameState = "targetable"
			}
			if (validTargets.allyPlayer) {
				this.allyAvatarFrameState = "targetable"
			}
		},
		highlightTargetsVisual: function (targets) {
			this.deHighlightCards()
			for (let i = 0; i < this.enemySlots.length; i++) {
				if (targets.enemySlots.includes(i)) {
					this.enemySlots[i].cardFrameState = 'targeted'
				}
			}
			for (let i = 0; i < this.allySlots.length; i++) {
				if (targets.allySlots.includes(i)) {
					this.allySlots[i].cardFrameState = 'targeted'
				}
			}
			if (targets.enemyPlayer) {
				this.enemyAvatarFrameState = "targeted"
			}
			if (targets.allyPlayer) {
				this.allyAvatarFrameState = "targeted"
			}
		},
		cardSelected: function (pos,enemy) {
			if (this.selectedToAttack != null) {
				if (enemy) {
					sendThroughWebSocket(JSON.stringify({ type: 'characterAttack', initiator: this.allySlots[this.selectedToAttack], target: this.enemySlots[pos] }))
				} else {
					sendThroughWebSocket(JSON.stringify({ type: 'characterAttack', initiator: this.allySlots[this.selectedToAttack], target: this.allySlots[pos] }))
				}
				this.selectedToAttack = null
				this.deHighlightCards()
			} else if (this.selectingTarget == true) {
				sendThroughWebSocket(JSON.stringify({ type: 'targetChosen', target: { location: enemy?"enemySlots":"allySlots", pos } }))
			}
		},
		cancelCardPlayed: function () {
			sendThroughWebSocket(JSON.stringify({type: 'cancelChoose'}))
        },
		playerSelected: function (player) {
			if (this.selectedToAttack != null) {
				if ((player == this.ID && this.allyAvatarFrameState == "normal") || (player == +!this.ID && this.enemyAvatarFrameState == "normal")) {
					return
				}
				//find out player id and send through.
				sendThroughWebSocket(JSON.stringify({ type: 'playerAttack', initiator: this.allySlots[this.selectedToAttack], target: player }))
				this.selectedToAttack = null
				this.deHighlightCards()
			} else if (this.selectingTarget == true) {
				sendThroughWebSocket(JSON.stringify({ type: 'targetChosen', target: {location:"player",player} }))
            }
		},
		leaveGame: function () {
			window.location.assign("/play.html")
        }
	},
	computed: {
	},
})
if (localStorage.allCardList) {
	App.allCardList = JSON.parse(localStorage.allCardList)
}
addEventListener("scroll", App.updateheldCard);
addEventListener("mousemove", App.updateheldCard);
addEventListener("mouseup", App.handleCardPlayed)
