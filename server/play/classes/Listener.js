class Listener {
    constructor(func,isProperEvent,skipStack) {
        //Handlers must be named.
        this.func = func
        this.isProperEvent = isProperEvent
        this.skipStack = skipStack
    }
    handleEvent(eventData) {
        if (!this.isProperEvent(eventData)) {
            return null;
        }
        return this.func(eventData)
    }
}
module.exports = { Listener }
