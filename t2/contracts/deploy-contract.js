const fs = require("fs");
const path = require("path");
const { WarpFactory } = require("warp-contracts");
const jwk = require("../../.secrets/jwk.json");

(async () => {
  const contractSrc = fs.readFileSync(path.join(__dirname, "./contract.js"), "utf8");
  const initialState = fs.readFileSync(path.join(__dirname, "./initial-state.json"), "utf8");

  const warp = WarpFactory.forMainnet();

  console.log("Deployment started");
  const result = await warp.createContract.deploy({
    wallet: jwk,
    initState: initialState,
    src: contractSrc,
  });

  console.log("Deployment completed: ", {
    ...result,
    sonar: `https://sonar.warp.cc/#/app/contract/${result.contractTxId}`
  });
})();