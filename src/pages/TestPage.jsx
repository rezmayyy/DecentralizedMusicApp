import React, { useState, useEffect, useContext } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Web3Context } from '../components/Web3Context'; 

function TestPage() {
    const { contract, web3 } = useContext(Web3Context);
    const [songs, setSongs] = useState([]);
    const [nextSongId, setNextSongId] = useState(1);

    // Fetch all songs
    const fetchAllSongs = async () => {
        if (!contract) return;

        try {
            const latestSongId = await contract.methods.nextSongId().call();
            setNextSongId(latestSongId);

            const allSongs = [];
            for (let i = 1; i < latestSongId; i++) {
                const song = await contract.methods.getSongDetails(i).call();
                allSongs.push({
                    id: i,
                    title: song[0],
                    price: web3.utils.fromWei(song[1], 'ether'),
                    contributors: song[4].join(', '),
                    splits: song[5].join(', ')
                });
            }
            setSongs(allSongs);
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    };

    useEffect(() => {
        fetchAllSongs();
    }, [contract]);

    return (
        <div>
            <h2>All Songs on Blockchain</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Song ID</th>
                        <th>Title</th>
                        <th>Price (ETH)</th>
                        <th>Contributors</th>
                        <th>Splits (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {songs.map((song, index) => (
                        <tr key={index}>
                            <td>{song.id}</td>
                            <td>{song.title}</td>
                            <td>{song.price}</td>
                            <td>{song.contributors}</td>
                            <td>{song.splits}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button onClick={fetchAllSongs}>Refresh Songs</Button>
        </div>
    );
}

export default TestPage;
