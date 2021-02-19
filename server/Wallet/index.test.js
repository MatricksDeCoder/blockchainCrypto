const Wallet = require('./index')
const {verifySignature} = require('../CryptographyUtils')
const Transaction       = require('./transaction')
const Blockchain        = require('../Blockchain')
const {CRYPTO_START_BALANCE} = require('../../config')


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

        describe('and a chain is passed', () => {
            it('calls Wallet.calculateBalance', () => {
                const ourCalculateBalance = Wallet.calculateBalance
                const calculateBalanceMock = jest.fn()
                Wallet.calculateBalance = calculateBalanceMock
                walletMain.createTransaction({
                    recepient: 'check',
                    amount: 10,
                    chain: new Blockchain().chain
                })
                expect(calculateBalanceMock).toHaveBeenCalled()
                Wallet.calculateBalance = ourCalculateBalance
            })
        })
    })

    describe('calculateBalance()', () => {
        let blockchain

        beforeEach(() => {
            blockchain = new Blockchain()
        })

        describe('there are no outputs for the wallet', () => {
            it('returns the START_BALANCE', () => {
                const balance = Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: walletMain.publicKey
                })
                expect(balance).toEqual(CRYPTO_START_BALANCE)
            })
        })

        describe('there are outputs for the wallet', () => {
            // need to look through blockchain history
            let tx1, tx2 
            beforeEach(() => {
                tx1 = walletOther.createTransaction({
                    recepient: walletMain.publicKey,
                    amount: 50
                })
                tx2 = walletOther.createTransaction({
                    recepient: walletMain.publicKey,
                    amount: 150
                })
                blockchain.addBlock({data: [tx1, tx2]})
            }) 

            it(' adds txs to balance', () => {
                const balanceValue = Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: walletMain.publicKey
                })
                expect(balanceValue).toEqual(CRYPTO_START_BALANCE +  tx1.outputMap[walletMain.publicKey] +  tx2.outputMap[walletMain.publicKey])
            })

            describe(' and the wallet has made txs', () => {
                let recentTx 

                beforeEach(() => {
                    recentTx = walletMain.createTransaction({
                        recepient: walletAnother.publicKey,
                        amount: 50
                    })
                    blockchain.addBlock({data: [recentTx]})
                })

                it('returns output amount of recent trancation', () => {
                    const balanceV = Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: walletMain.publicKey
                    })
                    expect(balanceV).toEqual(recentTx.outputMap[walletMain.publicKey])
                })
                
                describe('and there are outputs next to and after recent transaction', () => {
                    let sameBlockTx, nextBlockTx
                    beforeEach(() => {
                        recentTx = walletMain.createTransaction({
                            recepient: new Wallet().publicKey,
                            amount: 90
                        })
                        sameBlockTx = Transaction.rewardTransaction({minerWallet: walletMain})
                        blockchain.addBlock({data: [recentTx, sameBlockTx]})
                        nextBlockTx = new Wallet().createTransaction({
                            recepient: walletMain.publicKey,
                            amount: 150
                        })
                        blockchain.addBlock({data: [nextBlockTx]})
                    })

                    it('includes output amounts in the returned balance', () => {
                        const balanceY = Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: walletMain.publicKey
                        })
                        expect(balanceY).toEqual(recentTx.outputMap[walletMain.publicKey] + sameBlockTx.outputMap[walletMain.publicKey] + nextBlockTx.outputMap[walletMain.publicKey])
                    })
                })
                
            })

        })


    })


})