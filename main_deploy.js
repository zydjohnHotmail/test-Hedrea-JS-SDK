const { AccountId, PrivateKey, Client, FileCreateTransaction, ContractCreateTransaction, FileAppendTransaction } = require("@hashgraph/sdk");
const dotenv = require("dotenv");
  
dotenv.config();

const byteCode = "0x608060405234801561001057600080fd5b5061017c806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063ef5fb05b14610030575b600080fd5b61003861004e565b60405161004591906100c4565b60405180910390f35b60606040518060400160405280600b81526020017f48656c6c6f20576f726c64000000000000000000000000000000000000000000815250905090565b6000610096826100e6565b6100a081856100f1565b93506100b0818560208601610102565b6100b981610135565b840191505092915050565b600060208201905081810360008301526100de818461008b565b905092915050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610120578082015181840152602081019050610105565b8381111561012f576000848401525b50505050565b6000601f19601f830116905091905056fea2646970667358221220f41697157301e5b711ae91d093f64cf70f00a8128efd896c0e39f46cefe9c0e064736f6c63430008000033";

async function main() {
    const myAccountId = AccountId.fromString(process.env.ACCOUNT_ID);
    const myPrivateKey = PrivateKey.fromString(process.env.PRIVATE_KEY);  
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
  
    // Create a file on Hedera and store the bytecode
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([myPrivateKey])
      .freezeWith(client);
    const fileCreateSign = await fileCreateTx.sign(myPrivateKey);
    const fileCreateSubmit = await fileCreateSign.execute(client);
    const fileCreateRx = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateRx.fileId;
    console.log(`- The bytecode file ID is: ${bytecodeFileId} \n`);
  
    //Append contents to the file
    const fileAppendTx = new FileAppendTransaction()
      .setFileId(bytecodeFileId)
      .setContents(byteCode)
      .freezeWith(client);
    const fileAppendSign = await fileAppendTx.sign(myPrivateKey);
    const fileAppendSubmit = await fileAppendSign.execute(client);
    const fileAppendRx = await fileAppendSubmit.getReceipt(client);
    console.log("Status of file append is", fileAppendRx.status.toString());
  
    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
      //Set the file ID of the Hedera file storing the bytecode
      .setBytecodeFileId(bytecodeFileId)
      //Set the gas to instantiate the contract
      .setGas(100000)
      //Provide the constructor parameters for the contract
      .setConstructorParameters();
  
    //Submit the transaction to the Hedera test network
    const contractResponse = await contractTx.execute(client);
  
    //Get the receipt of the file create transaction
    const contractReceipt = await contractResponse.getReceipt(client);
  
    //Get the smart contract ID
    const newContractId = contractReceipt.contractId;
  
    //Log the smart contract ID
    console.log("The smart contract ID is " + newContractId);
  }
  main();
