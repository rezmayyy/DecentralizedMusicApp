import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { create as createIpfsClient } from 'ipfs-http-client';
import Web3 from 'web3';
import { Web3Context } from '../components/Web3Context';

// point at your local go-ipfs daemon
const ipfs = createIpfsClient({ url: 'http://127.0.0.1:5001/api/v0' });

function BuyerDashboardPage() {
  const { web3, account, contract, error } = useContext(Web3Context);
  const [purchases, setPurchases] = useState([]);
  const [txHistory, setTxHistory] = useState([]);
  const [earnings, setEarnings] = useState('0');

  // Data loading effect
  useEffect(() => {
    if (!web3 || !account || !contract) return;
    const loadData = async () => {
      try {
        // fetch purchase events
        const events = await contract.getPastEvents('SongPurchasedBy', {
          filter: { buyer: account },
          fromBlock: 0,
          toBlock: 'latest'
        });

        // dedupe song IDs
        const ids = Array.from(new Set(events.map(e => parseInt(e.returnValues.songId, 10))));

        // load purchased songs
        const bought = await Promise.all(
          ids.map(async id => {
            const { title, ipfsHash } = await contract.methods.getSongDetails(id).call();
            return { id, title, ipfsHash };
          })
        );
        setPurchases(bought);

        // build transaction history
        const historyData = await Promise.all(
          events.map(async evt => {
            const songId = parseInt(evt.returnValues.songId, 10);
            const block = await web3.eth.getBlock(evt.blockNumber);
            const details = await contract.methods.getSongDetails(songId).call();
            return {
              date: new Date(block.timestamp * 1000).toLocaleDateString(),
              title: details.title,
              amount: Web3.utils.fromWei(details.price, 'ether')
            };
          })
        );
        setTxHistory(historyData);

        // fetch pending earnings
        const bal = await contract.methods.balances(account).call();
        setEarnings(Web3.utils.fromWei(bal, 'ether'));
      } catch (err) {
        console.error('Load data failed:', err);
      }
    };

    loadData();
  }, [contract, account, web3]);

  // Guard for Web3 connection
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  if (!web3 || !account || !contract) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" /> Connecting to blockchain…
      </Container>
    );
  }

  const handleWithdraw = async () => {
    try {
      const tx = contract.methods.withdrawFunds();
      const gas = await tx.estimateGas({ from: account });
      const gasPrice = await web3.eth.getGasPrice();
      await tx.send({ from: account, gas, gasPrice });
      setEarnings('0');
      alert('Withdraw successful!');
    } catch (err) {
      console.error('Withdrawal failed:', err);
      alert('Withdrawal failed');
    }
  };

  const handleDownload = async (cid, filename) => {
    try {
      const chunks = [];
      for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('IPFS download failed:', err);
      alert('Download failed');
    }
  };

  return (
    <Container>
      <h1 className="my-4">Buyer Dashboard</h1>

      <section>
        <h2>Your Purchased Songs</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Song Title</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              purchases.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.title}</td>
                  <td>
                    <Button
                      variant="link"
                      onClick={() => handleDownload(p.ipfsHash, p.title)}
                    >
                      Download
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center">
                  You haven’t purchased any songs yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </section>

      <section className="mt-5">
        <h2>Transaction History</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Song</th>
              <th>Paid (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {txHistory.length > 0 ? (
              txHistory.map((h, i) => (
                <tr key={i}>
                  <td>{h.date}</td>
                  <td>{h.title}</td>
                  <td>{h.amount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No transaction history found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </section>

      <section className="mt-5">
        <h2>Your Earnings*</h2>
        <p>
          Pending balance: <b>{earnings} ETH</b>{' '}
          {parseFloat(earnings) > 0 && (
            <Button variant="outline-success" size="sm" onClick={handleWithdraw}>
              Withdraw
            </Button>
          )}
        </p>
        <small className="text-muted">*Producers only</small>
      </section>
    </Container>
  );
}

export default BuyerDashboardPage;
