const WasmDpp = require("@dashevo/wasm-dpp");
const DashPhrase = require("dashphrase");
const DashTx = require("dashtx");
const bs58 = require("bs58");
const DashKeys = require("dashkeys");
const DashHd = require("dashhd");
const CBOR = require("cbor");
const {Entropy} = require("entropy-string");
const {
  coinType,
  rpcAuthUrl,
  L2_VERSION_PLATFORM,
  StateTransitionEnum,
  KEY_TYPES,
  KEY_PURPOSES,
  KEY_LEVELS
} = require("./constants");
const Dashtx = require("dashtx");
let Secp256k1 = require("@dashincubator/secp256k1");


const entropy = new Entropy()

const dataContractId = "4Vzi3Htx2MqkeW83zV6K5qFiMjpaRmQCqPs3xfsSxdHa"
const ownerId = "B7kcE1juMBWEWkuYRJhVdAE2e6RaevrGxRsa1DrLCpQH"
const mnemonic = "plastic frame casual ring tool acquire dream volcano fade sponsor visa bonus"


let identityEcdsaPath = "";
{
  // m/purpose'/coin_type'/feature'/subfeature'/keytype'/identityindex'/keyindex'
  // ex: m/9'/5'/5'/0'/0'/<id>/<key>
  let purposeDip13 = 9;
  let featureId = 5;
  let subfeatureKey = 0;
  let keyType = KEY_TYPES.ECDSA_SECP256K1;
  identityEcdsaPath = `m/${purposeDip13}'/${coinType}'/${featureId}'/${subfeatureKey}'/${keyType}'`;
}


function entropyGen() {
  return entropy.string()
}


async function main() {
  await WasmDpp.default()
  const n = new WasmDpp.DashPlatformProtocol(entropyGen, 1)
  const dashtx = Dashtx

  const seedBytes = await DashPhrase.toSeed(mnemonic)
  const wallet = await DashHd.fromSeed(seedBytes, {
    coinType: coinType,
    versions: DashHd.TESTNET
  })


  let idIndex = 0; // increment to first unused

  let identityKeys = await getIdentityKeys(wallet, idIndex);
  let stKeys = await getIdentityTransitionKeys(identityKeys);

  const pubkey = new WasmDpp.IdentityPublicKey(1)

  pubkey.setSecurityLevel(1)
  pubkey.setData(wallet.publicKey)

  const entropyString = entropyGen()

  let stateTransition = {
    protocolVersion: 1,
    type: 1,
    user_fee_increase: 0,
    ownerId: "B7kcE1juMBWEWkuYRJhVdAE2e6RaevrGxRsa1DrLCpQH",
    transitions: [
      {
        "$action": 0,
        "$dataContractId": "CW12dnaPL3Mrb5MiJL4SgBhgimc4BBSagjL1dGtURcJp",
        "$id": "6oCKUeLVgjr7VZCyn1LdGbrepqKLmoabaff5WQqyTKYP",
        "$type": "note",
        "$entropy": "yfo6LnZfJ5koT2YUwtd8PdJa8SXzfQMVDz",
        "message": "Tutorial Test @ Mon, 27 Apr 2020 20:23:35 GMT"
      }
    ]
  };

  // console.log(`stKeys:`);
  // console.log(stKeys);
  //
  let cbor = CBOR.encodeCanonical(stateTransition);
  // console.log(`cbor:`);
  // console.log(DashTx.utils.bytesToHex(cbor));
  // console.log(bytesToBase64(cbor));
  //
  const sigBytes = await sign(wallet.privateKey, cbor);
  let sigHex = DashTx.utils.bytesToHex(sigBytes);
  Object.assign(stateTransition, {
    signature: sigHex,
    signaturePublicKeyId: 0,
  });

  let cbor2 = CBOR.encodeCanonical(stateTransition);
  console.log(`cbor:`);
  console.log(cbor2.toString("base64"));
  console.log("hex")
  console.log(cbor2.toString("hex"));

  // let txid = await DashTx.utils.rpc(
  //   rpcAuthUrl,
  //   "broadcaststatetransition",
  //   bytesToBase64(cbor2)
  // );
}

main().catch((err) => {
  throw err
})

function getIdentityTransitionKeys(identityKeys) {
  let stKeys = [];
  for (let key of identityKeys) {
    let data = bytesToBase64(key.publicKey);
    let stKey = {
      id: key.id,
      type: key.type,
      purpose: key.purpose,
      securityLevel: key.securityLevel,
      data: data,
      // readOnly: key.readOnly,
    };
    if ("readOnly" in key) {
      Object.assign(stKey, {readOnly: key.readOnly});
    }
    stKeys.push(stKey);
  }
  return stKeys;
}

async function getIdentityKeys(walletKey, idIndex) {
  let identityEcdsaKey = await DashHd.derivePath(walletKey, identityEcdsaPath);
  let identityKey = await DashHd.deriveChild(
    identityEcdsaKey,
    idIndex,
    DashHd.HARDENED,
  );

  let keyDescs = [
    {
      id: 0,
      type: KEY_TYPES.ECDSA_SECP256K1,
      purpose: KEY_PURPOSES.AUTHENTICATION,
      data: "",
      securityLevel: KEY_LEVELS.MASTER,
      // readOnly: false,
    },
    {
      id: 1,
      type: KEY_TYPES.ECDSA_SECP256K1,
      purpose: KEY_PURPOSES.AUTHENTICATION,
      data: "",
      securityLevel: KEY_LEVELS.HIGH,
      // readOnly: false,
    },
    {
      id: 2,
      type: KEY_TYPES.ECDSA_SECP256K1,
      purpose: KEY_PURPOSES.AUTHENTICATION,
      data: "",
      securityLevel: KEY_LEVELS.CRITICAL,
      // readOnly: false,
    },
    {
      id: 3,
      type: KEY_TYPES.ECDSA_SECP256K1,
      purpose: KEY_PURPOSES.TRANSFER,
      data: "",
      securityLevel: KEY_LEVELS.CRITICAL,
      // readOnly: false,
    },
  ];

  for (let keyDesc of keyDescs) {
    let key = await DashHd.deriveChild(
      identityKey,
      keyDesc.id,
      DashHd.HARDENED,
    );
    Object.assign(keyDesc, key);

    // let dppKey = new WasmDpp.IdentityPublicKey(L2_VERSION_PLATFORM);
    // dppKey.setId(keyDesc.id);
    // dppKey.setData(key.publicKey);
    // if (keyDesc.purpose) {
    //   dppKey.setPurpose(keyDesc.purpose);
    // }
    // dppKey.setSecurityLevel(keyDesc.securityLevel);
    // dppKeys.push(dppKey);
  }

  return keyDescs;
}

function bytesToBase64(bytes) {
  let binstr = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binstr += String.fromCharCode(bytes[i]);
  }

  return btoa(binstr);
}


async function sign(privKeyBytes, hashBytes) {
  let sigOpts = {canonical: true, extraEntropy: true};
  let sigBytes = await Secp256k1.sign(hashBytes, privKeyBytes, sigOpts);
  return sigBytes;
};
