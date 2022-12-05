const fs = require('fs');
const path = require('path');
const { default: ArLocal } = require('arlocal');
const { LoggerFactory, WarpFactory } = require('warp-contracts');

// (async () => {
//   const arLocal = new ArLocal(1985, false);
//   await arLocal.start();

//   LoggerFactory.INST.logLevel('info');

//   const warp = WarpFactory.forLocal(1985);

//   // note: warp.testing.generateWallet() automatically adds funds to the wallet
//   ({ jwk: wallet, address: walletAddress } =
//     await warp.testing.generateWallet());

//   contractSrc = fs.readFileSync(path.join(__dirname, '../contract.js'), 'utf8');
//   initialState = fs.readFileSync(
//     path.join(__dirname, '../initial-state.json'),
//     'utf8'
//   );

//   const contractTxId = await warp.createContract.deploy({
//     wallet,
//     initState: initialState,
//     src: contractSrc,
//   });

//   await warp.testing.mineBlock();

//   const contract = warp.contract(contractTxId).connect(wallet);
//   const { cachedValue } = await contract.readState();
//   console.log('State before any interactions');
//   console.dir(cachedValue.state, { depth: null });

//   await contract.writeInteraction({
//     function: 'helloWrite',
//     name: 'Hi there',
//   });

//   const stateAfterInteraction = await contract.readState();
// console.log('State after 1 interaction');
// console.dir(stateAfterInteraction.cachedValue.state, {depth: null});

// await arLocal.stop();
// })();

describe('Testing Hello contract', () => {
  let arLocal, warp, wallet, contractSrc, initialState, contractId, contract;
  beforeAll(async () => {
    // Set up ArLocal
    arLocal = new ArLocal(1985, false);
    await arLocal.start();

    // Set up Warp client
    LoggerFactory.INST.logLevel('info');
    warp = WarpFactory.forLocal(1985);

    // note: warp.testing.generateWallet() automatically adds funds to the wallet
    ({ jwk: wallet } = await warp.testing.generateWallet());

    // Deploying contract
    contractSrc = fs.readFileSync(path.join(__dirname, '../contract.js'), 'utf8');
    initialState = fs.readFileSync(path.join(__dirname, '../initial-state.json'), 'utf8');
    ({ contractTxId: contractId } = await warp.createContract.deploy({
      wallet,
      initState: JSON.stringify(initialState),
      src: contractSrc,
    }));
    console.log(contractId);
    contract = warp.contract(contractId).connect(wallet);
  });

  afterAll(async () => {
    await arLocal.stop();
  });

  it('should properly deploy contract', async () => {
    const contractTx = await warp.arweave.transactions.get(contractId);

    expect(contractTx).not.toBeNull();
  });

  it('should read Hello state', async () => {
    expect((await contract.readState()).cachedValue.state).toEqual(initialState);
  });
});

// (async () => {
//   let arLocal;
//   try {
//     // Set up ArLocal
//     arLocal = new ArLocal(1985, false);
//     await arLocal.start();

//     // Set up Warp client
//     LoggerFactory.INST.logLevel('info');
//     const warp = WarpFactory.forLocal(1985);

//     let wallet;
//     // note: warp.testing.generateWallet() automatically adds funds to the wallet
//     ({ jwk: wallet } = await warp.testing.generateWallet());

//     // Deploying contract
//     contractSrc = fs.readFileSync(
//       path.join(__dirname, '../contract.js'),
//       'utf8'
//     );
//     initialState = fs.readFileSync(
//       path.join(__dirname, '../initial-state.json'),
//       'utf8'
//     );
//     const { contractTxId } = await warp.createContract.deploy({
//       wallet,
//       initState: initialState,
//       src: contractSrc,
//     });
//     // note: we need to mine block in ArLocal - so that contract deployment transaction was mined.
//     await warp.testing.mineBlock();

//     // Interacting with the contract
//     const contract = warp
//       .contract(contractTxId)
//       .setEvaluationOptions({ allowBigInt: true })
//       .connect(wallet);

//     // Read state
//     const { cachedValue } = await contract.readState();
//     console.log('State before any interactions');
//     console.dir(cachedValue.state, { depth: null });

//     // Write interaction
//     console.log("Sending 'generate' interaction...");
//     // note: if Warp instance is created with 'forLocal' - the writeInteraction method
//     // automatically mines a new block - so that you won't have to do it manually in your tests.
//     // if you want to switch off automatic mining - set evaluationOptions.mineArLocalBlocks to false, e.g.
//     // contract.setEvaluationOptions({ mineArLocalBlocks: false })
//     await contract.writeInteraction({
//       function: 'helloWrite',
//       name: 'Hi there',
//     });
//     console.log('Interaction has been sent');

//     // Read state after interaction
//     const stateAfterInteraction = await contract.readState();
//     console.log('State after 1 interaction');
//     console.dir(stateAfterInteraction.cachedValue.state, { depth: null });

//     // Getting the final state
//     console.log(`Getting final state`);
//     const finalState = await contract.readState();
//     console.dir(finalState.cachedValue.state, { depth: null });
//   } finally {
//     // Shutting down ArLocal
//     await arLocal.stop();
//   }
// })();

// describe('Testing the contract', () => {
//   let contractSrc,
//     initialState,
//     wallet,
//     arlocal,
//     warp,
//     contract,
//     walletAddress;

// //   let asset = '';

// //   const MOCK_ADDRESS = '0x1234',
// //     MOCK_ADDRESS_2 = '0x5678';

//   beforeAll(async () => {
//     arlocal = new ArLocal(1985, false);
//     await arlocal.start();

//     LoggerFactory.INST.logLevel('info');

//     // note: creating a "Warp" instance for local testing environment.
//     warp = WarpFactory.forLocal(1985);

//     // note: warp.testing.generateWallet() automatically adds funds to the wallet
//     ({jwk: wallet, address: walletAddress} = await warp.testing.generateWallet());

//     contractSrc = fs.readFileSync(
//       path.join(__dirname, '../contract.js'),
//       'utf8'
//     );
//     initialState = fs.readFileSync(
//       path.join(__dirname, '../initial-state.json'),
//       'utf8'
//     );

//     const {contractTxId} = await warp.createContract.deploy({
//       wallet,
//       initState: initialState,
//       src: contractSrc,
//     });

//     contract = warp.contract(contractTxId).connect(wallet);

//     // note: we need to mine block in ArLocal - so that contract deployment transaction was mined.
//     await warp.testing.mineBlock();
//     afterAll(async () => {
//       await arlocal.stop();
//     });
//   });

//   it('Should create message', async () => {
//       await contract.writeInteraction({
//           function: 'helloWrite',
//           name: 'Hi there'
//       })
//   });

// });
