const Block         = require('../block');
const {GENESIS_DATA}  = require('../../config')
const cryptoHash      = require('./crypto-hash')

describe('cryptoHash()', () => {

    const result = 'b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b'
    const toHash = 'foo'

    it('produces correct SHA256 hash', () => {
        expect(cryptoHash(toHash)).toEqual(result)
    })

    it('produces same hash with same input arguments in any order', () => {
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('two', 'three', 'one'))
    })

    it('outputs new hash when properties on input have changed', () => {
        const obj = {a:5,b:7}
        const hash = cryptoHash(obj)
        obj['a'] = 10
        const newHash = cryptoHash(obj)
        expect(hash).not.toEqual(newHash)
    })

});