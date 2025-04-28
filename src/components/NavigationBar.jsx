import React, { useContext } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Web3Context } from './Web3Context';
import '../theme.css'; // global theme

function NavigationBar() {
    const { account } = useContext(Web3Context);

    return (
        <Navbar expand="lg" className="mb-4" style={{ backgroundColor: 'var(--bg-alt)', borderBottom: '2px solid var(--border)' }}>
            <Container>
                {/* Logo */}
                <Navbar.Brand as={Link} to="/" className="logo">myTunes</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {/* Home */}
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        {/* Explore Songs */}
                        <Nav.Link as={Link} to="/home">Explore Songs</Nav.Link>
                        {/* Artist Dashboard */}
                        <Nav.Link as={Link} to="/artistdashboard">Artist Dashboard</Nav.Link>
                        {/* Buyer Dashboard */}
                        <Nav.Link as={Link} to="/buyerdashboard">Buyer Dashboard</Nav.Link>
                    </Nav>
                    {/* Wallet status */}
                    <Navbar.Text style={{ color: 'var(--text)' }}>
                        {account ? `Connected: ${account.slice(0,6)}…${account.slice(-4)}` : 'Not Connected'}
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;
