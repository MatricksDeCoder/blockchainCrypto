const {GENESIS_DATA, MINE_RATE, REWARD_INPUT, MINING_REWARD}   = require('../../config')
const {cryptoHash}     = require('../CryptographyUtils')
const Block           = require('../Block')
const Transaction = require('../Wallet/transaction')

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

    validTransactionData({chain}) {
        for(let i=0; i<chain.lenght; i++) {
            const block = chain[i]
            let rewardTxCount = 0
            for(let tx of block.data) {
                if(tx.input.address === REWARD_INPUT) {
                    rewardTxCount += 1;
                    if(rewardTxCount > 1) {
                        console.error('Miner rewards exceed limit! ')
                        return false
                    }
                }

                if(Object.values(tx.outputMap)[0] !== MINING_REWARD) {
                    console.error('Miner reward is invalid! ')
                    return false
                } else {
                    if(!Transaction.validTransaction(tx)) {
                        console.error('Invalid transaction! ')
                        return false
                    }
                }
            }
        }
        return true
    }

    addBlock({data}) {
        const lastBlock = this.chain[this.chain.length-1]
        const newBlock  = Block.mineBlock({lastBlock, data})
        this.chain.push(newBlock)
    }

    replaceChain(chain, onSuccess) {
       if(chain.length <= this.chain.length) {
           console.error("the incoming chain must be longer")
           return
       }
       if(!Blockchain.isValidChain(chain)) {
           console.error("the incoming chain must be valid")
           return
       }
       if(onSuccess) {
           onSuccess()
       }
       console.log("replacing chaing with: ", chain)
       this.chain = chain
    }
   
    
}

module.exports = Blockchain