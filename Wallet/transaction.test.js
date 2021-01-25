const Transaction = require('./transaction')
const Wallet      = require('.')
const {verifySignature} = require('../CryptographyUtils')

describe('Transaction', () => {

    let transaction, senderWallet, otherWallet, recepient, amount

    beforeEach(() => {

        senderWallet   = new Wallet()
        otherWallet    = new Wallet()
        recepient      = 'publicKeyReceiver'
        amount         = 50
        transaction    = new Transaction({
            senderWallet,
            recepient,
            amount
        })

    })

    it('transaction has a unique id', () => {
        expect(transaction).toHaveProperty('id')
    })

    describe('outputMap', () => {
        it('has an outputMap', () => {
            expect(transaction).toHaveProperty('outputMap')
        })
        it('outputs the amount to the recepient', () => {
            expect(transaction.outputMap['recepient']).toEqual(amount)
        })
        it('outputs remaining amount to sender wallet', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance-amount)
        })
    })

    describe('input', () => {
        it('has input', () => {
            expect(transaction).toHaveProperty('input')
        })
        it('has a timestamp in input', () => {
            expect(transaction.input).toHaveProperty('timestamp')
        })
        it('sets amount to be senderWallet balance', () => {
            expect(transaction.input).toHaveProperty('amount')
            expect(transaction.input['amount']).toEqual(senderWallet.balance)
        })
        it('sets address to senderWallet publicKey', ()=> {
            expect(transaction.input).toHaveProperty('address')
            expect(transaction.input['address']).toEqual(senderWallet.publicKey)
        })
        it('signs the input', () => {
            expect(verifySignature({
                publicKey : senderWallet.publicKey, 
                data: transaction.input, 
                signature : transaction.input.signature
            })).toBe(true)
        })
    })

    describe('validTransaction()', () => {

        let errorMock

        beforeEach(() => {
            errorMock  = jest.fn() 
            global.console.error = errorMock
        })

        describe('valid transaction', () => {
            it('returns true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true)
            })
        })

        describe('invalid transaction', () => {
            
            describe('transaction output Map is not valid', () => {
                it('returns false and logs an error', () => {
                     // change outputs
                    transaction.outputMap[senderWallet.publicKey] = 20000
                    expect(Transaction.validTransaction(transaction)).toBe(false)
                    expect(errorMock).toHaveBeenCalled()
                })
               
            })
            describe('signature is invalid', () => {
                it('returns false and logs an error', () => {
                    // change signature
                    transaction.input.signature  = otherWallet.sign(transaction.outputMap)
                    expect(Transaction.validTransaction(transaction)).toBe(false)
                    expect(errorMock).toHaveBeenCalled()
                })
            })
        })

    })


})