const {CRYPTO_START_BALANCE} = require('../../config')
const {ec, cryptoHash}                   = require('../CryptographyUtils')
const Transaction       = require('./transaction')

class Wallet {
    constructor() {
        this.balance       = CRYPTO_START_BALANCE

        //generate public, private key
        this.keyPair = ec.genKeyPair()
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        const hashedData = cryptoHash(data)
        return this.keyPair.sign(hashedData)
    }

    createTransaction({amount, recepient}) {
        if(amount > this.balance) {
            throw Error('Amount exceeds balance!')
        }
        let transaction = new Transaction( {
            senderWallet : this,
            recepient,
            amount
        })
        return transaction 
    }  

    
}

module.exports = Wallet