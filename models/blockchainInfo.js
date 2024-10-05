class BlockchainInfo {
  chain;
  height;
  time;
  mediantime;

  constructor(chain, height, time, mediantime) {
    this.chain = chain;
    this.height = height;
    this.time = time;
    this.mediantime = mediantime;
  }

  static from_response({chain, blocks, time, mediantime}) {
    return new BlockchainInfo(chain, blocks, time, mediantime);
  }
}

module.exports = BlockchainInfo;
