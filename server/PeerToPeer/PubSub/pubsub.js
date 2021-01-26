const redis = require('redis')

// channels
const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
}

/*
pubsub model has less overhead, you dont need to know address of other receivers
, if message sender you send messages to channel, if receiver you subscribe to a channel
*/

class PubSub {

    constructor({blockchain}) {
        // 
        this.blockchain = blockchain
        // can be publisher or subscriber
        this.publisher = redis.createClient()
        this.subscriber = redis.createClient()

        this.subscribeToChannels()

        this.subscriber.subscribe(CHANNELS.TEST)
        this.subscriber.subscribe(CHANNELS.BLOCKCHAIN)
        // configure subscriber to recieve messages
        this.subscriber.on('message', (channel, message) => {
            this.handleMessage(channel, message)
        })
    }

    handleMessage(channel, message) {
        // adjust to have blockchain messages/chain handled 
        console.log(`Message received: ${message } on channel ${channel}`)
        const parsed = JSON.parse(message)
        if(channel == CHANNELS.BLOCKCHAIN) {
            this.blockchain.replaceChain(parsed)
        }
    }

    subscribeToChannels() {
        Object.values(CHANNELS).map(channel => this.subscriber.subscribe(channel))
    }

    // send message to designated channel
    publish({channel, message}) {
        this.publisher.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.publisher.subscribe(channel)
            })
        })
        
    }

    broadcastChain() {
        this.publish({channel: CHANNELS.BLOCKCHAIN, message: JSON.stringify(this.blockchain.chain)})
    }

}

module.exports = PubSub
