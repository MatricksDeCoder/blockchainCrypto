require('dotenv').config();

const express    = require('express')
const Blockchain = require('./Blockchain')
const bodyParser = require('body-parser')
const request    = require('request')

// all ow for peer PORT 
const DEFAULT_PORT = 3001

// define the root node, where we will make request
const ROOT_NODE_ADDRESS = `http//localhost:${DEFAULT_PORT}`

// get PUBSUB class for peer to peer network
const PubSub     = require('./PubSub/pubsub')

const app        = express()
app.use(bodyParser.json())
const blockchain = new Blockchain()
const pubsub     = new PubSub({blockchain})

// check
//setTimeout(() => pubsub.broadcastChain(), 1000)

app.get('/api/blocks', (req, res) => {
    res.status(200).json(blockchain.chain)
})

app.post('/api/mine', (req,res) => {
    const data = req.body
    blockchain.addBlock({data})
    pubsub.broadcastChain()
    res.redirect('/api/blocks')
})

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