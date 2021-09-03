const ListenerReceiver = require('../classes/ListenerReceiver.js').ListenerReceiver
const ListenerEmitter = require('../classes/ListenerEmitter.js').ListenerEmitter
const Listener = require('../classes/Listener.js').Listener

//DO NOT USE ARROW FUNCTIONS
const cardList = {

    "Focus": {
        geoCost: 4,
        soulCost: 0,
        type: "spell",
        baseText: [{ type: "plainText", value: "Deal 3 dmg to a monster. Gain 4 soul." }],
        imageLink: "",
        rarity: 0,
        factions: [2, 2],
        requiresTarget: true,
        //targetFunc returns a list of all valid board targets (slots, players).
        //If your card should interact with stuff in hand / discover things, use the look at template instead.
        getValidTargets: function () {
            allySlots = []
            enemySlots = []
            for (let i = 0; i < this.game.players[this.team].slots.length; i++) {
                if (this.game.players[this.team].slots[i] != null) {
                    allySlots.push(i)
                }
            }
            for (let i = 0; i < this.game.players[+!this.team].slots.length; i++) {
                if (this.game.players[+!this.team].slots[i] != null) {
                    enemySlots.push(i)
                }
            }
            validTargets = {
                allySlots,
                enemySlots,
                allyPlayer: false,
                enemyPlayer: false
            }
            return validTargets
        },
        setTarget: function (target) {
            this.target = target
        },
        calcTargets: function (target) {
            highlightedTargets = {
                allyPlayer: false,
                enemyPlayer: false,
                allySlots: [],
                enemySlots: []
            }
            if (target.webSocket != null) {
                if (target.id == this.team) {
                    //allyPlayer 
                    highlightedTargets.allyPlayer = true
                } else if (target.id == +!this.team) {
                    //enemyPlayer
                    highlightedTargets.enemyPlayer = true
                }
            } else {
                if (target.team == this.team) {
                    highlightedTargets.allySlots.push(target.slot)
                } else if (target.team == +!this.team) {
                    highlightedTargets.enemySlots.push(target.slot)
                }
            }
            return highlightedTargets
        },
        triggerEffect: function (target) {
            this.game.players[this.team].soul += 4;
            target.takeDamage(this, 3)
        },
    },
    // Demo card:
    // All values of a card get copied onto the Card class that uses it.
    "Demo Card": {
        //How much HP does the card have?
        origHP: 5,
        //How much Attack?
        origAttack: 5,
        //What keywords?
        baseKeywords: [],
        //How much soul does it cost?
        soulCost: 7,
        //How much does it cost?
        geoCost: 5,
        //Is it a character or a spell?
        type: "character",
        //What is its text?
        //baseText is an array of text components.
        //These are type baseText for displaying text normally, and type cardName for text that should show a card on hover.
        baseText: [{ type: "plainText", value: "This text will show " },
        { type: "cardName", name: "Demo Card", value: "Demo Card" },
        { type: "plainText", value: " when you hover over it." }],
        //Where is the image for this card found?
        imageLink: "",
        //What rarity is this card? -1 means token so it can't be added to decks.
        rarity: -1,
        //What are the factions of this card?
        //0 = faction0, 1 = faction1, 2 = either
        factions: [2, 2],
        //And now, the most important part of any card: The body of it.
        //Anything your card does will be setup using this function, even if the main code is done elsewhere.
        //This is where your card should register any listeners it needs: onMagic, onMonsterDie, literally everything.
        performSetup: function () {

            this.listenerReceiver.addEventHandler(
                //the name of your event handler.
                //eventhandler name
                //All event handlers have unique names, so I recommened a format of CardName EffectDesc to keep them unique
                "DemoCardTriggerPlay",
                //this.play is a dummy function defined later to keep performSetup from being cluttered. 
                //This says to run it when our event is triggered
                //this normally refers to the listener calling it. By wrapping it in an arrow function we can use this to refer to the card.
                () => { this.play },
                //a function that determines if the event is relevant.
                //Here we aren't doing anything fancy so we can just use the inbuilt function to generate it.
                ListenerReceiver.genEventFunction("triggerPlayEvents"),
                //And finally, where should we listen for this?
                //Here we just want to listen to our own emitter.
                this.listenerEmitter
            )
            //The end result of that is to attatch a listener so that when this cards ListenerEmitter emits a "triggerPlayEvents",
            //we call this.play
        },
        play: function () {
            //multiply geo by 4.
            this.game.players[this.team].geo *= 4;
        }
    },
    "trolling...": {
        geoCost: 0,
        soulCost: 0,
        type: "spell",
        baseText: [{ type: "plainText", value: "Game start: draw this. When played: Set your geo and soul to 1000. Add " },
        { type: "cardName", name: "Vengeful Spirit", value: "Vengeful Spirit" },
        { type: "plainText", value: " to your hand." },
        ],
        imageLink: "",
        rarity: 0,
        factions: [2, 2],
        requiresTarget: false,
        triggerEffect: function () {
            this.game.players[this.team].geo = 1000
            this.game.players[this.team].soul = 1000
            this.game.players[this.team].conjureNewCard("Vengeful Spirit")
        },
        onCardCreation: function () {
            //if we've been drawn already, skip.
             this.listenerReceiver.addEventHandler(
                "TrollingGameStart",
                () => {
                    if (this.zone != "deck") {
                        return
                    }
                    //remove ourselves from deck and add to the top
                    this.game.players[this.team].deck.splice(this.game.players[this.team].deck.indexOf(this), 1)
                    this.game.players[this.team].deck.splice(0, 0, this)
                    //draw a card.
                    this.game.players[this.team].draw(1)
                },
                ListenerReceiver.genEventFunction("triggerGameStartEffects"),
                this.game.listenerEmitter
            )
        },
        calcTargets: () => { return null },
    },
    "False knight": {
        origHP: 5,
        origAttack: 5,
        baseKeywords: [],
        geoCost: 5,
        type: "character",
        baseText: [{ type: "plainText", value: "Play: Multiply your geo by 4." }],
        imageLink: "",
        rarity: 3,
        performSetup: function () {
            this.listenerReceiver.addEventHandler(
                "FalseKnightTriggerPlay",
                () => { this.play() },
                ListenerReceiver.genEventFunction("triggerPlayEvents"),
                this.listenerEmitter
            )
        },
        play: function () {
            this.game.players[this.team].geo *= 4;
            //this.game.disconnect(this.team);
        },
        factions: [2, 2],
    },
    "Nop dyne": {
        origHP: 3,
        origAttack: 5,
        baseKeywords: ["Charge"],
        geoCost: 5,
        type: "character",
        baseText: [{ type: "plainText", value: "Charge. Turn end: if this is in your deck and you have enough geo, spend 5 to summon this from your deck." }],
        imageLink: "",
        rarity: 3,
        factions: [2, 2],
        playFromDeckListener:null,
        onCardCreation: function () {
            this.playFromDeckListener = this.listenerReceiver.addEventHandler(
                "NopDynePlayFromDeck",
                () => {
                    if (this.zone != "deck") {
                        return
                    }
                    let emptySlot = false
                    for (let i = 0; i < this.player.slots.length; i++) {
                        if (this.player.slots[i] == null) {
                            emptySlot = true
                            break
                        }
                    }
                    if (this.player.geo >= 5 && emptySlot) {
                        this.player.addDualAnimation("triggerEffect", { card: this.getSendableCopy() }, 700)
                        this.player.summonCharacter(this)
                        this.player.deck.splice(this.player.deck.indexOf(this), 1)
                        this.player.geo -= 5
                        this.playFromDeckListener = null
                    }
                },
                ListenerReceiver.genEventFunction("triggerTurnEndEvents"),
                this.player.listenerEmitter
            )
        },
    },
    "Vengeful Spirit": {
        geoCost: 0,
        soulCost: 3,
        type: "spell",
        baseText: [{ type: "plainText", value: "Draw a card. Gain 1 geo. Add Vengeful Spirit to your hand." }],
        imageLink: "",
        rarity: 0,
        factions: [2, 2],
        requiresTarget: false,
        triggerEffect: function () {
            this.game.players[this.team].geo += 1
            this.game.players[this.team].draw(1)
            this.game.players[this.team].conjureNewCard("Vengeful Spirit")
        },
        calcTargets: () => { return null },
    },
    "Failed Champion": {
        origHP: 6,
        origAttack: 6,
        baseKeywords: [],
        geoCost: 7,
        type: "character",
        baseText: [{ type: "plainText", value: "Double damage to players. After this attacks a monster deal 6 dmg to adjacent monsters." }],
        imageLink: "",
        rarity: -2,
        factions: [2, 2],
    },
    "Dream Nail": {
        origHP: 3,
        origAttack: 3,
        baseKeywords: [],
        geoCost: 3,
        type: "character",
        //this effect is just to test how the stack works - if it works correctly.
        baseText: [{ type: "plainText", value: "Die: draw a card if there are other ally monsters." }],
        imageLink: "",
        rarity: 0,
        performSetup: function () {
            this.listenerReceiver.addEventHandler(
                "DreamNailTriggerDie",
                () => { this.onDie() },
                ListenerReceiver.genEventFunction("triggerDieEvents"),
                this.listenerEmitter
            )
        },
        onDie: function () {
            for (let i = 0; i < this.player.slots.length; i++) {
                if (this.player.slots[i] != null) {
                    this.player.addDualAnimation("triggerEffect", { card: this.getSendableCopy() }, 700)
                    this.player.draw(1)
                    return
                }
            }
        },
        factions: [2, 2],
    },
    "BOOM BOOM": {
        geoCost: 4,
        soulCost: 4,
        type: "spell",
        baseText: [{ type: "plainText", value: "Deal 3 damage to each character." }],
        imageLink: "",
        rarity: 0,
        factions: [2, 2],
        requiresTarget: false,
        triggerEffect: function () {
            for (let i = 0; i < 7; i++) {
                if (this.player.slots[i] != null) {
                    this.player.slots[i].takeDamage(this, 3)
                }
                if (this.enemyPlayer.slots[i] != null) {
                    this.enemyPlayer.slots[i].takeDamage(this, 3)
                }
            }
        },
        calcTargets: function () {
            let highlightedTargets = {
                allyPlayer: false,
                enemyPlayer: false,
                allySlots: [],
                enemySlots: []
            }
            for (let i = 0; i < 7; i++) {
                if (this.player.slots[i] != null) {
                    highlightedTargets.allySlots.push(i)
                }
                if (this.enemyPlayer.slots[i] != null) {
                    highlightedTargets.enemySlots.push(i)
                }
            }
            return highlightedTargets
        },
    },
    "Soul Master": {
        origHP: 5,
        origAttack: 4,
        baseKeywords: [],
        geoCost: 5,
        type: "character",
        baseText: [{ type: "plainText", value: "After this takes damage, gain dodge(1)." }],
        imageLink: "",
        rarity: 3,
        factions: [2, 2],
    },
    "Soul Tyrant": {
        origHP: 6,
        origAttack: 6,
        baseKeywords: [],
        geoCost: 8,
        type: "character",
        baseText: [{ type: "plainText", value: "After this takes damage, gain dodge(2)." }],
        imageLink: "",
        rarity: -2,
        factions: [2, 2],
    },
    "Grub Father": {
        origHP: 5,
        origAttack: 5,
        baseKeywords: [],
        geoCost: 13,
        type: "character",
        baseText: [{ type: "plainText", value: "Other ally monsters have +1/+1 and Charge." }],
        imageLink: "",
        rarity: 1,
        factions: [2, 2],
        modifyCardAttackListener: null,
        modifyCardHPListener: null,
        modifyCardKeywordListener: null,
        removeAuraListener:null,
        performSetup: function () {

            this.modifyCardHPListener = this.listenerReceiver.addEventHandler(
                "GrubFatherHPListener",
                (event) => {
                    if (event.data.card.team == this.team && event.data.card.zone == "board"&&event.data.card!=this) {
                        return event.modifiable + 1
                    }
                    return null
                },
                ListenerReceiver.genEventFunction("modifyCardHP"),
                this.game.listenerEmitter
            )
            this.modifyCardAttackListener = this.listenerReceiver.addEventHandler(
                "GrubFatherAttackListener",
                (event) => {
                    if (event.data.card.team == this.team && event.data.card.zone == "board" && event.data.card != this) {
                        return event.modifiable + 1
                    }
                    return null
                },
                ListenerReceiver.genEventFunction("modifyCardAttack"),
                this.game.listenerEmitter
            )
            this.modifyCardKeywordListener = this.listenerReceiver.addEventHandler(
                "GrubFatherKeywordListener",
                (event) => {
                    if (event.data.card.team == this.team && event.data.card.zone == "board" && event.data.card != this) {
                        return event.modifiable.concat(["Charge"])
                    }
                    return null
                },
                ListenerReceiver.genEventFunction("modifyCardKeywords"),
                this.game.listenerEmitter
            )
            this.removeAuraListener = this.listenerReceiver.addEventHandler(
                "GrubFatherRemoveAuras",
                () => {
                    if (data.newZone != "board") { 
                        this.game.listenerEmitter.removeListener(this.removeAuraListener)
                        this.game.listenerEmitter.removeListener(this.modifyCardAttackListener)
                        this.game.listenerEmitter.removeListener(this.modifyCardHPListener)
                        this.game.listenerEmitter.removeListener(this.modifyCardKeywordListener)
                        this.modifyCardKeywordListener = null
                        this.modifyCardHPListener = null
                        this.modifyCardAttackListener = null
                        this.removeAuraListener = null
                    }
                },
                ListenerReceiver.genEventFunction("cardZoneChange"),
                this.listenerEmitter,
                true
            )
        },
    },
    "Grub": {
        origHP: 3,
        origAttack: 3,
        baseKeywords: ['Haste'],
        geoCost: 5,
        type: "character",
        baseText: [{ type: "plainText", value: "Haste. Play: Draw a card." }],
        imageLink: "",
        rarity: -1,
        factions: [2, 2],
    },
    "Loan shark": {
        origHP: 4,
        origAttack: 4,
        baseKeywords: [],
        geoCost: 5,
        type: "character",
        baseText: [{ type: "plainText", value: "Play: the next card you play costs twice as much. You can go into debt to play it." }],
        imageLink: "",
        rarity: 0,
        factions: [2, 2],
        performSetup: function () {
            this.listenerReceiver.addEventHandler(
                "LoanSharkTriggerPlay",
                (event) => { this.play() },
                ListenerReceiver.genEventFunction("triggerPlayEvents"),
                this.listenerEmitter
            )
        },
        modifyCardPlayableListener: null,
        modifyCardGeoCostListener: null,
        modifyCardSoulCostListener: null,
        cardPlayedListener: null,
        play: function () {
            this.modifyCardPlayableListener = this.listenerReceiver.addEventHandler(
                "LoanSharkModifyCardPlayable",
                (event) => {
                    if (event.data.card.team == this.team) {
                        return true
                    }
                    return null
                },
                ListenerReceiver.genEventFunction("modifyCardPlayable"),
                this.game.listenerEmitter
            )
            this.modifyCardGeoCostListener = this.listenerReceiver.addEventHandler(
                "LoanSharkModifyCardGeo",
                (event) => {
                    if (event.data.card.team == this.team) {
                        return event.modifiable * 2
                    }
                    return null
                },
                ListenerReceiver.genEventFunction("modifyCardGeoCost"),
                this.game.listenerEmitter
            )
            this.modifyCardSoulCostListener = this.listenerReceiver.addEventHandler(
                "LoanSharkModifyCardSoul",
                (event) => {
                    if (event.data.card.team == this.team) {
                        return event.modifiable * 2
                    }
                    return null
                },
                ListenerReceiver.genEventFunction("modifyCardSoulCost"),
                this.game.listenerEmitter
            )
            this.cardPlayedListener = this.listenerReceiver.addEventHandler(
                "LoanSharkCardPlayed",
                (event) => {
                    if (event.data.card == this) {
                        return
                    }
                    this.player.listenerEmitter.removeListener(this.cardPlayedListener)
                    this.game.listenerEmitter.removeListener(this.modifyCardSoulCostListener)
                    this.game.listenerEmitter.removeListener(this.modifyCardPlayableListener)
                    this.game.listenerEmitter.removeListener(this.modifyCardGeoCostListener)
                    this.modifyCardSoulCostListener = null
                    this.modifyCardGeoCostListener = null
                    this.modifyCardPlayableListener = null
                    this.cardPlayedListener = null
                },
                ListenerReceiver.genEventFunction("allyCardPlayed"),
                this.player.listenerEmitter
            )
        },
    },
    "Seer": {
        origHP: 4,
        origAttack: 5,
        baseKeywords: [],
        geoCost: 5,
        type: "character",
        baseText: [{ type: "plainText", value: "Play: Kill a character" },],
        imageLink: "",
        rarity: 3,
        factions: [2, 2],
        requiresTarget: true,
        //targetFunc returns a list of all valid board targets (slots, players).
        //If your card should interact with stuff in hand / discover things, use the look at template instead.
        getValidTargets: function () {
            allySlots = []
            enemySlots = []
            for (let i = 0; i < this.game.players[this.team].slots.length; i++) {
                if (this.game.players[this.team].slots[i] != null) {
                    allySlots.push(i)
                }
            }
            for (let i = 0; i < this.game.players[+!this.team].slots.length; i++) {
                if (this.game.players[+!this.team].slots[i] != null) {
                    enemySlots.push(i)
                }
            }
            validTargets = {
                allySlots,
                enemySlots,
                allyPlayer: false,
                enemyPlayer: false
            }
            return validTargets
        },
        setTarget: function (target) {
            this.target = target
        },
        performSetup: function () {
            this.listenerReceiver.addEventHandler(
                "SeerTriggerPlay",
                (event) => {this.play(event.data.target) },
                ListenerReceiver.genEventFunction("triggerPlayEvents"),
                this.listenerEmitter
            )
        },
        play: function (target) {
            if (target != null) {
                this.player.addAnimation("showTargeted", {targets: this.calcTargets(target)}, 0)
                this.player.addEnemyAnimation("showTargeted", { targets: this.player.flipTargets(this.calcTargets(target)) }, 0)
                this.player.addAnimation("triggerEffect", { card: this.getSendableCopy() }, 700)
                this.player.addEnemyAnimation("triggerEffect", { card: this.getSendableCopy() }, 700)
                target.die()
            }
        },
        calcTargets: function (target) {
            return {
                allyPlayer: false, enemyPlayer: false,
                allySlots: target.team == this.team ? [target.slot] : [],
                enemySlots: target.team != this.team ? [target.slot] : [],
            }
        }
    },
    "A. Dream Nail": {
        origHP: 5,
        origAttack: 4,
        baseKeywords: [],
        geoCost: 5,
        type: "character",
        baseText: [{ type: "plainText", value: "Play: transform a monster in your hand into it's awakened dream variant, or if it has none it's dream variant." }],
        imageLink: "",
        rarity: -1,
        factions: [2, 2],
    },
    "Flukemarm": {
        origHP: 7,
        origAttack: 0,
        baseKeywords: [],
        geoCost: 5,
        type: "character",
        baseText: [{ type: "plainText", value: "Turn start: summon two " },
        { type: "cardName", value: "Flukelings", name: "Flukeling" },
        { type: "plainText", value: ". Ally " },
        { type: "cardName", value: "Flukelings", name: "Flukeling" },
        { type: "plainText", value: " have +1/+1." }],
        imageLink: "",
        rarity: 2,
        factions: [2, 2],
    },
    "Flukeling": {
        origHP: 1,
        origAttack: 1,
        baseKeywords: ["Haste"],
        geoCost: 1,
        type: "character",
        baseText: [{ type: "plainText", value: "Haste." }],
        imageLink: "",
        rarity: -1,
        factions: [2, 2],
    },
    "garbage": {
        origHP: 1,
        origAttack:0,
        baseKeywords: [],
        geoCost: 5,
        type: "character",
        baseText: [],
        imageLink: "",
        rarity: -1,
        factions: [2, 2],
    },
    "Slash": {
        geoCost: 4,
        soulCost: 4,
        type: "spell",
        baseText: [{ type: "plainText", value: "Deal 3 dmg to a monster twice." }],
        imageLink: "",
        rarity: 0,
        factions: [2, 2],
        requiresTarget: true,
        //targetFunc returns a list of all valid board targets (slots, players).
        //If your card should interact with stuff in hand / discover things, use the look at template instead.
        getValidTargets: function () {
            allySlots = []
            enemySlots = []
            for (let i = 0; i < this.game.players[this.team].slots.length; i++) {
                if (this.game.players[this.team].slots[i] != null) {
                    allySlots.push(i)
                }
            }
            for (let i = 0; i < this.game.players[+!this.team].slots.length; i++) {
                if (this.game.players[+!this.team].slots[i] != null) {
                    enemySlots.push(i)
                }
            }
            validTargets = {
                allySlots,
                enemySlots,
                allyPlayer: false,
                enemyPlayer: false
            }
            return validTargets
        },
        setTarget: function (target) {
            this.target = target
        },
        calcTargets: function (target) {
            highlightedTargets = {
                allyPlayer: false,
                enemyPlayer: false,
                allySlots: [],
                enemySlots: []
            }
            if (target.webSocket != null) {
                if (target.id == this.team) {
                    //allyPlayer 
                    highlightedTargets.allyPlayer = true
                } else if (target.id == +!this.team) {
                    //enemyPlayer
                    highlightedTargets.enemyPlayer = true
                }
            } else {
                if (target.team == this.team) {
                    highlightedTargets.allySlots.push(target.slot)
                } else if (target.team == +!this.team) {
                    highlightedTargets.enemySlots.push(target.slot)
                }
            }
            return highlightedTargets
        },
        triggerEffect: function (target) {
            target.takeDamage(this, 3)
            this.player.waitForTargetNotCancellable(
                () => { return this.getValidTargets() }, (target) => {

                    let spellTargets = this.calcTargets(target)
                    this.player.addAnimation("showTargeted", { targets: spellTargets }, 0)
                    this.player.addEnemyAnimation("showTargeted", { targets: this.player.flipTargets(spellTargets) }, 0)
                    this.player.addAnimation("triggerEffect", { card: this.getSendableCopy() }, 700)
                    this.player.addEnemyAnimation("triggerEffect", { card: this.getSendableCopy() }, 700)
                    target.takeDamage(this, 3)

                })
            return true
        },
    },
    "Furious Vengefly": {
        origHP: 4,
        origAttack: 4,
        baseKeywords: ["Haste"],
        geoCost: 6,
        type: "character",
        baseText: [{ type: "plainText", value: "Haste. Die: Deal one damage to each enemy monster." }],
        imageLink: "",
        rarity: 0,
        factions: [0, 2],
    },
    "Hollow Knight": {
        origHP: 6,
        origAttack: 6,
        baseKeywords: [],
        geoCost: 8,
        type: "character",
        baseText: [{ type: "plainText", value: "Play: Deal 1 damage to a random enemy monster for each dead ally monster." }],
        imageLink: "",
        rarity: 3,
        factions: [0, 2],
    },
    "Broken Vessel": {
        origHP: 5,
        origAttack: 6,
        baseKeywords: [],
        geoCost: 7,
        type: "character",
        baseText: [{ type: "plainText", value: "Magic: If the enemy player has more than one mask, deal one damage to them" }],
        imageLink: "",
        rarity: 3,
        factions: [0, 2],
    },
    "Radiance": {
        origHP: 5,
        origAttack: 6,
        baseKeywords: [],
        geoCost: 7,
        type: "character",
        baseText: [{ type: "plainText", value: "Everything else takes double damage. Play: silence and kill all other monsters. Turn start: deal 1 dmg to each other monster." }],
        imageLink: "",
        rarity: -3,
        factions: [0, 2],
    },
    "Lost Kin": {
        origHP: 6,
        origAttack: 6,
        baseKeywords: [],
        geoCost: 9,
        type: "character",
        baseText: [{ type: "plainText", value: "Magic and Die: If the enemy player has more than one mask, deal one damage to them" }],
        imageLink: "",
        rarity: -2,
        factions: [0, 2],
    },
    "Infected Fly": {
        origHP: 1,
        origAttack: 1,
        baseKeywords: [],
        geoCost: 5,
        type: "character",
        baseText: [{ type: "plainText", value: "Haste. Play: Summon the most expensive dead ally monster and give it haste. Die: kill it." }],
        imageLink: "",
        rarity: 1,
        factions: [0, 2],
    },
    "Cowardly Husk": {
        origHP: 3,
        origAttack: 3,
        baseKeywords: [],
        geoCost: 3,
        type: "character",
        baseText: [{ type: "plainText", value: "Transparency" }],
        imageLink: "",
        rarity: 0,
        factions: [0, 2],
    },
    "Mantis Lords": {
        origHP: 5,
        origAttack: 5,
        baseKeywords: [],
        geoCost: 10,
        type: "character",
        baseText: [{ type: "plainText", value: "Die: summon two silenced " }, { type: "cardName", value: "Mantis Lords", name: "Mantis Lords" }, { type: "plainText", value: "." }],
        imageLink: "",
        rarity: 3,
        factions: [2, 0],
    },
    "Mantis Child": {
        origHP: 3,
        origAttack: 5,
        baseKeywords: [],
        geoCost: 4,
        type: "character",
        baseText: [{ type: "plainText", value: "Haste." }],
        imageLink: "",
        rarity: 0,
        factions: [2, 0],
    },
    "Mantis Claw": {
        geoCost: 2,
        soulCost: 4,
        type: "Spell",
        baseText: [{ type: "plainText", value: "Give a monster Taunt and +2/+2." }],
        imageLink: "",
        rarity: 0,
        factions: [2, 0],
    },
    "Traitor Lord": {
        origHP: 7,
        origAttack: 5,
        baseKeywords: ['Haste'],
        geoCost: 8,
        type: "character",
        baseText: [{ type: "plainText", value: "Haste. Double damage to players." }],
        imageLink: "",
        rarity: 3,
        factions: [0, 0],
    },
    "Mantis Elder": {
        origHP: 2,
        origAttack: 0,
        baseKeywords: ['Taunt'],
        geoCost: 5,
        type: "character",
        baseText: [{ type: "plainText", value: "Taunt. Can't attack. After this takes damage from a monster, kill it." }],
        imageLink: "",
        rarity: 1,
        factions: [2, 0],
    },
    "Godseeker": {
        origHP: 3,
        origAttack: 2,
        baseKeywords: [],
        geoCost: 6,
        type: "character",
        baseText: [{ type: "plainText", value: "Play: Look at all monsters in your hand and choose one to summon." }],//NO
        imageLink: "",
        rarity: 2,
        factions: [2, 1],
    },
    "Godhome": {
        geoCost: 7,
        type: "Permanent",
        baseText: [{ type: "plainText", value: "Permanent: For the rest of the game ally monsters have +1/+1" }],
        imageLink: "",
        rarity: -2,
        factions: [2, 1],
    },
    "Audience member": {
        origHP: 4,
        origAttack: 4,
        baseKeywords: [],
        geoCost: 4,
        type: "character",
        baseText: [{ type: "plainText", value: "Play: give an ally monster +1/+1" }],
        imageLink: "",
        rarity: 0,
        factions: [2, 1],
    },
    "Hall of gods": {
        geoCost: 8,
        type: "Permanent",
        baseText: [{ type: "plainText", value: "Permanent: Turn start. Summon a random dead ally monster costing 2 or less" }],
        imageLink: "",
        rarity: 2,
        factions: [2, 1],
    },
    "Scorn": {
        geoCost: 3,
        soulCost: 7,
        type: "Spell",
        baseText: [{ type: "plainText", value: "Give a monster -3/-3" }],
        imageLink: "",
        rarity: 0,
        factions: [2, 1],
    },
    "Sitting Godseeker": {
        origHP: 4,
        origAttack: 4,
        baseKeywords: [],
        geoCost: 5,
        type: "character",
        baseText: [{ type: "plainText", value: "Divinity." }],
        imageLink: "",
        rarity: 0,
        factions: [2, 1],
    },
    "Dung Defender": {
        origHP: 6,
        origAttack: 5,
        baseKeywords: [],
        geoCost: 7,
        type: "character",
        baseText: [{ type: "plainText", value: "Turn end: deal 2 dmg to a random enemy monster." }],
        imageLink: "",
        rarity: 3,
        factions: [1, 2],
    },
    "White Defender": {
        origHP: 7,
        origAttack: 6,
        baseKeywords: [],
        geoCost: 8,
        type: "character",
        baseText: [{ type: "plainText", value: "Turn end: deal 2 dmg to two random enemy monsters." }],
        imageLink: "",
        rarity: -2,
        factions: [1, 2],
    },
    "Elderbug": {
        origHP: 5,
        origAttack: 4,
        baseKeywords: [],
        geoCost: 6,
        type: "character",
        baseText: [{ type: "plainText", value: "Play: give all ally monsters +1/+1." }],
        imageLink: "",
        rarity: 2,
        factions: [1, 2],
    },
    "Hornet": {
        origHP: 7,
        origAttack: 5,
        baseKeywords: [],
        geoCost: 10,
        type: "character",
        baseText: [{ type: "plainText", value: "Turn end: Attack a random enemy monster. If this card survives, fully heal it." }],
        imageLink: "",
        rarity: 3,
        factions: [1, 2],
    },
    "Zote": {
        origHP: 1,
        origAttack: 1,
        baseKeywords: [],
        geoCost: 1,
        type: "character",
        baseText: [{ type: "plainText", value: "This card appears as though it had +5/+5." }],
        imageLink: "",
        rarity: 3,
        factions: [1, 2],
    },
    "Grey Prince Zote": {
        origHP: 5,
        origAttack: 4,
        baseKeywords: ["Taunt"],
        geoCost: 6,
        type: "character",
        baseText: [{ type: "plainText", value: "Taunt. Whenever this takes damage summon a random card with zote in the name" }],
        imageLink: "",
        rarity: -2,
        factions: [1, 2],
    },
    "Explosive Zoteling": {
        origHP: 3,
        origAttack: 3,
        baseKeywords: [],
        geoCost: 3,
        type: "character",
        baseText: [{ type: "plainText", value: "After this is summoned immediately deal 3 dmg to each monster." }],
        imageLink: "",
        rarity: -1,
        factions: [1, 2],
    },
    "Flying Zoteling": {
        origHP: 2,
        origAttack: 2,
        baseKeywords: ["Haste"],
        geoCost: 2,
        type: "character",
        baseText: [{ type: "plainText", value: "Haste. Dust: Deal one damage to all ally monsters." }],
        imageLink: "",
        rarity: -1,
        factions: [1, 2],
    },
    "Fat Zoteling": {
        origHP: 5,
        origAttack: 3,
        baseKeywords: [],
        geoCost: 3,
        type: "character",
        baseText: [{ type: "plainText", value: "Turn start: Deal two dmg to each other monster. When this card is summoned burn a random card in each player's hand." }],
        imageLink: "",
        rarity: -1,
        factions: [1, 2],
    },
    "Kingsmould": {
        origHP: 6,
        origAttack: 6,
        baseKeywords: [],
        geoCost: 7,
        type: "character",
        baseText: [{ type: "plainText", value: "Play: Reduce the geoCost of the most expensive card in your hand by 2." }],
        imageLink: "",
        rarity: 2,
        factions: [1, 2],
    },
    "The White Palace": {
        type: "Permanent",
        baseText: [{ type: "plainText", value: "Turn end: Deal 1 damage to each character. If this has killed 7 or more characters, add " },
        { type: "cardName", value: "The Pale King", name: "The Pale King" }, { type: "plainText", value: " to your hand and remove this effect." }],
        imageLink: "",
        geoCost: 10,
        rarity: -3,
        factions: [1, 2],
    },
    "The Pale King": {
        origHP: 7,
        origAttack: 9,
        baseKeywords: [],
        geoCost: 10,
        type: "character",
        baseText: [{ type: "plainText", value: "Play: Add 5 random different bug or neutral characters (except " }, { type: "cardName", value: "Kingsmould", name: "Kingsmould" }, { type: "plainText", value: ") to your deck then draw three cards. Your hand and deck geoCost 0." }],
        imageLink: "",
        rarity: -1,
        factions: [1, 2],
    },
}
module.exports = { cardList: cardList }
