# MyTunes 🎶

A decentralized music marketplace built on Ethereum and IPFS.  
Artists can upload their tracks, set prices and revenue splits with collaborators. Buyers browse, purchase with ETH, and download instantly — no middlemen.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/DecentralizedMusicApp.git
cd DecentralizedMusicApp
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```ini
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
REACT_APP_IPFS_API_URL=http://localhost:5001
```

Make sure your local blockchain (e.g. Ganache or Hardhat node) is running and your smart contract is deployed.

### 3. Run Locally

```bash
npm start
```

- Opens at [http://localhost:3000](http://localhost:3000)  
- Live-reloads on file changes  
- Shows lint errors in console  

### 4. Build for Production

```bash
npm run build
```

- Bundles React for production into `build/`  
- Minifies code and hashes filenames for caching  

---

## ⚙️ Available Scripts

- **`npm start`**  
  Start the development server.

- **`npm test`**  
  Launch Jest in interactive watch mode.

- **`npm run build`**  
  Create an optimized production build.

- **`npm run eject`**  
  **One-way** operation: expose all underlying configs (Webpack, Babel, ESLint, etc.).

---

## 📂 Project Structure

```
DecentralizedMusicApp/
├─ public/                # Static assets & HTML template
├─ src/
│  ├─ components/         # Reusable UI components
│  ├─ pages/              # Page-level React components
│  ├─ contracts/          # Truffle/Hardhat-compiled ABI JSON
│  ├─ theme.css           # Custom styling variables & overrides
│  ├─ App.js              # Main router + layout
│  └─ index.js            # Entry point
├─ .env                   # Environment variables
├─ package.json
└─ README.md
```

---

## 🔗 Connecting to Ethereum

We use **MetaMask** to interact with your local node or testnet:

1. Click **Connect Wallet** in the top-right.  
2. Approve the connection in MetaMask.  
3. You’re ready to upload, purchase, and withdraw!

---

## 💡 Key Features

- **Decentralized Storage** (IPFS): Tracks are fully censorship-resistant.  
- **On-Chain Security**: Metadata & revenue logic live on Ethereum.  
- **Instant Payments**: Buyers pay in ETH; artists withdraw anytime.  
- **Revenue Splits**: Collaborators earn automatically according to your split rules.  
- **User Dashboards**: Separate interfaces for artists and buyers.

---

> Elevate your music. Empower your fans.  
