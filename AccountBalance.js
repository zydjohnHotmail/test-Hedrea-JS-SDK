const {  AccountBalanceQuery, LocalProvider, Wallet } = require("@hashgraph/sdk");
const dotenv = require("dotenv");
  
dotenv.config();

async function main() {
    if (process.env.OPERATOR_ID == null || process.env.OPERATOR_KEY == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const wallet = new Wallet(
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY,
        new LocalProvider()
    );

    const balance = await new AccountBalanceQuery()
        .setAccountId(wallet.getAccountId())
        .executeWithSigner(wallet);

    console.log(
        `${wallet
            .getAccountId()
            .toString()} balance = ${balance.hbars.toString()}`
    );
}

void main();

setTimeout(() => {
    process.exit(0);
}, 3000);
