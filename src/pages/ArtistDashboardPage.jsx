import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Table, Container, Row, Col } from 'react-bootstrap';
import { Web3Context } from '../components/Web3Context';
import { create } from 'ipfs-http-client';
import '../theme.css';

export default function ArtistDashboardPage(){
  const { web3, account, contract } = useContext(Web3Context);
  const [title,setTitle]=useState(''), [price,setPrice]=useState(''),
        [contributor,setContributor]=useState(''), [split,setSplit]=useState(''),
        [contributors,setContributors]=useState([]), [balance,setBalance]=useState(0),
        [songFile,setSongFile]=useState(null), [ipfsCID,setIpfsCID]=useState(''),
        [uploading,setUploading]=useState(false), [displayName,setDisplayName]=useState('');
  const ipfs = create({ host:'localhost',port:'5001',protocol:'http' });
  const fetchBalance = async()=>{
    const bal = await contract.methods.balances(account).call();
    setBalance(web3.utils.fromWei(bal,'ether'));
  };
  useEffect(()=>{ if(contract&&account) fetchBalance(); },[contract,account]);

  const uploadToIPFS=async()=>{
    if(!songFile) return alert("Select a song!");
    setUploading(true);
    const added = await ipfs.add(songFile);
    setIpfsCID(added.path);
    alert(`IPFS CID: ${added.path}`);
    setUploading(false);
  };
  const doUpload=async()=>{
    if(!ipfsCID) return alert("IPFS first!");
    const finalTitle=`${title} - ${displayName||'Anonymous'}`;
    const addrs=contributors.map(c=>c.address), splits=contributors.map(c=>c.split);
    await contract.methods.uploadSong(finalTitle,web3.utils.toWei(price,'ether'),ipfsCID,addrs,splits).send({ from:account });
    alert("Uploaded!");
    setTitle('');setPrice('');setContributors([]);setIpfsCID('');setSongFile(null);setDisplayName('');
  };
  const withdraw=async()=>{
    await contract.methods.withdrawFunds().send({ from:account });
    fetchBalance();
    alert("Withdrawn!");
  };
  const addSplit=()=>{ if(contributor&&split){ setContributors([...contributors,{address:contributor,split:parseInt(split)}]); setContributor(''); setSplit(''); } };
  const removeSplit=i=>setContributors(contributors.filter((_,idx)=>idx!==i));

  return (
    <Container className="artist-dashboard-container">
      <h2>🎨 Artist Dashboard</h2>

      <div className="app-card">
        <h3>Upload Your Music</h3>
        <Form>
          <Form.Control className="app-input" placeholder="Song Title" value={title} onChange={e=>setTitle(e.target.value)}/>
          <Form.Control className="app-input" placeholder="Price (ETH)" type="number" value={price} onChange={e=>setPrice(e.target.value)}/>
          <Form.Control className="app-input" placeholder="Display Name (Optional)" value={displayName} onChange={e=>setDisplayName(e.target.value)}/>
          <Form.Control className="app-input" type="file" onChange={e=>setSongFile(e.target.files[0])}/>
          <div className="d-flex gap-3 mt-3">
            <Button className="app-btn btn-secondary" onClick={uploadToIPFS} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload to IPFS'}
            </Button>
            <Button className="app-btn btn-primary" onClick={doUpload}>
              Upload to Blockchain
            </Button>
          </div>
          {ipfsCID && <p className="text-muted mt-2">CID: {ipfsCID}</p>}
        </Form>
      </div>

      <div className="app-card">
        <h3>Revenue Splits</h3>
        <Row className="g-3 mb-3">
          <Col><Form.Control className="app-input" placeholder="Contributor Address" value={contributor} onChange={e=>setContributor(e.target.value)}/></Col>
          <Col><Form.Control className="app-input" placeholder="% Split" type="number" value={split} onChange={e=>setSplit(e.target.value)}/></Col>
          <Col><Button className="app-btn btn-primary w-100" onClick={addSplit}>Add</Button></Col>
        </Row>
        <Table bordered hover responsive>
          <thead><tr><th>Address</th><th>Split</th><th>Remove</th></tr></thead>
          <tbody>
            {contributors.map((c,i)=>(
              <tr key={i}>
                <td>{c.address}</td>
                <td>{c.split}%</td>
                <td><Button size="sm" className="app-btn btn-secondary" onClick={()=>removeSplit(i)}>×</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="app-card">
        <h3>Earnings</h3>
        <p>Balance: {balance} ETH</p>
        <Button className="app-btn btn-success w-100" onClick={withdraw}>Withdraw Funds</Button>
      </div>
    </Container>
  );
}
