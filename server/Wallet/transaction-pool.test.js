const Transaction = require('./transaction')
const Wallet      = require('.')
const Blockchain  = require('../Blockchain')
const TransactionPool = require('./transaction-pool')

describe('TransactionPool', () => {

    let transactionPool, transaction, senderWallet, recepient, amount

    beforeEach(() => {
        transactionPool = new TransactionPool()
        senderWallet    = new Wallet()
        recepient       = new Wallet().publicKey
        amount          = 50
        transaction     = new Transaction({senderWallet : senderWallet, recepient, amount})

    })

    describe('setTransaction()', () => {
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction)
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction)
        })
    })

    describe('existsTransaction()', () => {
        it('returns transaction if it exists', () => {
            let transaction = transactionPool.existsTransaction({inputAddress: senderWallet.publicKey})
            let txs = Object.values(transactionPool.transactionMap)
            let tx  = txs.find(tx => tx.input.address === senderWallet.publicKey)
            expect(transaction).toBe(tx)
        })
    })
    
})