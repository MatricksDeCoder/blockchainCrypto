const uuid = require('uuid/v1')
const {verifySignature} = require('../CryptographyUtils')

class Transaction {

    constructor({
        senderWallet,
        recepient,
        amount
    }) {

        this.id = uuid()
        this.outputMap = {
            [senderWallet.publicKey] : senderWallet.balance-amount,
            'recepient' : amount
        }
        this.input  = {
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

}

module.exports = Transaction