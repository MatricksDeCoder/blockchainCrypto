const Wallet = require('./index')
const {verifySignature} = require('../CryptographyUtils')

describe('Wallet', () => {

    let walletMain, walletOther, data

    beforeEach(() => {
        walletMain = new Wallet()
        walletOther = new Wallet()
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

})