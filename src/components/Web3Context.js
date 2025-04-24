// src/components/Web3Context.js
import React, { createContext, useState, useEffect } from "react";
import Web3 from "web3";
import MyTunes from "../contracts/MyTunes.json";  // <— import your Truffle artifact

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3,    setWeb3]    = useState(null);
  const [account, setAccount]= useState(null);
  const [contract,setContract]= useState(null);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    async function init() {
      try {
        // 1) Connect to Ganache RPC
        const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
        const w3 = new Web3(provider);
        setWeb3(w3);

        // 2) Pull unlocked Ganache accounts
        const accts = await w3.eth.getAccounts();
        if (!accts || accts.length === 0) {
          setError("No accounts found on http://127.0.0.1:8545");
          return;
        }
        setAccount(accts[0]);

        // 3) Figure out network and deployed address
        const networkId = await w3.eth.net.getId();
        const deployed  = MyTunes.networks[networkId];
        if (!deployed || !deployed.address) {
          setError(`MyTunes not deployed on network ${networkId}`);
          return;
        }

        // 4) Instantiate contract
        const inst = new w3.eth.Contract(MyTunes.abi, deployed.address);
        setContract(inst);
      } catch (err) {
        console.error("Web3Context initialization error:", err);
        setError("Failed to initialize Web3 or load contract");
      }
    }

    init();
  }, []);

  return (
    <Web3Context.Provider value={{ web3, account, contract, error }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
