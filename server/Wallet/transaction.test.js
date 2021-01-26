const Transaction = require('./transaction')
const Wallet      = require('.')
const {verifySignature} = require('../CryptographyUtils')
const { createTransaction } = require('./transaction')

describe('Transaction', () => {

    let transaction, senderWallet, otherWallet, recepient, amount

    beforeEach(() => {

        senderWallet   = new Wallet()
        otherWallet    = new Wallet()
        recepient      = otherWallet.publicKey
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
            expect(transaction.outputMap[recepient]).toEqual(amount)
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
                data: transaction.outputMap, 
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

        describe('update() to transaction object', () => {

            let originalSignature, originalSenderOutput, nextRecepient, nextAmount, addAmount

            beforeEach(() => {

                originalSignature = transaction.input.signature
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey]
                nextRecepient  = new Wallet().publicKey
                nextAmount     = 150
                addAmount      = 100
                transaction.update({senderWallet, recepient: nextRecepient, amount: nextAmount})
            
            })

            describe('and the amount is valid', () => {

                it('outputs the amount to the next recepient', () => {
                    expect(transaction.outputMap[nextRecepient]).toEqual(nextAmount)
                })
    
                it('subtracts the amount from the original sender output', () => {
                    expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput-nextAmount)
                })
    
                it('ensures output values still match the inputs', () => {
                    expect(transaction.input.address).toEqual(senderWallet.publicKey)
                    expect(transaction.input).toHaveProperty('signature')
                })
    
                it('maintains a total output that matches the inputs', () => {
                    expect(Object.values(transaction.outputMap).reduce((sum,val) => sum+val, 0)).toEqual(transaction.input.amount)
                })
    
                it('resigns the transaction', () => {
                    expect(transaction.input.signature).not.toEqual(originalSignature)
                    expect(verifySignature({
                        publicKey: senderWallet.publicKey,
                        data: transaction.outputMap,
                        signature: transaction.input.signature
                    })).toBe(true)
                })

                describe(' and update is for same recepient ', () => {
                
                    beforeEach(() => {
                        transaction.update({senderWallet, recepient: nextRecepient, amount: addAmount})
                    })
    
                    it('updates balance of recepient by adding new amount', () => {
                        expect(transaction.outputMap[nextRecepient]).toEqual(nextAmount + addAmount)
                    })
    
                    it('updates balance of sender by reducing new amount', () => {
                        expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput -(nextAmount +addAmount))
                    })
    
                })  

            })

            describe('and the amount is invalid', () => {                
                it('throws a error', () => {
                    expect(() => transaction.update({senderWallet, recepient: nextRecepient, amount: 999999})).toThrow('Insufficient balance')
                })
            })                                       

        })
        

    })

   


})