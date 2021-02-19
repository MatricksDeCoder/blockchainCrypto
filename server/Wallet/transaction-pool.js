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

    setMap(newTxMap) {
        this.tranactionMap = newTxMap
    }

    existsTransaction({inputAddress}) {
        let txns = Object.values(this.transactionMap)
        return txns.find(tx => tx.input.address === inputAddress)
    }

    validTransactions() {
        return Object.values(this.transactionMap).filter(tx => Transaction.validTransaction(tx))
    }

    clear() {
        this.transactionMap = {}
    }

    clearBlockchainTransactions({ chain }) {
        // clear transactions from pool if only already included in the blockchain
        for (let i=1; i<chain.length; i++) {
          const block = chain[i];
    
          for (let tx of block.data) {
            if (this.transactionMap[tx.id]) {
              delete this.transactionMap[tx.id];
            }
          }
        }
      }

}

module.exports = TransactionPool