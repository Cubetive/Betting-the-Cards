class Listener {
    constructor(func,isProperEvent) {
        //Handlers must be named.
        this.func = func
        this.isProperEvent = isProperEvent
    }
    handleEvent(eventData) {
        if (!this.isProperEvent(eventData)) {
            return null;
        }
        return this.func(eventData)
    }
}
module.exports = { Listener }
