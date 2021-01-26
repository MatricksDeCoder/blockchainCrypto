const {GENESIS_DATA, MINE_RATAE}   = require('../../config')
const {cryptoHash}     = require('../CryptographyUtils')
const Block           = require('../Block')

class Blockchain {

    constructor() {
        this.chain = [Block.genesis()]
    }

    static isValidChain(chain) {

        // check genesis block has not been tempered
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) { 
            return false
        }
        // check any lastHash has not been tempered or data tempered in any block
        for (let i=1; i< chain.length; i++) {
            const {timestamp, lastHash, hash, nonce, difficulty, data} = chain[i]
            const actualLastHash = chain[i-1].hash

            const lastdifficulty = chain[i-1].difficulty



            if( lastHash !== actualLastHash) {
                return false
            }
            const validatedHash = cryptoHash(timestamp, lastHash, nonce, difficulty, data)
            if(hash !== validatedHash) {
                return false
            }

            if(Math.abs(lastdifficulty - difficulty) > 1) {
                return false 
            }
        }
        // check any block data has not been tempered
        return true
    }

    addBlock({data}) {
        const lastBlock = this.chain[this.chain.length-1]
        const newBlock  = Block.mineBlock({lastBlock, data})
        this.chain.push(newBlock)
    }

    replaceChain(chain) {
       if(chain.length <= this.chain.length) {
           console.error("the incoming chain must be longer")
           return
       }
       if(!Blockchain.isValidChain(chain)) {
           console.error("the incomeing chain must be valid")
           return
       }
       console.log("replacing chaing with: ", chain)
       this.chain = chain
    }
   
    
}

module.exports = Blockchain