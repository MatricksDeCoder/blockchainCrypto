const uuid = require('uuid/v1')
const {verifySignature} = require('../CryptographyUtils')
const {MINING_REWARD, REWARD_INPUT} = require('../../config')

class Transaction {

    constructor({
        senderWallet,
        recepient,
        amount,
        outputMap,
        input
    }) {

        this.id = uuid()
        this.outputMap = outputMap || {
            [senderWallet.publicKey] : senderWallet.balance-amount,
            [recepient] : amount
        }
        this.input  = input || {
            'amount' : senderWallet.balance,
            'timestamp' : Date.now(),
            'address': senderWallet.publicKey,
            'signature': senderWallet.sign(this.outputMap)
        }

    }

    static validTransaction(transaction) {
        const {input, outputMap} = transaction
        const {amount, address, signature} = input
        // some of outputs must be equal to the input for transacted values 
        const totals = Object.values(outputMap).reduce((sum, val) => sum+val, 0)
        if(amount !== totals) {
            console.error('Amounts in amount do not add up to input')
            return false
        }
        if(! verifySignature({publicKey: address, data: outputMap, signature})) {
            console.error('Invalid signature')
            return false
        }

        return true

    }

    update({senderWallet, recepient, amount}) {

        if(amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Insufficient balance!')
        }

        this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount

        if(!this.outputMap[recepient]) {          
            this.outputMap[recepient] = amount
        } else {
            this.outputMap[recepient] = this.outputMap[recepient] + amount
        }        

        this.input.amount = senderWallet.balance
        this.input.timestamp = Date.now()
        this.input.address = senderWallet.publicKey
        this.input.signature = senderWallet.sign(this.outputMap)

    }

    static rewardTransaction({minerWallet}) {
        return new this({input: REWARD_INPUT, outputMap: {[minerWallet.publicKey]:MINING_REWARD}})

    }
  

}

module.exports = Transaction