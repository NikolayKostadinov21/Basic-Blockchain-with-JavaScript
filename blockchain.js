const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {

    constructor(fromAddress, toAddress, amount) {
        //fromAddress = public key
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey) {
        //before sign a transaction we are checking if the 'hex' version of the public key
        //is equal to the fromAddress
        //if it's not we are throwing error
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        //calculating the hash of the transaction
        const hashTx = this.calculateHash();
        //we are signing the transaction
        const sig = signingKey.sign(hashTx, 'base64');
        //casting the signature to DER
        //The Distinguished Encoding Rules (DER) format
        //is a defined standard which Bitcoin uses
        //to encode ECDSA signatures
        this.signature = sig.toDER('hex');
    }

    //This method is checking if the transaction was valid
    isValid() {
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        //if it has a signature
        //we are extracting the public key
        //and then we are veryfing that
        //indeed the transaction is signed by that key
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(). this.signature);
    }
}

class Block {

    constructor(timestamp, transactions, previousHash = '') {
        //the index is optional and it tells us where a block sits in the chain
        //the timestamp is when the block was mined
        this.timestamp = timestamp;
        //the data is the data stored in the block
        this.transactions = transactions;
        //previousHash is the hash of the previous block
        this.previousHash = previousHash;
        //hash is the hash of the current block
        this.hash = this.calculateHash();
        //the nonce which is dynamically calculated
        this.nonce = 0;
    }

    //calculating current hash
    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }
    
    //mining current block
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log('Block ' + this.index + ' mined...');
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}

class BlockChain {
    
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(0, '01/01/2023', 'Genesis block', '0');
    }

    //returning a object of the latest block
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    //Mining pending transactions - 
    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];
    }

    //create new transaction
    addTransaction(transaction) {

        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    //Go trough every block
    //Then when you go to the specific block
    //Go trough every transaction of the block
    //When you find the specific address
    //increment or decrement the balance
    //return the balance
    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (let transaction of block.transaction) {
                if (transaction.fromAddress === address) {
                    balance -= transaction.amount;
                }

                if (transaction.toAddress === address) {
                    balance += transaction.amount;
                }
            }
        }

        return balance;
    }

    //going trough every block to check if it's valid or not
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const prevoiusBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            //we are testing if the current hash of the current block is adequate
            //in other words if the current hash is somehow corrupted
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            //here we are checking if the hash of the previous block is equal to the hash of the current
            //if it's not equal -> return false
            if (currentBlock.previousHash !== prevoiusBlock.hash) {
                return false;
            }

            return true;
        }
    }

}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;