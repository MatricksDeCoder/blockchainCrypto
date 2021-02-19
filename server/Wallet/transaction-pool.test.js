const Transaction = require('./transaction')
const Wallet      = require('.')
const Blockchain  = require('../Blockchain')
const TransactionPool = require('./transaction-pool')
const { validTransaction } = require('./transaction')

describe('TransactionPool', () => {

    let transactionPool, transaction, senderWallet, recepient, amount

    beforeEach(() => {
        transactionPool = new TransactionPool()
        senderWallet    = new Wallet()
        recepient       = new Wallet().publicKey
        amount          = 50
        transaction     = new Transaction({senderWallet, recepient, amount})

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

    describe('validTransactions()', () => {
        let validTransactions, errorMock

        beforeEach(() => {
            validTransactions = []
            errorMock = jest.fn()
            global.console.error = errorMock
            for(let i=0; i<10; i++) {
                
                transaction = new Transaction({senderWallet, recepient, amount})
                if(i%3 === 0) {
                    transaction.input.amount = 999999
                } else if(i%3 === 1) {
                    transaction.input.signature = new Wallet().sign('fake')
                } else {
                    validTransactions.push(transaction)
                }
                transactionPool.setTransaction(transaction)
            }
        })

        it('returns returns valid transactions', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions)
        })

        it('logs errors ', () => {
            transactionPool.validTransactions()
            expect(errorMock).toHaveBeenCalled()
        })


    })

    describe('clear()', () => {
        it('clears the transactions', () => {
            transactionPool.clear()
            expect(transactionPool.transactionMap).toEqual({})
        })
    })

    describe('clearBlockchainTransactions()', () => {
        it('clears pool of existing blockchain txs', () => {
            const blockchain = new Blockchain()
            const expectedTransactionMap = {}
            for(let i =0; i<6; i++) {
                let tx = new Wallet().createTransaction({
                    recepient: 'general',
                    amount: 10
                })
                transactionPool.setTransaction(tx)
                // add half transactions to blockchain
                if(i%2 === 0) {
                    blockchain.addBlock({data: [transaction]})
                } else {
                    expectedTransactionMap[tx.id] = tx
                }

            }
            transactionPool.clearBlockchainTransactions({chain: blockchain.chain})
            expect(transactionPool.transactionMap.toString()).toEqual(expectedTransactionMap.toString())
        })
    })
    
})