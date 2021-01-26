//elliptic ..will use ECDSA
const EC          = require('elliptic').ec
const cryptoHash  = require('./crypto-hash')

// initialize ec context
const ec   = new EC('secp256k1') //use same as Bitcoin

const verifySignature = ({publicKey, data, signature})  => {   

    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex')

    //works best when data is hashed
    const dataHash = cryptoHash(data)
    // Export DER encoded signature in Array
    var derSign = signature.toDER();
    
    // Verify signature
    return keyFromPublic.verify(dataHash, derSign)
}

module.exports = {ec, verifySignature, cryptoHash}




