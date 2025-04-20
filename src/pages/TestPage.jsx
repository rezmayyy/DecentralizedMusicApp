import React, { useState, useContext } from 'react';
import { Web3Context } from '../components/Web3Context.js';

function TestPage() {
    const { contract, account, web3 } = useContext(Web3Context);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpload = async () => {
        setError(null);

        if (!contract || !account || !web3) {
            setError("Web3, account, or contract not loaded.");
            return;
        }

        const title = "Test Song";
        const priceInWei = web3.utils.toWei("0.01", "ether");
        const ipfsHash = "QmTestHash123456"; // dummy IPFS hash
        const contributors = [account]; // testing with self
        const splits = [100]; // 100% to self

        console.log("Uploading with:", { title, priceInWei, ipfsHash, contributors, splits });

        try {
            setLoading(true);

            const methodCall = contract.methods.uploadSong(title, priceInWei, ipfsHash, contributors, splits);
            console.log("Method encoded:", methodCall.encodeABI());

            await methodCall.send({ from: account })
                .on("transactionHash", (hash) => {
                    console.log("Transaction Hash:", hash);
                })
                .on("receipt", (receipt) => {
                    console.log("Transaction Receipt:", receipt);
                })
                .on("error", (err) => {
                    console.error("Transaction Error:", err);
                    setError("Transaction failed: " + err.message);
                });
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Upload failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Smart Contract Test</h2>
            <button onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload Test Song"}
            </button>

            {error && (
                <div style={{ marginTop: 20, color: 'red' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}
        </div>
    );
}

export default TestPage;
