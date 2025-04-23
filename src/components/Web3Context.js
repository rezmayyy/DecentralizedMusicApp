import React, { createContext, useState, useEffect } from "react";
import Web3 from "web3";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);

    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setAccount(accounts[0]);

		    const contractABI = require('../contracts/MyTunes.json').abi;
		    const contractAddress = "0x821Ca0C316F7e47982A5B31d5C71eCe2aF13fEde";
                    const deployedContract = new web3Instance.eth.Contract(contractABI, contractAddress);
                    setContract(deployedContract);

                } catch (error) {
                    console.error("User denied MetaMask connection", error);
                }
            } else {
                alert("MetaMask not detected. Please install MetaMask.");
            }
        };

        init();
    }, []);

    return (
        <Web3Context.Provider value={{ web3, account, contract }}>
            {children}
        </Web3Context.Provider>
    );
};

export default Web3Provider;
