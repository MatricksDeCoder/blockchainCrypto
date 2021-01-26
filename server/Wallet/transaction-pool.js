const Transaction = require('./transaction')
const Wallet      = require('.')
const Blockchain  = require('../Blockchain')

class TransactionPool {

    constructor() {
        this.transactionMap = {}
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction
    }

    existsTransaction({inputAddress}) {
        let txns = Object.values(this.transactionMap)
        return txns.find(tx => tx.input.address === inputAddress)
    }
}

module.exports = TransactionPool