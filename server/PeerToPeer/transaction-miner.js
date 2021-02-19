const TransactionPool = require('../Wallet/transaction-pool')
const Transaction = require('../Wallet/transaction')
const {REWARD_INPUT, MINING_REWARD} = require('../../config')


class TransactionMiner {

    constructor({
        blockchain,
        transactionPool,
        wallet,
        pubsub
    }) {
        this.transactionPool = transactionPool
        this.blockchain      = blockchain
        this.wallet          = wallet
        this.pubsub          = pubsub
    }

    mineTransaction() {

        // get valid transactions from transaction pool
    
        const validTxs = this.transactionPool.validTransactions()
        // generate miner reward, a valid transaction for miner must be created
        const rewardTransaction = Transaction.rewardTransaction({minerWallet : this.wallet})
        validTxs.push(rewardTransaction)
        // add block with transactions to the blockchain
        this.blockchain.addBlock({data: validTxs})
        //broadcast updated blockchain
        this.pubsub.broadcastChain()
        // clear your transactionPool
        this.transactionPool.clear()

    }

}

module.exports = TransactionMiner