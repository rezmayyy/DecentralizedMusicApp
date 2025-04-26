import React, { useState, useEffect, useContext } from 'react';
import { Button, Table, Container } from 'react-bootstrap';
import { Web3Context } from '../components/Web3Context';
import '../theme.css'; // <-- global theme

function TestPage() {
    const { contract, web3 } = useContext(Web3Context);
    const [songs, setSongs] = useState([]);
    const [nextSongId, setNextSongId] = useState(1);
    const [account, setAccount] = useState('');

    useEffect(() => {
        const init = async () => {
            if (web3) {
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);
            }
        };
        init();
    }, [web3]);

    useEffect(() => {
        if (contract && web3 && account) {
            fetchAllSongs();
        }
    }, [contract, web3, account]);

    const fetchAllSongs = async () => {
        if (!contract || !web3 || !account) return;

        try {
            const latest = await contract.methods.nextSongId().call();
            setNextSongId(latest);

            const allSongs = [];
            for (let i = 1; i < latest; i++) {
                const song = await contract.methods.getSongDetails(i).call();
                const purchased = await contract.methods.verifyPurchase(i, account).call();

                const songData = {
                    id: i,
                    title: song[0],
                    price: web3.utils.fromWei(song[1], 'ether'),
                    artist: song[3],
                    contributors: song[4].join(', '),
                    splits: song[5].join(', '),
                    ipfsHash: song[2],
                    purchased,
                };

                console.log(`Song ${i}:`, songData);
                allSongs.push(songData);
            }
            setSongs(allSongs);
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    };

    const handleBuy = async (songId, priceInEth) => {
        try {
            const priceInWei = web3.utils.toWei(priceInEth.toString(), 'ether');
            const accounts = await web3.eth.getAccounts();

            await contract.methods.purchaseSong(songId).send({
                from: accounts[0],
                value: priceInWei
            });

            alert(`Successfully purchased song #${songId}`);
            fetchAllSongs();
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Failed to purchase song. Check console.');
        }
    };

    const handleDownload = (ipfsHash, title) => {
        if (!ipfsHash) {
            alert("IPFS hash is missing for this song!");
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

    return (
        <Container className="homepage-container">
            <h2>All Songs on Blockchain</h2>
            <Table striped bordered hover responsive className="app-card">
                <thead>
                    <tr>
                        <th>Song ID</th>
                        <th>Title</th>
                        <th>Price (ETH)</th>
                        <th>Artist</th>
                        <th>Contributors</th>
                        <th>Splits (%)</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {songs.map((song, index) => (
                        <tr key={index}>
                            <td>{song.id}</td>
                            <td>{song.title}</td>
                            <td>{song.price}</td>
                            <td>{song.artist}</td>
                            <td>{song.contributors}</td>
                            <td>{song.splits}</td>
                            <td>
                                {song.purchased ? (
                                    <Button
                                        variant="success"
                                        className="app-btn"
                                        onClick={() => handleDownload(song.ipfsHash, song.title)}
                                    >
                                        Download
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        className="app-btn"
                                        onClick={() => handleBuy(song.id, song.price)}
                                    >
                                        Buy Song
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button onClick={fetchAllSongs} className="app-btn btn-secondary">Refresh Songs</Button>
        </Container>
    );
}

export default TestPage;
