module.exports = {
  rpcAuthUrl: "http://dashmate:rTvfm81kiOxO@127.0.0.1:19998",

  L1_VERSION_PLATFORM: 3,
  L2_VERSION_PLATFORM: 1,

  StateTransitionEnum: {
    DATA_CONTRACT_CREATE: 0,
    DOCUMENTS_BATCH: 1,
    IDENTITY_CREATE: 2,
    IDENTITY_TOP_UP: 3,
    DATA_CONTRACT_UPDATE: 4,
    IDENTITY_UPDATE: 5,
    IDENTITY_CREDIT_WITHDRAWAL: 6,
    IDENTITY_CREDIT_TRANSFER: 7,
    TYPE_ASSET_LOCK: 8,
  },


  KEY_LEVELS: {
    MASTER: 0,
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
  },
  KEY_PURPOSES: {
    AUTHENTICATION: 0,
    ENCRYPTION: 1,
    DECRYPTION: 2,
    TRANSFER: 3,
    SYSTEM: 4,
    VOTING: 5,
  },
  KEY_TYPES: {
    ECDSA_SECP256K1: 0,
  },

  network: "testnet",
  coinType: 1, //mainnet = 5
}
