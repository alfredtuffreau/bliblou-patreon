const abi = require("../artifacts/contracts/Patreon.sol/Patreon.json");

async function getBalance(provider, address) {
    const balanceBigInt = await provider.getBalance(address);
    return hre.ethers.utils.formatEther(balanceBigInt);
}

task("withdraw", "Task to withdraw the smart contract account balance to the owner.")
    .setAction(async () => {
        const { hardhatArguments: { network }, ethers } = hre;
        const provider = (() => {
            switch( network ) {
                case "mainnet": return new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_PROD_KEY);
                case "goerli": return new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_STAGING_KEY);
                default: return ethers.provider;
            }
        })();
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const patreon = new ethers.Contract(process.env.BLIBLOU_PATREON_ADDRESS, abi.abi, signer);

        const ownerBalance = await getBalance(provider, signer.address);
        const contractBalance = await getBalance(provider, patreon.address);
        console.log("current balance of owner: ", ownerBalance, "ETH");
        console.log("current balance of contract: ", contractBalance, "ETH");

        if (contractBalance !== "0.0") {
            console.log("withdrawing funds..")
            const withdrawTxn = await patreon.withdrawSupports();
            await withdrawTxn.wait();
            console.log("new balance of owner: ", await getBalance(provider, signer.address), "ETH");
        } else {
            console.log("no funds to withdraw!");
        }
    });