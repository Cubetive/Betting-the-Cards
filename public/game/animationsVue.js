function handleNextAnimation(animations, cardData) {
    let animation = animations.splice(0, 1)[0]
    let data = animation.data
    switch (animation.type) {
        //updates
        case "updateAllyGeo":
            App.allyData.geo = data.value
            break
        case "updateEnemyGeo":
            App.enemyData.geo = data.value
            break
        case "updateAllySoul":
            App.allyData.soul = data.value
            break
        case "updateEnemySoul":
            App.enemyData.soul = data.value
            break
        case "updateAllyCards":
            App.allyData.cardsInHand = data.value
            break
        case "updateEnemyCards":
            App.enemyData.cardsInHand = data.value
            break
        case "updateAllyName":
            App.allyData.name = data.value
            break
        case "updateEnemyName":
            App.enemyData.name = data.value
            break
        case "updateAllyHealth":
            App.allyData.HP = data.value
            break
        case "updateEnemyHealth":
            App.enemyData.HP = data.value
            break
        case "updateBoardCardData":
            if (data.ally) {
                card = App.allySlots[data.slot];
                for (const [key, value] of Object.entries(data.value)) {
                    Vue.set(card, key, value)
                }
            } else {
                card = App.enemySlots[data.slot];
                for (const [key, value] of Object.entries(data.value)) {
                    Vue.set(card, key, value)
                }
            }
            break
        case "updateHandCardData":
            card = App.hand[data.pos];
            for (const [key, value] of Object.entries(data.value)) {
                Vue.set(card, key, value)
            }
            break
        case "setID":
            App.ID = data.id
            break
        case "beginTurn":
            App.turn = true
            break
        case "endTurn":
            App.turn = false
            break
        //onesided
        case "addCardHand":
            App.hand.push(data.card)
            Vue.set(App.hand[App.hand.length - 1], 'cardFrameState', 'normal')
            break
        case "addCardHandPos":
            App.hand.splice(data.pos,0,[data.card])
            Vue.set(App.hand[data.pos], 'cardFrameState', 'normal')
            break
        case "removeCardHand":
            App.hand.splice(data.cardPos, 1)
            break
        case "wait":
            break
        //attacking
        case "displayAttackOverlay":
            App.attackOverlay.ally = data.ally
            App.attackOverlay.slotNum = data.slot
            App.attackOverlay.display = true
            break
        case "hideAttackOverlay":
            App.attackOverlay.display = false
            break
        case "displayDefendOverlay":
            App.defendOverlay.ally = data.ally
            App.defendOverlay.slotNum = data.slot
            App.defendOverlay.display = true
            break
        case "hideDefendOverlay":
            App.defendOverlay.display = false
            break
        case "displayAvatarAttacked":
            if (data.ally) {
                App.allyAvatarFrameState = "attacked"
            } else {
                App.enemyAvatarFrameState = "attacked"
            }
            break
        case "hideAvatarAttacked":
            if (data.ally) {
                App.allyAvatarFrameState = "normal"
            } else {
                App.enemyAvatarFrameState = "normal"
            }
            break
        //boardRelated
        case "summonCharacter":
            if (data.card.team == App.ID) {
                Vue.set(App.allySlots, data.slot, data.card)
                Vue.set(App.allySlots[data.slot], 'cardFrameState', 'normal')
            } else {
                Vue.set(App.enemySlots, data.slot, data.card)
                Vue.set(App.enemySlots[data.slot], 'cardFrameState', 'normal')
            }
            break
        case "awaitDeath":
            if (data.ally) {
                App.allySlots[data.slot].cardFrameState = 'dying'
                animations = [{ type: "disappear", time: 0, data }].concat(animations)
            } else {
                App.enemySlots[data.slot].cardFrameState = 'dying'
                animations = [{ type: "disappear", time: 0, data }].concat(animations)
            }
            break
        case "multiAwaitDeath":
            for (let i = 0; i < data.slotList.length;i++) {
                if (data.allyList[i]) {
                    App.allySlots[data.slotList[i]].cardFrameState = 'dying'
                    animations = [{ type: "disappear", time: 0, data: {ally: data.allyList[i], slot: data.slotList[i]} }].concat(animations)
                } else {
                    App.enemySlots[data.slotList[i]].cardFrameState = 'dying'
                    animations = [{ type: "disappear", time: 0, data:{ ally: data.allyList[i], slot: data.slotList[i] }}].concat(animations)
                }
            }
            break
        case "disappear":
            if (data.ally) {
                Vue.set(App.allySlots,data.slot, null)
            } else {
                Vue.set(App.enemySlots, data.slot, null)
            }
            break
        //spells
        case "triggerEffect":
            if (data.card._zone != "board") {
                data.card.cardFrameState = "selected"
                Vue.set(App, 'temporaryDisplayingCard', data.card)
                animations = [{ type: "clearEffectTrigger", time: 0, data: {} }].concat(animations)
            } else {
                if (data.card.team == App.ID) {
                    App.allySlots[data.card.slot].cardFrameState = "selected"
                    Vue.set(App.allySlots[data.card.slot], 'emittingAction', true)
                    animations = [{ type: "clearEffectTriggerBoard", time: 0, data: { ally: true, slot: data.card.slot } }].concat(animations)
                } else {
                    App.enemySlots[data.card.slot].cardFrameState = "selected"
                    Vue.set(App.enemySlots[data.card.slot], 'emittingAction', true)
                    animations = [{ type: "clearEffectTriggerBoard", time: 0, data: { ally: false, slot: data.card.slot } }].concat(animations)
                }
            }
            break
        case "clearEffectTrigger":
            App.temporaryDisplayingCard = null
            App.deHighlightCards()
            break
        //cards
        case "clearEffectTriggerBoard":
            if (data.ally) {
                App.allySlots[data.slot].cardFrameState = "normal"
                Vue.set(App.allySlots[data.slot], 'emittingAction', false)
            } else {
                App.enemySlots[data.slot].cardFrameState = "normal"
                Vue.set(App.enemySlots[data.slot], 'emittingAction', false)
            }
            break
        case "burnCard":
            data.card.cardFrameState = "dying"
            Vue.set(App, 'temporaryDisplayingCard', data.card)
            break
        case "clearBurntCard":
            App.temporaryDisplayingCard = null
            App.deHighlightCards()
            break
        case "clearTargetSelection":
            App.temporaryDisplayingCard = null
            App.selectingTarget = false
            break
        case "getTargetCancellable":
            data.card.cardFrameState = "selected"
            Vue.set(App, 'temporaryDisplayingCard', data.card)
            App.highlightTargets(data.validTargets)
            break
        case "getTargetNotCancellable":
            App.highlightTargets(data.validTargets)
            break
        case "showTargeted":
            App.highlightTargetsVisual(data.targets)
            break
        //winning or losing
        case "lose":
            App.gameEnded = true
            App.won = false
            clearInterval(pingInterval)
            break
        case "win":
            App.gameEnded = true
            App.won = true
            clearInterval(pingInterval)
            break
        //verificationResult
        case "verificationResult":
            if (data.successful == false) {
                localStorage.loginID = 'loggedOut'
                localStorage.username = 'loggedOut'
                location.assign('login.html')
            }
            break
        case "gameFound":
            if (data.successful == false) {
                alert("There is currently no active game for you.")
                location.assign("/play.html")
            }
            break;
        //cardData
        case "allCardList":
            localStorage.allCardList = JSON.stringify(data.allCardList)
            App.allCardList = data.allCardList
            App.keywordData = data.keywordData
            break
        default:
            console.log("Unused animation: " + JSON.stringify(animation))
            break
    }
    //mandatory code practice states that most code should have comments. I don't often remember, but I did here as evidenced by this comment. Hope this helps.
    if (animations.length > 0) {
        if (animation.time > 0) {
            setTimeout(handleNextAnimation, animation.time, animations, cardData)
        } else {
            handleNextAnimation(animations, cardData)
        }
    } else if (cardData != undefined) {
        App.updateCardData(cardData)
    }
    if (animations.length == 0&&!App.selectingTarget) {
        App.highlightCards()
    }
}
