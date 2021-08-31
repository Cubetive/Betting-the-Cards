const Listener = require('./Listener.js').Listener
class ListenerReceiver {
    constructor() {
      //Handlers must be named.
      this.eventHandlers = {}
    }
    addEventHandler(name, func, isProperEvent, emitter,skipStack=false) {
        this.eventHandlers[name] = new Listener(func, isProperEvent,skipStack)
        emitter.registerListener(this.eventHandlers[name])
        return this.eventHandlers[name]
    }
    static genEventFunction(name) {
        return (val) => {return val.name == name }
    }
}
module.exports = {ListenerReceiver}
