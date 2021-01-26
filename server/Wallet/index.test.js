const Wallet = require('./index')
const {verifySignature} = require('../CryptographyUtils')
const Transaction       = require('./transaction')

describe('Wallet', () => {

    let walletMain, walletOther, walletAnother, data

    beforeEach(() => {
        walletMain = new Wallet()
        walletOther = new Wallet()
        walletAnother = new Wallet()
        data = 'foobarbaz'
    })

    it('has a balance', () => {
        expect(walletMain).toHaveProperty('balance')
        expect(walletOther).toHaveProperty('balance')
    })

    it('has a public key', () => {
        expect(walletMain).toHaveProperty('publicKey')
        expect(walletOther).toHaveProperty('publicKey')
    })

    describe('signing data', () => {

        it('verifies a signature', () => {
            expect(verifySignature({
                publicKey: walletMain.publicKey,
                data,
                signature: walletMain.sign(data)
            })).toBe(true)
        })
        
        it('does not verify invalid signature', () => {
            // use a different wallet
            expect(verifySignature({
                publicKey: walletMain.publicKey,
                data,
                signature: walletOther.sign(data)
            })).toBe(false)
        })
    })

    describe('createTransaction()', () => {

        describe('amount exceeds wallet balance', () => {

            it('throws an error', () => {
                expect(() => walletMain.createTransaction({amount : 3000, recepient: walletOther.publicKey})).toThrow('Amount exceeds balance!')
            })

        })

        describe('amount is valid', () => {

            let transaction, amount, recepient

            beforeEach(() => {
                amount = 50
                recepient = walletAnother.publickey
                transaction = walletOther.createTransaction({amount, recepient})
            })

            it('creates an instance of Transaction', () => {
                expect(transaction instanceof Transaction).toBe(true)
            })

            it('it matches the transaction input', () => {
                expect(transaction.input.address).toBe(walletOther.publicKey)
                expect(transaction.input.amount).toBe(walletOther.balance)
                expect(verifySignature({
                    publicKey: walletOther.publicKey,
                    data: transaction.outputMap,
                    signature: transaction.input.signature
                })).toBe(true)
            })

            it(' must still be a valid transaction', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true)
            })

            it('it outputs the amount to the recepient', () => {
                expect(transaction.outputMap[recepient]).toBe(amount)
            })     

        })
    })


})