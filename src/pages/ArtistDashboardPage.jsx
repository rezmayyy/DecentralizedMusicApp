import React, { useState } from 'react';
import { Form, Button, Table, Container, Row, Col } from 'react-bootstrap';

function ArtistDashboardPage() {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [contributor, setContributor] = useState('');
    const [split, setSplit] = useState('');
    const [contributors, setContributors] = useState([]);

    const handleAddContributor = () => {
        if (!contributor || !split) return;

        setContributors(prev => [...prev, { address: contributor, split: parseInt(split) }]);
        setContributor('');
        setSplit('');
    };

    const handleRemoveContributor = (index) => {
        const updated = [...contributors];
        updated.splice(index, 1);
        setContributors(updated);
    };

    const handleUpload = () => {
        // You’ll later use this data to call contract.uploadSong(...)
        const contributorAddresses = contributors.map(c => c.address);
        const contributorSplits = contributors.map(c => c.split);

        console.log("Title:", title);
        console.log("Price:", price);
        console.log("Contributors:", contributorAddresses);
        console.log("Splits:", contributorSplits);
    };

    return (
        <Container>
            <h1 className="my-4">Artist Dashboard</h1>

            {/* Upload Song Section */}
            <section>
                <h2>Upload Your Music</h2>
                <Form>
                    <Form.Group controlId="songName">
                        <Form.Label>Song Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="price">
                        <Form.Label>Price Per Download (ETH)</Form.Label>
                        <Form.Control
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" className="mt-3" onClick={handleUpload}>
                        Upload Song
                    </Button>
                </Form>
            </section>

            {/* Revenue Splits Section */}
            <section className="mt-5">
                <h2>Revenue Splits</h2>
                <Row>
                    <Col>
                        <Form.Control
                            type="text"
                            placeholder="Contributor address"
                            value={contributor}
                            onChange={(e) => setContributor(e.target.value)}
                        />
                    </Col>
                    <Col>
                        <Form.Control
                            type="number"
                            placeholder="% split"
                            value={split}
                            onChange={(e) => setSplit(e.target.value)}
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
                                    <Button variant="danger" size="sm" onClick={() => handleRemoveContributor(i)}>
                                        Remove
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </section>

            {/* Earnings Section (Placeholder) */}
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
