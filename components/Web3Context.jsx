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

                    // Replace with your actual contract ABI and address
                    const contractABI = []; // TODO: paste your ABI here
                    const contractAddress = "0xYourContractAddress"; // TODO: replace this

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
