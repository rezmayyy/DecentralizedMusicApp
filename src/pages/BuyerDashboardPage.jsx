import React, { useState, useEffect, useContext } from 'react';
import { Button, Card, Table, Spinner, Alert } from 'react-bootstrap';
import { Web3Context } from '../components/Web3Context';
import { useNavigate } from 'react-router-dom';

const BuyerDashboardPage = () => {
    const { web3, contract } = useContext(Web3Context);
    const [account, setAccount] = useState('');
    const [purchasedSongs, setPurchasedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            try {
                if (!web3 || !contract) return;

                // Get the buyer's account
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);

                // Fetch purchased songs for this account
                const allSongs = await fetchPurchasedSongs(accounts[0]);

                setPurchasedSongs(allSongs);
            } catch (err) {
                console.error(err);
                setError('Failed to load purchased songs.');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [web3, contract]);

    // Fetch purchased songs by the account
    const fetchPurchasedSongs = async (account) => {
        const latestSongId = await contract.methods.nextSongId().call();
        const songs = [];

        for (let i = 1; i < latestSongId; i++) {
            const purchased = await contract.methods.verifyPurchase(i, account).call();
            if (purchased) {
                const songDetails = await contract.methods.getSongDetails(i).call();
                songs.push({
                    id: i,
                    title: songDetails[0],
                    price: web3.utils.fromWei(songDetails[1], 'ether'),
                    ipfsHash: songDetails[2],
                    artist: songDetails[3],
                });
            }
        }

        return songs;
    };

    const handleDownload = (ipfsHash, title) => {
        if (!ipfsHash) {
            alert('IPFS hash is missing for this song!');
            return;
        }

        const url = `http://127.0.0.1:8080/ipfs/${ipfsHash}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <Spinner animation="border" variant="primary" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="m-4">
            <h2>Your Purchased Songs</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Song ID</th>
                        <th>Title</th>
                        <th>Price (ETH)</th>
                        <th>Artist</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {purchasedSongs.map((song) => (
                        <tr key={song.id}>
                            <td>{song.id}</td>
                            <td>{song.title}</td>
                            <td>{song.price}</td>
                            <td>{song.artist}</td>
                            <td>
                                <Button
                                    variant="success"
                                    onClick={() => handleDownload(song.ipfsHash, song.title)}
                                >
                                    Download Song
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button variant="link" onClick={() => navigate('/')}>
                ← Back to Home
            </Button>
        </div>
    );
};

export default BuyerDashboardPage;
