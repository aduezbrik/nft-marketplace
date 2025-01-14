import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Spinner } from "react-bootstrap";

import { useState } from "react";
import { ethers } from "ethers";

import MarketplaceAbi from "../contractsData/Marketplace.json";
import MarketplaceAddress from "../contractsData/Marketplace-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";

import Navigation from "./Navbar";
import Home from "./Home";
import Create from "./Create";
import Listed from "./Listed";
import Purchases from "./Purchases";

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [NFT, setNFT] = useState(null);

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    loadContracts(signer);
  };

  const loadContracts = async (signer) => {
    const marketplace = new ethers.Contract(
      MarketplaceAddress.address,
      MarketplaceAbi.abi,
      signer
    );
    setMarketplace(marketplace);

    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    setNFT(nft);

    setLoading(false);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "80vh",
            }}
          >
            <Spinner animation="border" style={{ display: "flex" }} />
            <p className="mx-3 my-0">Awaiting Metamask Connection...</p>
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={<Home marketplace={marketplace} nft={NFT} />}
            />
            <Route
              path="/create"
              element={<Create marketplace={marketplace} nft={NFT} />}
            />
            <Route
              path="/listed"
              element={
                <Listed marketplace={marketplace} nft={NFT} account={account} />
              }
            />
            <Route
              path="/purchases"
              element={
                <Purchases
                  marketplace={marketplace}
                  nft={NFT}
                  account={account}
                />
              }
            />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
