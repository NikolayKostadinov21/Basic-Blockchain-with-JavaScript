const {BlockChain, Transaction} = require('./blockchain.js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


//my PRIVATE KEY
const myKey = ec.keyFromPrivate('c98179c67eec6ab7a353a315316d47fb457315f2c1e190e544a52c23ae366f96');
const myWalletAddress = myKey.getPublic('hex');

let varnaCoin = new BlockChain();

const tx1 = new Transaction('myWalletAddress', 'public key goes here', 100);
tx1.signTransaction(myKey);
varnaCoin.addTransaction(tx1);

console.log('Starting the miner...');
varnaCoin.minePendingTransactions(myWalletAddress);

console.log('balance of niko is : ', varnaCoin.getBalanceOfAddress(myWalletAddress));