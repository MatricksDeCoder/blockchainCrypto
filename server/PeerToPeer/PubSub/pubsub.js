const redis = require('redis')

// channels
const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
}

/*
pubsub model has less overhead, you dont need to know address of other receivers
, if message sender you send messages to channel, if receiver you subscribe to a channel
*/

class PubSub {

    constructor({blockchain, transactionPool}) {
        // 
        this.blockchain = blockchain
        this.transactionPool = transactionPool
        // can be publisher or subscriber
        this.publisher = redis.createClient()
        this.subscriber = redis.createClient()

        this.subscribeToChannels()

        //this.subscriber.subscribe(CHANNELS.TEST)
        //this.subscriber.subscribe(CHANNELS.BLOCKCHAIN)
        //this.subscriber.subscribe(CHANNELS.TRANSACTION)
        // configure subscriber to recieve messages
        this.subscriber.on('message', (channel, message) => {
            this.handleMessage(channel, message)
        })
    }

    handleMessage(channel, message) {
        // adjust to have blockchain messages/chain handled 
        console.log(`Message received: ${message } on channel ${channel}`)
        const parsed = JSON.parse(message)

        switch(channel) {
            case CHANNELS.BLOCKCHAIN :
                this.blockchain.replaceChain(parsed, () => {
                    this.transactionPool.clearBlockchainTransactions({chain: parsedMessage})
                })
                break
            case CHANNELS.TRANSACTION :
                this.transactionPool.setTransaction(parsed)
                break
            default:
                return
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

    broadCastTransaction(transaction) {
        this.publish({channel: CHANNELS.TRANSACTION, message: JSON.stringify(transaction)})
    }
}

module.exports = PubSub
