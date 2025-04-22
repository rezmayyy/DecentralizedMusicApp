import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import Web3 from 'web3';
import { Web3Context } from '../components/Web3Context';

function BuyerDashboardPage() {
  const { contract, account, web3 } = useContext(Web3Context);
  const [purchases, setPurchases] = useState([]);
  const [txHistory, setTxHistory] = useState([]);
  const [earnings, setEarnings] = useState('0');

  useEffect(() => {
    const loadData = async () => {
      if (!contract || !account) return;
      const count = await contract.methods.nextSongId().call();
      const bought = [];
      for (let i = 1; i < count; i++) {
        const has = await contract.methods.verifyPurchase(i, account).call();
        if (!has) continue;
        const s = await contract.methods.getSongDetails(i).call();
        bought.push({
          id: i,
          title: s.title,
          ipfsHash: s.ipfsHash,
          priceWei: s.price
        });
      }
      setPurchases(bought);

      const events = await contract.getPastEvents('SongPurchasedBy', {
        filter: { buyer: account },
        fromBlock: 0,
        toBlock: 'latest'
      });

      const historyData = await Promise.all(events.map(async (evt) => {
        const songId = evt.returnValues.songId;
        const block  = await web3.eth.getBlock(evt.blockNumber);
        const s      = await contract.methods.getSongDetails(songId).call();
        return {
          date:   new Date(block.timestamp * 1000).toLocaleDateString(),
          title:  s.title,
          amount: Web3.utils.fromWei(s.price, 'ether')
        };
      }));
      setTxHistory(historyData);

      // Load contributor earnings if buyer is also a producer
      const bal = await contract.methods.balances(account).call();
      setEarnings(Web3.utils.fromWei(bal, 'ether'));
    };

    loadData();
  }, [contract, account, web3]);

  const handleWithdraw = async () => {
    try {
      await contract.methods.withdrawFunds().send({ from: account });
      setEarnings('0');
      alert('Withdraw successful!');
    } catch (err) {
      console.error(err);
      alert('Withdrawal failed');
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
                    <a
                      href={`https://ipfs.io/ipfs/${p.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
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
        <h2>Your Earnings</h2>
        <p>
          Pending balance: <b>{earnings} ETH</b>{' '}
          {parseFloat(earnings) > 0 && (
            <Button variant="outline-success" size="sm" onClick={handleWithdraw}>
              Withdraw
            </Button>
          )}
        </p>
      </section>
    </Container>
  );
}

export default BuyerDashboardPage;