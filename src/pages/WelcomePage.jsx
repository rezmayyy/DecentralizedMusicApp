// src/pages/WelcomePage.jsx
import React, { useContext } from 'react';
import { Button, Container, Card, Row, Col } from 'react-bootstrap';
import Equalizer from '../components/Equalizer';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../components/Web3Context';
import '../theme.css';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { account } = useContext(Web3Context);

  // Launch MetaMask
  const handleConnect = async () => {
    if (!window.ethereum) {
      return alert('MetaMask not detected. Please install MetaMask.');
    }
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (err) {
      console.error(err);
      alert(err.message || 'Connection request rejected.');
    }
  };

  return (
    <Container className="welcome-container">
      {/* Logo & Tagline */}
      <div className="text-center mb-5">
        <h1 className="logo">myTunes</h1>
        <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
          A Decentralized Music Marketplace
        </p>
        {!account && (
          <Button variant="primary" className="app-btn mb-4" onClick={handleConnect}>
            🔗 Connect Wallet
          </Button>
        )}
      </div>

      {/* How It Works */}
      <Card className="app-card welcome-how">
        <h3>How It Works</h3>
        <Row>
          <Col md={8}>
            <ol>
              <li>🔑 Connect your wallet (MetaMask or similar)</li>
              <li>📤 Artists upload songs: files → IPFS, metadata → blockchain</li>
              <li>💲 Set a price & define revenue splits for collaborators</li>
              <li>🎧 Buyers browse & purchase tracks securely via Web3</li>
              <li>⬇️ Download purchased tracks from IPFS gateway</li>
              <li>🏦 Artists withdraw earnings instantly—no middlemen</li>
            </ol>
          </Col>
          <Col md={4} className="text-center">
            <Equalizer />
            <p className="text-muted">
              Explore a borderless world of music—powered by blockchain.
            </p>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
          <Button
            variant="primary"
            className="app-btn"
            onClick={() => navigate('/artistdashboard')}
          >
            🎨 Artist Dashboard
          </Button>
          <Button
            variant="primary"
            className="app-btn"
            onClick={() => navigate('/buyerdashboard')}
          >
            🎧 Buyer Dashboard
          </Button>
          <Button
            variant="primary"
            className="app-btn"
            onClick={() => navigate('/home')}
          >
            📜 Explore Songs
          </Button>
        </div>
      </Card>

      {/* Feature Highlights */}
      <Row className="g-4">
        <Col md={4} className="text-center">
          <Card className="app-card h-100">
            <Card.Body>
              <div style={{ fontSize: '2.5rem' }}>📡</div>
              <h4>Decentralized Storage</h4>
              <p className="text-muted">
                Tracks live on IPFS—fully permanent and censorship-resistant.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="text-center">
          <Card className="app-card h-100">
            <Card.Body>
              <div style={{ fontSize: '2.5rem' }}>🔒</div>
              <h4>On-Chain Security</h4>
              <p className="text-muted">
                Metadata on Ethereum: transparent, immutable, bulletproof.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="text-center">
          <Card className="app-card h-100">
            <Card.Body>
              <div style={{ fontSize: '2.5rem' }}>⚡</div>
              <h4>Instant Payments</h4>
              <p className="text-muted">
                Buyers pay with ETH; artists withdraw earnings anytime.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
