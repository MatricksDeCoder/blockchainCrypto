const {CRYPTO_START_BALANCE} = require('../config')
const {ec, cryptoHash}                   = require('../CryptographyUtils')

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

    
}

module.exports = Wallet