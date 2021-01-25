const Block         = require('../block');
const {GENESIS_DATA}  = require('../config')
const cryptoHash      = require('./crypto-hash')

describe('cryptoHash()', () => {

    const result = '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae'
    const toHash = 'foo'

    it('produces correct SHA256 hash', () => {
        expect(cryptoHash(toHash)).toEqual(result)
    })

    it('produces same hash with same input arguments in any order', () => {
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('two', 'three', 'one'))
    })

});