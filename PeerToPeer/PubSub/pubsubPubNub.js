const PubNub      = require('pubnub')

require('dotenv').config();

const credentials = {
    publishKey: process.env.PUB_NUB_PUBLISH_KEY,
    subscriberKey: process.env.PUB_NUB_SUBSCRIBER_KEY,
    secretKey: process.env.PUB_NUB_SECRET
}

// channels
const CHANNELS = {
    TEST: 'TEST'
}


class PubSub {
    constructor() {
        this.pubnub = new PubNub(credentials)
        this.pubnub.subscribe({channels: [CHANNELS.TEST]})
        this.pubnub.addListener(this.listener)
    }

    listener() {
        return ({
            message: messageObject => {
                const {channel, message} = messageObject
                console.log(`Message received: ${message } on channel ${channel}`)
            }

        })
    }

    publish({channel, message}) {
        this.pubnub.publish({channel, message})
    }
    
}

const testPubSub = new PubSub()
testPubSub.publish({channel: CHANNELS.TEST, message: 'Message PubNub pubsub alternative to redis'})

module.exports = PubSub
