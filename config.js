const INITIAL_DIFFICULTY = 3

const MINE_RATE  = 1000

const GENESIS_DATA = {
    timestamp : 1000,
    lastHash : '0x00000000000000000000000000000000000',
    hash: 'hash',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data : [] 
}

const CRYPTO_START_BALANCE = 1000

const REWARD_INPUT = {
    address : "authorized-reward"
}

const MINING_REWARD = 50

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    CRYPTO_START_BALANCE,
    REWARD_INPUT,
    MINING_REWARD
}

