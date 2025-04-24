import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import Web3 from 'web3';
import { Web3Context } from '../components/Web3Context';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const { contract, account, web3, error } = useContext(Web3Context);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!contract) return;
    const loadSongs = async () => {
      setLoading(true);
      try {
        const nextId = await contract.methods.nextSongId().call();
        const list = [];
        for (let i = 1; i < nextId; i++) {
          // retrieve song struct directly as an object
          const details = await contract.methods.getSongDetails(i).call();
          if (!details.ipfsHash) continue;
          const bought = account
            ? await contract.methods.verifyPurchase(i, account).call()
            : false;

          list.push({
            id: i,
            title: details.title,
            priceWei: details.price,
            priceEth: Web3.utils.fromWei(details.price, 'ether'),
            ipfsHash: details.ipfsHash,
            artist: details.artist,
            contributors: details.contributors,
            splits: details.splits,
            bought,
          });
        }
        setSongs(list);
      } catch (err) {
        console.error('Failed to load songs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSongs();
  }, [contract, account, web3]);

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  if (!contract || loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <span className="ms-2">Loading marketplace…</span>
      </Container>
    );
  }

  const handleBuy = async (song) => {
    try {
      const tx = contract.methods.purchaseSong(song.id);
      const gas = await tx.estimateGas({ from: account, value: song.priceWei });
      const gasPrice = await web3.eth.getGasPrice();
      await tx.send({ from: account, value: song.priceWei, gas, gasPrice });
      navigate('/buyerdashboard');
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Purchase failed.');
    }
  };

  return (
    <Container>
      <h1 className="my-4">Song Marketplace</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Song</th>
            <th>Artist</th>
            <th>Price (ETH)</th>
            <th>Contributors</th>
            <th>Buy Now</th>
          </tr>
        </thead>
        <tbody>
          {songs.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center">
                No songs available.
              </td>
            </tr>
          )}
          {songs.map((s) => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>
                {s.artist.substring(0, 6)}…{s.artist.slice(-4)}
                {s.artist.toLowerCase() === account?.toLowerCase() && (
                  <Badge bg="secondary" className="ms-1">
                    You
                  </Badge>
                )}
              </td>
              <td>{s.priceEth} ETH</td>
              <td>
                {s.contributors.length > 0 ? (
                  s.contributors.map((c, i) => (
                    <div key={i}>
                      {c.substring(0, 6)}…{c.slice(-4)} ({s.splits[i]}%)
                    </div>
                  ))
                ) : (
                  <em>—</em>
                )}
              </td>
              <td>
                {s.bought ? (
                  <Button disabled variant="success">
                    Purchased
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleBuy(s)}
                    disabled={!account}
                  >
                    Buy
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default HomePage;
