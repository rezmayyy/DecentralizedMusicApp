import React, { useContext } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Web3Context } from './Web3Context';

function NavigationBar() {
  const { account } = useContext(Web3Context);

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">MyTunes</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/test">Test</Nav.Link>
                        <Nav.Link as={Link} to="/artistdashboard">Artist Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/buyerdashboard">Buyer Dashboard</Nav.Link>
                    </Nav>
                    <Navbar.Text className="text-white">
                        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Not Connected"}
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );

}

export default NavigationBar;
