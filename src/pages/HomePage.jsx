import React, { useState, useEffect, useContext } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Web3Context } from '../components/Web3Context';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function HomePage() {
  const { contract, web3 } = useContext(Web3Context);
  const [songs, setSongs] = useState([]);
  const [account, setAccount] = useState('');
  const navigate = useNavigate();

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
    try {
      const latestSongId = await contract.methods.nextSongId().call();
      const allSongs = [];

      for (let i = 1; i < latestSongId; i++) {
        const song = await contract.methods.getSongDetails(i).call();
        const songData = {
          id: i,
          title: song[0],
          price: web3.utils.fromWei(song[1], 'ether'),
          artist: song[3],
          contributors: song[4].join(', '),
          splits: song[5].join(', ')
        };
        allSongs.push(songData);
      }
      setSongs(allSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const goToSongPage = (id) => {
    navigate(`/song/${id}`);
  };

  return (
    <div>
      <h2>All Songs on Blockchain</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Song ID</th>
            <th>Title</th>
            <th>Price (ETH)</th>
            <th>Artist</th>
            <th>Contributors</th>
            <th>Splits (%)</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
            <tr key={song.id}>
              <td>{song.id}</td>
              <td>{song.title}</td>
              <td>{song.price}</td>
              <td>{song.artist}</td>
              <td>{song.contributors}</td>
              <td>{song.splits}</td>
              <td>
                <Link to={`/songs/${song.id}`}>
                  <Button variant="info">View Song</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button onClick={fetchAllSongs}>Refresh Songs</Button>
    </div>
  );
}

export default HomePage;
