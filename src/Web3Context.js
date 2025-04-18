// Integrates MetaMask into React App. I think use this in a Navbar and wrap this around stuff in App.js

import React, { createContext, useEffect, useState } from 'react';
import Web3 from 'web3';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        window.ethereum.on('accountsChanged', accounts => setAccount(accounts[0]));
      } else {
        alert('Please install MetaMask!');
      }
    };

    init();
  }, []);

  return (
    <Web3Context.Provider value={{ web3, account }}>
      {children}
    </Web3Context.Provider>
  );
};
