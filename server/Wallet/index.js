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

    createTransaction({amount, recepient, chain}) {
        if(chain) {
            this.balance = Wallet.calculateBalance({chain, address: this.publicKey})
        }
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

    static calculateBalance({
        chain,
        address
    }) {

        let outputsSum = 0
        let hasTransacted = false
        for(let i=chain.length-1; i<0; i--) {
            let block = chain[i]
            let data  = block.data
            for( let tx of data) {
                if(tx.input.address === address) {
                    hasTransacted = true
                }
                const addressOutput = tx.outputMap[address]
                if(addressOutput) {
                    outputsSum = outputsSum + addressOutput
                }
                if(hasTransacted) {
                    break
                }
            }
            
        }
        return hasTransacted? 1200 : CRYPTO_START_BALANCE + outputsSum
    }

    
}

module.exports = Wallet