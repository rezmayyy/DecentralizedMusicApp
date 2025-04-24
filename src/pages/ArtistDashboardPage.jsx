import React, { useState, useContext } from 'react';
import { Form, Button, Table, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { create as createIpfsClient } from 'ipfs-http-client';
import { Web3Context } from '../components/Web3Context';

// point at your local go-ipfs daemon
const ipfs = createIpfsClient({ url: 'http://127.0.0.1:5001/api/v0' });

function ArtistDashboardPage() {
  const { web3, account, contract, error } = useContext(Web3Context);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [contributor, setContributor] = useState('');
  const [split, setSplit] = useState('');
  const [contributors, setContributors] = useState([]);

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

  const handleAddContributor = () => {
    if (!contributor || !split) return;
    setContributors(prev => [...prev, { address: contributor, split: parseInt(split, 10) }]);
    setContributor('');
    setSplit('');
  };

  const handleRemoveContributor = index => {
    setContributors(cs => cs.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select an audio file to upload.');
      return;
    }

    try {
      // 1) Pin to your local IPFS daemon
      const { path: ipfsHash } = await ipfs.add(file);

      // 2) Prepare on-chain args
      const addresses = contributors.map(c => c.address);
      const splitsArr = contributors.map(c => c.split);
      const priceInWei = web3.utils.toWei(price, 'ether');

      // 3) Estimate gas for the transaction
      const tx = contract.methods.uploadSong(title, priceInWei, ipfsHash, addresses, splitsArr);
      const gas = await tx.estimateGas({ from: account });
      const gasPrice = await web3.eth.getGasPrice();

      // 4) Send transaction with explicit gas and gasPrice
      await tx.send({ from: account, gas, gasPrice });

      alert('Song uploaded successfully!');

      // 5) Reset form
      setTitle('');
      setPrice('');
      setFile(null);
      setContributors([]);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. See console for details.');
    }
  };

  return (
    <Container>
      <h1 className="my-4">Artist Dashboard</h1>

      <section>
        <h2>Upload Your Music</h2>
        <Form>
          <Form.Group controlId="songName">
            <Form.Label>Song Name</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="price">
            <Form.Label>Price Per Download (ETH)</Form.Label>
            <Form.Control
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="fileUpload">
            <Form.Label>Audio File</Form.Label>
            <Form.Control
              type="file"
              accept="audio/*"
              onChange={e => setFile(e.target.files[0])}
            />
          </Form.Group>

          <Button variant="primary" className="mt-3" onClick={handleUpload}>
            Upload Song
          </Button>
        </Form>
      </section>

      <section className="mt-5">
        <h2>Revenue Splits</h2>
        <Row>
          <Col>
            <Form.Control
              type="text"
              placeholder="Contributor address"
              value={contributor}
              onChange={e => setContributor(e.target.value)}
            />
          </Col>
          <Col>
            <Form.Control
              type="number"
              placeholder="% split"
              value={split}
              onChange={e => setSplit(e.target.value)}
            />
          </Col>
          <Col>
            <Button onClick={handleAddContributor}>Add</Button>
          </Col>
        </Row>

        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Address</th>
              <th>Split (%)</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {contributors.map((c, i) => (
              <tr key={i}>
                <td>{c.address}</td>
                <td>{c.split}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveContributor(i)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="mt-5">
        <h2>Earnings & History</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Song</th>
              <th>Earnings (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {/* Placeholder—you can wire this up to on-chain events */}
            <tr>
              <td>2025-04-08</td>
              <td>My Song</td>
              <td>0.05</td>
            </tr>
          </tbody>
        </Table>
      </section>
    </Container>
  );
}

export default ArtistDashboardPage;