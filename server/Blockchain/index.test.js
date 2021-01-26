const Block         = require('../Block')
const Blockchain    = require('.')
const {GENESIS_DATA}  = require('../../config')
const {cryptoHash}     = require('../CryptographyUtils')

describe('Blockchain',  () => {

    let blockchain, originalChain, newChain
    const GENESIS    = Block.genesis()

    beforeEach(() => {
        blockchain = new Blockchain()
        newChain   = new Blockchain()
        originalChain = blockchain.chain
    })

    it('has a chain Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true)
    })

    it('starts with a genesis block', () => {
        expect((blockchain.chain[0])).toEqual((GENESIS))
    })

    it('adds a new block to the chain from new data', () => {
        const data = 'Alice Bob'
        blockchain.addBlock({data})
        const lastBlock = blockchain.chain[blockchain.chain.length-1]
        expect(lastBlock.data).toEqual(data)
    })

    describe('isValidChain()', () => {
        describe('when chain dont start with genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = {data: 'tampered data'}
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
            })
        })

        describe('when chain starts with genesis block & has multiple blocks', () => {

            beforeEach(() => {
                blockchain.addBlock({data: 'ok1'})
                blockchain.addBlock({data: 'ok2'})
                blockchain.addBlock({data: 'ok3'})
            })

            describe('lastHash reference has changed', () => {
                it('returns false', () => {
                
                    blockchain.chain[2].lastHash = 'tampered-hash'

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)

                })
            })
            describe('chain has block with invalid field, changing hash', () => {
                it('returns false', () => {
                
                    blockchain.chain[2].data = 'tampered-data'

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)

                })
            })
            describe('chain has only valid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
                })
            })

            describe('chain has block with a jumped difficulty', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length-1]
                    const lastHash  = lastBlock.hash
                    const timestamp = Date.now()
                    const nonce     = 0
                    const data      = []
                    //reduce difficulty in a jump way
                    const difficulty = lastBlock.difficulty - 3
                    const hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
                    
                    const badBlock = new Block({timestamp, lastHash, hash, data, nonce, difficulty })

                    blockchain.chain.push(badBlock)
    
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
    
                })
            })
        })
    })

    describe('chainReplacement replaceChain()', () => {

        let errorMock, logMock

        beforeEach(()=> {

            errorMock = jest.fn()
            logMock   = jest.fn()

            global.console.error = errorMock
            global.console.log   = logMock  

        })

        describe('when new chain is not longer', () => {

            beforeEach(()=> {
                newChain.chain[0] = {new:'newchain'}
                blockchain.replaceChain(newChain.chain)
            })

            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain)

            })

            it('logs error', () => {
                expect(errorMock).toHaveBeenCalled()
            })
        })
    
        describe('when the new chain is longer', () => {

            beforeEach(() => {
                newChain.addBlock({data: 'ok1'})
                newChain.addBlock({data: 'ok2'})
                newChain.addBlock({data: 'ok3'})
            })

            describe('and the chain is invalid ', () => {

                beforeEach(()=> {
                    newChain.chain[2].hash = 'tampered-hash'
                    blockchain.replaceChain(newChain.chain)
                })

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain)

                })

                it('logs error', () => {
                    expect(errorMock).toHaveBeenCalled()
                })
            })
            
            describe('and the chain is valid ', () => {

                beforeEach(()=> {
                    blockchain.replaceChain(newChain.chain)
                })
                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain)
                })
                it('logs succes', () => {
                    expect(logMock).toHaveBeenCalled()
                })

            })

            
        })
        
    })

});

