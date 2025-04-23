import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Table, Container, Row, Col } from 'react-bootstrap';
import { Web3Context } from '../components/Web3Context';
import { create } from 'ipfs-http-client';

function ArtistDashboardPage() {
    const { web3, account, contract } = useContext(Web3Context);

    // State variables
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [contributor, setContributor] = useState('');
    const [split, setSplit] = useState('');
    const [contributors, setContributors] = useState([]);
    const [balance, setBalance] = useState(0);
    const [songFile, setSongFile] = useState(null);
    const [ipfsCID, setIpfsCID] = useState('');
    const [uploadingToIPFS, setUploadingToIPFS] = useState(false);

    // Initialize IPFS client
    const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });

    // Fetch artist balance
    const fetchBalance = async () => {
        if (contract && account) {
            try {
                const artistBalance = await contract.methods.balances(account).call();
                setBalance(web3.utils.fromWei(artistBalance, 'ether')); // Convert from Wei to Ether
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        }
    };

    // Add contributor to the song revenue split
    const handleAddContributor = () => {
        if (!contributor || !split) return;

        setContributors(prev => [...prev, { address: contributor, split: parseInt(split) }]);
        setContributor('');
        setSplit('');
    };

    // Remove a contributor from the list
    const handleRemoveContributor = (index) => {
        const updated = [...contributors];
        updated.splice(index, 1);
        setContributors(updated);
    };

    // Upload song to IPFS
    const uploadSongToIPFS = async () => {
        if (!songFile) {
            alert("Please select a song file first!");
            return;
        }
    
        const ipfs = create({ host: '127.0.0.1', port: '5001', protocol: 'http' }); // Connect to local IPFS daemon
    
        try {
            console.log("Uploading file to IPFS:", songFile.name);
            const addedFile = await ipfs.add(songFile);
            setIpfsCID(addedFile.path); // Store the CID from IPFS
            alert(`Song uploaded successfully to IPFS! CID: ${addedFile.path}`);
            console.log("File uploaded to IPFS. CID:", addedFile.path);
        } catch (error) {
            console.error("Error uploading file to IPFS:", error);
            alert("Failed to upload song to IPFS.");
        }
    };
    

    // Handle song file change
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSongFile(file);
        }
    };

    // Upload song to the blockchain
    const handleUpload = async () => {
        if (!contract || !account || !web3) {
            alert("Web3 is not connected.");
            return;
        }

        try {
            const contributorAddresses = contributors.map(c => c.address);
            const contributorSplits = contributors.map(c => c.split);

            if (!ipfsCID) {
                alert("Song must be uploaded to IPFS first!");
                return;
            }

            const priceInWei = web3.utils.toWei(price, 'ether');

            await contract.methods.uploadSong(
                title,
                priceInWei,
                ipfsCID, // Use the CID from IPFS
                contributorAddresses,
                contributorSplits
            ).send({ from: account });

            alert("Song uploaded successfully to the blockchain!");
            setTitle('');
            setPrice('');
            setContributors([]);
            setIpfsCID('');
            setSongFile(null);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. See console for details.");
        }
    };

    // Handle withdraw action
    const handleWithdraw = async () => {
        if (!contract || !account) {
            alert("Web3 is not connected.");
            return;
        }

        try {
            await contract.methods.withdrawFunds().send({ from: account });
            alert('Withdrawal successful');
            fetchBalance(); // Update balance after withdrawal
        } catch (error) {
            console.error('Error withdrawing funds:', error);
            alert('Failed to withdraw funds');
        }
    };

    // Fetch the balance when the component is loaded
    useEffect(() => {
        fetchBalance();
    }, [contract, account]);

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
                    <Form.Group controlId="songFile">
                        <Form.Label>Upload Song</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={handleFileChange}
                        />
                    </Form.Group>
                    <Button variant="secondary" className="mt-3" onClick={uploadSongToIPFS}>
                        Upload Song to IPFS
                    </Button>
                    {uploadingToIPFS && <p>Uploading file to IPFS...</p>}
                    {ipfsCID && <p>File successfully uploaded to IPFS! CID: {ipfsCID}</p>}
                </Form>
                <Button variant="primary" className="mt-3" onClick={handleUpload}>
                    Upload Song to Blockchain
                </Button>
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

            {/* Earnings Section */}
            <section className="mt-5">
                <h2>Earnings</h2>
                <p>Current Balance: {balance} ETH</p>
                <Button variant="success" onClick={handleWithdraw}>Withdraw Funds</Button>
            </section>
        </Container>
    );
}

export default ArtistDashboardPage;