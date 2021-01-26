require('dotenv').config();

const express    = require('express')
const Blockchain = require('./server/Blockchain')
const bodyParser = require('body-parser')
const request    = require('request')
const path       = require('path')
const TransactionPool = require('./server/Wallet/transaction-pool')
const Wallet          = require('./server/Wallet')

const transactionPool = new TransactionPool()
const wallet          = new Wallet()


// all ow for peer PORT 
const DEFAULT_PORT = 3001

// define the root node, where we will make request
const ROOT_NODE_ADDRESS = `http//localhost:${DEFAULT_PORT}`

// get PUBSUB class for peer to peer network
const PubSub     = require('./server/PeerToPeer/PubSub/pubsub')

const app        = express()
app.use(express.json())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'client/dist')))

const blockchain = new Blockchain()
const pubsub     = new PubSub({blockchain})

// check
//setTimeout(() => pubsub.broadcastChain(), 1000)

//routes start
app.get('/api/wallet-info', (req,res) => {
  //const address = wallet.publicKey
  const address = 'ef339802bc938f02c3'
  //const balance = Wallet.calculateBalance({ chain: blockchain.chain, address })
  const balance = 125

  res.status(200).json({
    address,
    balance
  })

}) 

app.get('/api/blocks', (req, res) => {
    res.status(200).json(blockchain.chain)
})

app.get('/api/transactionPoolMap', (req,res) => {
  res.status(200).json(transactionPool.transactionMap)
})

app.post('/api/mine', (req,res) => {
    const data = req.body
    blockchain.addBlock({data})
    pubsub.broadcastChain()
    res.redirect('/api/blocks')
})

app.post('/api/transact', (req,res) => {

  const {recepient, amount} = req.body
  let transaction = transactionPool.existsTransaction({
    inputAddress : wallet.publicKey
  })

  try {
    if(!transaction) {
      transaction = wallet.createTransaction({amount, recepient})
    } else {
      transaction.update({senderWallet : wallet, recepient, amount})
    }
    
    transactionPool.setTransaction(transaction)
    res.status(200).json({type: "success",transaction})
  } catch(error) {
    res.status(400).json({type: "error", error: error.message})
  }
})



app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname,'client/dist/index.html'))
})

//routes end

const syncChains = () => {

    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
      console.log()
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);
  
        console.log('replace chain on a sync with', rootChain);
        blockchain.replaceChain(rootChain);
      }
    });
  
  };


let PEER_PORT
if(process.env.GENERATE_PEER_PORT === 'true') {
    console.log('Generating random port')
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random()*1000)
}

const PORT = PEER_PORT || DEFAULT_PORT

app.listen(PORT, () => {
    console.log(`Application listening on PORT : ${PORT}`)
    if(PORT !== DEFAULT_PORT) {
        syncChains()
    }
})