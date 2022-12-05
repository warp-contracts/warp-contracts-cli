import { useState, useEffect } from 'react';
import { WarpFactory, defaultCacheOptions } from 'warp-contracts/web';
import './App.css';

const warp = WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true });
const contractId = 'N4G1F2ftAbArKpS5iHjPSuOY7GMQvyiEIcS-W4CVLbk';

const getContract = async () => {
  const wallet = await warp.arweave.wallets.generate();
  const contract = await warp.contract(contractId).connect(wallet);

  return contract;
};

const getState = async (contract) => {
  const { cachedValue } = await contract.readState();
  const state = cachedValue.state;
  return state;
};

function App() {
  const [contractState, setContractState] = useState({});
  const [name, setName] = useState('');

  useEffect(() => {
    async function fetchContractData() {
      const contract = await getContract();
      const state = await getState(contract);
      setContractState((prevState) => ({ ...prevState, state }));
    }
    fetchContractData();
  }, []);

  const addContent = async (e) => {
    e.preventDefault();
    if (!name) {
      return;
    } else {
      const contract = await getContract();
      await contract.writeInteraction({
        function: 'helloWrite',
        name: name,
      });
      const state = await getState(contract);
      setContractState((prevState) => ({ ...prevState, state }));
      setName('');
    }
  };
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  return (
    <div className="App">
      <div className="name-input">
        <form onSubmit={addContent}>
          <label htmlFor="name">Name: </label>
          <input
            placeholder="Type your name.."
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleNameChange}
          />
          <button type="submit">Add</button>
        </form>
      </div>
      {contractState.state && (
        <div className="state-content">
          {Object.keys(contractState.state).map((keyName) => (
            <p key={keyName}>
              {keyName} said: {contractState.state[keyName]}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
