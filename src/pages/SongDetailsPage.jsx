import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Spinner, Alert } from 'react-bootstrap';
import { Web3Context } from '../components/Web3Context';

const SongDetailsPage = () => {
    const { id } = useParams(); // get song ID from URL
    const navigate = useNavigate();
    const { contract, web3 } = useContext(Web3Context);

    const [account, setAccount] = useState('');
    const [song, setSong] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [purchased, setPurchased] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                if (!web3 || !contract) return;

                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);

                const details = await contract.methods.getSongDetails(id).call();
                const hasPurchased = await contract.methods.verifyPurchase(id, accounts[0]).call();

                setSong({
                    id,
                    title: details[0],
                    price: web3.utils.fromWei(details[1], 'ether'),
                    ipfsHash: details[2],
                    artist: details[3],
                    contributors: details[4].join(', '),
                    splits: details[5].join(', ')
                });

                setPurchased(hasPurchased);
            } catch (err) {
                console.error(err);
                setError('Failed to load song data.');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [web3, contract, id]);

    const handleBuy = async () => {
        try {
            const priceInWei = web3.utils.toWei(song.price.toString(), 'ether');

            await contract.methods.purchaseSong(id).send({
                from: account,
                value: priceInWei,
            });

            alert(`You purchased "${song.title}"`);
            setPurchased(true);
        } catch (err) {
            console.error('Purchase error:', err);
            alert('Failed to complete purchase.');
        }
    };

    const handleDownload = () => {
        if (!song.ipfsHash) return alert("Missing IPFS hash.");

        const url = `http://127.0.0.1:8080/ipfs/${song.ipfsHash}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = `${song.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <Spinner animation="border" variant="primary" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Card className="m-4 p-4 shadow">
            <h2>{song.title}</h2>
            <p><strong>Artist:</strong> {song.artist}</p>
            <p><strong>Contributors:</strong> {song.contributors}</p>
            <p><strong>Splits:</strong> {song.splits}</p>
            <p><strong>Price:</strong> {song.price} ETH</p>

            {purchased ? (
                <Button variant="success" onClick={() => navigate('/buyerdashboard')}>
                    Download at Buyer Dashboard
                </Button>
            ) : (
                <Button variant="primary" onClick={handleBuy}>
                    Buy Now
                </Button>
            )}


            <Button variant="link" className="mt-3" onClick={() => navigate(-1)}>
                ← Back
            </Button>
        </Card>
    );
};

export default SongDetailsPage;
