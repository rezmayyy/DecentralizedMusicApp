import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import Web3 from 'web3';
import { Web3Context } from '../components/Web3Context';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const { contract, account, web3, blockNumber } = useContext(Web3Context);
  const [songs, setSongs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!contract) return;
      const nextId = await contract.methods.nextSongId().call();
      const list = [];
      for (let i = 1; i < nextId; i++) {
        const base = await contract.methods.songs(i).call();
        if (!base.ipfsHash) continue;
        const [ title, priceWei, ipfsHash, artist, contributors, splits ] =
          await contract.methods.getSongDetails(i).call();
        const bought = account ? await contract.methods.verifyPurchase(i, account).call() : false;

        list.push({
          id: i,
          title,
          priceWei,
          priceEth: Web3.utils.fromWei(priceWei, 'ether'),
          ipfsHash,
          artist,
          contributors,
          splits,
          bought
        });
      }
      setSongs(list);
    };

    load();
  }, [contract, account, web3, blockNumber]);

  const handleBuy = async song => {
    await contract.methods.purchaseSong(song.id)
      .send({ from: account, value: song.priceWei });
      navigate('/buyerdashboard');
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
            <tr><td colSpan={5} className="text-center">No songs available.</td></tr>
          )}
          {songs.map(s => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>
                {s.artist.substring(0,6)}…{s.artist.slice(-4)}
                {s.artist.toLowerCase() === account?.toLowerCase() && (
                  <Badge bg="secondary" className="ms-1">You</Badge>
                )}
              </td>
              <td>{s.priceEth} ETH</td>
              <td>
                {s.contributors.length
                  ? s.contributors.map((c,i) =>
                      <div key={i}>
                        {c.substring(0,6)}…{c.slice(-4)} ({s.splits[i]}%)
                      </div>
                    )
                  : <em>—</em>
                }
              </td>
              <td>
                {s.bought
                  ? <Button disabled variant="success">
                      Purchased
                    </Button>
                  : <Button onClick={() => handleBuy(s)} disabled={!account}>
                      Buy
                    </Button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default HomePage;
