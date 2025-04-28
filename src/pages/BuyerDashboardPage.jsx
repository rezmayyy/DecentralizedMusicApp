// src/pages/BuyerDashboardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Button, Table, Spinner, Alert, Container } from 'react-bootstrap';
import { Web3Context } from '../components/Web3Context';
import { useNavigate } from 'react-router-dom';
import '../theme.css';  // <-- ensure your new theme is loaded

const BuyerDashboardPage = () => {
    const { web3, contract } = useContext(Web3Context);
    const [account, setAccount] = useState('');
    const [purchasedSongs, setPurchasedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateBought, setDateBought] = useState({});

    const navigate = useNavigate();

    const formatDate = (ts) => {
        const secs = Number(ts);
        const d    = new Date(secs * 1000);
        const mm   = d.getMonth() + 1;
        const dd   = d.getDate();
        const yyyy = d.getFullYear();
        let   hh   = d.getHours();
        const mins = String(d.getMinutes()).padStart(2, '0');
        const ampm = hh >= 12 ? 'pm' : 'am';
        hh = hh % 12 || 12;
        return `${mm}/${dd}/${yyyy} ${hh}:${mins}${ampm}`;
    };

    useEffect(() => {
        const init = async () => {
            try {
                if (!web3 || !contract) return;

                // Get the buyer's account
                const accounts = await web3.eth.getAccounts();
                const buyer = accounts[0];
                setAccount(buyer);

                // Fetch purchased songs for this account
                const allSongs = await fetchPurchasedSongs(buyer);
                setPurchasedSongs(allSongs);

                const topic0 = web3.utils.sha3('SongPurchasedBy(uint256,address)');
                const topicBuyer = web3.eth.abi.encodeParameter('address', buyer);

                const logs = await web3.eth.getPastLogs({
                    address: contract.options.address,
                    fromBlock: 0,
                    toBlock:'latest',
                    topics: [topic0, null, topicBuyer]
                });

                const map = {};
                for (let log of logs) {
                    const songId = web3.eth.abi.decodeParameter('uint256', log.topics[1]);
                    const id = Number(songId);
                    const block = await web3.eth.getBlock(Number(log.blockNumber));
                    map[id] = formatDate(block.timestamp);
                }
                setDateBought(map);
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
                const details = await contract.methods.getSongDetails(i).call();
                songs.push({
                    id: i,
                    title: details[0],
                    price: web3.utils.fromWei(details[1], 'ether'),
                    ipfsHash: details[2],
                    artist: details[3],
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

    if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

    return (
        <Container className="buyer-dashboard-container">
            <h2 className="mb-4">Your Purchased Songs</h2>

            <Table striped bordered hover responsive className="app-card">
                <thead>
                    <tr>
                        <th>Song ID</th>
                        <th>Title</th>
                        <th>Price (ETH)</th>
                        <th>Artist</th>
                        <th>Date Bought</th>
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
                            <td>{dateBought[song.id] || '—'}</td>
                            <td>
                                <Button
                                    variant="success"
                                    className="app-btn"
                                    onClick={() => handleDownload(song.ipfsHash, song.title)}
                                >
                                    Download Song
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Button
                variant="link"
                className="mt-3"
                onClick={() => navigate('/')}
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}
            >
                ← Back to Home
            </Button>
        </Container>
    );
};

export default BuyerDashboardPage;
