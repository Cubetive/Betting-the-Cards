/**
How do we want to give cards effects beyond keywords / stats?
Option A:
Create a bunch of dummy functions that they can override and get called.
Option B:
Do the same thing but with listeners instead - when a card has a magic effect it listenes for a triggerMagic event and does it's fancy stuff.
Option B is both more elegant in code and more versatile for cards having multiple dust/magic and so on effects.
Swap to option b.

Auras will also be moved to event handlers because their design is currently horrifying.
Should emitting events be required to be passed through eventListeners?
No.

Three tiers of event listeners: Game, Player, Card.
All cards must lodge a Game, AllyPlayer, and Self event listener. Card/EnemyPlayer ones are optional because of the fact that they have to be constantly updated.
All cards emit major events through Game and AllyPlayer.
Some cards will also listen for Self events.
Basically, the Card class is just a dummy and emits all its events through its listeners.
This both allows other cards to listen in for interesting events and for the actual Card to take it's events from the Card class.
This prevents ugly dummy function code.

Silencing a card should be as simple as removing all Self listeners. However, this has to distingush between loren's and normal dust effects.
Potentially cards could have a public and private listener Hub, and emit events through both?
That would probably work.

Ok, auras.
Adding game.UpdateAuraEffects() everywhere is both dumb and buggy. Solutions:
1)
put updateAuraEffects in the listener handlers.
Cons: Both high maintence and prone to causing bugs.
2)
Listen for events that are handled and when an event is handled update auraeffects.
Pros: not buggy
Cons: inelegant, provides a lot of useless updates considering the rarity of auras vs the commonness of events.
3)
All card that give auras attatch listeners to anything the aura affects / is affected by, then uses these to determine when to update auras.
Pros: more elegant, removes useless updates, can update auras for one card only as needed.
Cons: Requires more work for each aura card individually. Adding auras as listeners can make them update incorretly between events.

Consider: When a monster is summoned draw cards equal to it's HP, NCG, and Aura: ally monsters have +1/+1.
We would ideally want the aura to go first, and then drawcards/NCG depending on what was played first.
If we wanted to use 3 with this, we would have to create priority channels entirely for low impact listeners. 
This complicates playing a monster to something like:
SetupSummon -> Summon -> PlayEffects
However, we would probably already have to do that to setup monster effects.
I'm going to tentatively go with 3.

To allow listeners to remove themself, the listner is passed in as a seconday argument to all events. feel free to ignore it.
 **/
const Listener = require('./Listener.js').Listener
/*Event format:
 * Data for the event is stored in eventData.data
 * Type of event is stored in eventData.eventType (0,1,2)
 * Name of event is stored in eventData.name
 **/
class ListenerEmitter {
    constructor(game){
        this.listeners = []
        this.pastEvents = []
        this.game = game
    }
    //Hey, this just happened. Who cares about that?
    emitPassiveEvent(eventData,eventName) {
        let data = {
            data:eventData,
            name: eventName,
            eventType:0
        }
        for (let i = 0; i < this.listeners.length; i++) {
            this.game.addToStack(() => { return this.listeners[i].handleEvent(data) })
        }
    }
    //Hey everyone, do you have any data of this type for me, and if so what?
    emitDataRequestEvent(eventData,eventName) {
        dataResults = []
        let data = {
            data: eventData,
            name: eventName,
            eventType: 1
        }
        for (let i = 0; i < this.listeners.length; i++) {
            result = this.listeners[i].handleEvent(data)
            if (result != null) {
                data.push(null)
            }
        }
        return data;
    }
    //Hey, I have this variable here. Who wants to change it?
    emitModifiableEvent(eventData,eventName,modifiable) {
        let data = {
            data: eventData,
            name: eventName,
            eventType: 2,
            modifiable
        }
        for (let i = 0; i < this.listeners.length; i++) {
            let result = this.listeners[i].handleEvent(data)
            if (result != null) {
                data.modifiable = result
            }
        }
        return data.modifiable
    }
    registerListener(listener){
        this.listeners.push(listener)
    }
    removeListener(listenerToRemove){
        for(let i=0;i<this.listeners.length;i++){
            if(this.listeners[i]==listenerToRemove){
                this.listeners.splice(i, 1)
                return
            }
        }
    }
}
module.exports = { ListenerEmitter}
/*
 * comprehensive guide of all event listners in game. If you want to add a new one, log it here.
 * allyToAttack: 
 *      Emitter:
 *          Player emitter
 *      Trigger Condition: 
 *          triggers when an ally monster is about to attack.
 *      Type: 
 *          passiveEvent
 * allyAttacked:
 *      Emitter:
 *          Player emitter
 *      Trigger Condition:
 *          triggers after an ally attacks.
 *      Type:
 *          passiveEvent
 * allyDied:
 *      Emitter:
 *          Player emitter
 *      Trigger Condition:
 *          an ally monster died.
 *      Type:
 *          passiveEvent
 * triggerPlayEffects:
 *      Emitter:
 *          Card emitter
 *      Trigger Condition:
 *          An monster should trigger play effects now.
 *      Type:
 *          passiveEvent
 * triggerDieEffects:
 *      Emitter:
 *          Card emitter
 *      Trigger Condition:
 *          An monster should trigger die effects now.
 *      Type:
 *          passiveEvent
 * triggerGameStartEffects:
 *      Emitter:
 *          Card emitter
 *      Trigger Condition:
 *          A card should trigger game start effects now.
 *      Type:
 *          passiveEvent
 * triggerTurnEndEffects:
 *      Emitter:
 *          Card emitter
 *      Trigger Condition:
 *          A cardr should trigger play effects now.
 *      Type:
 *          passiveEvent
 * modifyCardPlayable:
 *      Emitter:
 *          Card/Game emitter
 *      Trigger Condition:
 *          A card wants to check for updates to if it is playable
 *      Type:
 *          dataModifiableEvent
 * modifyCardGeoCost:
 *      Emitter:
 *          Card/Game emitter
 *      Trigger Condition:
 *          A card wants to check for updates to it's geo cost
 *      Type:
 *          dataModifiableEvent
 * modifyCardSoulCost:
 *      Emitter:
 *          Card/Game emitter
 *      Trigger Condition:
 *          A card wants to check for updates to it's soul cost
 *      Type:
 *          dataModifiableEvent
 * modifyCardHP:
 *      Emitter:
 *          Card/Game emitter
 *      Trigger Condition:
 *          A card wants to check for updates to it's hp
 *      Type:
 *          dataModifiableEvent
 * modifyCardAttack:
 *      Emitter:
 *          Card/Game emitter
 *      Trigger Condition:
 *          A card wants to check for updates to it's attack
 *      Type:
 *          dataModifiableEvent
 * modifyCardKeywords:
 *      Emitter:
 *          Card/Game emitter
 *      Trigger Condition:
 *          A card wants to check for updates to it's keywords
 *      Type:
 *          dataModifiableEvent
 */