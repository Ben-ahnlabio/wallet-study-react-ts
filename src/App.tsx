import { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import "./App.css";

interface walletInfo {
  isConnected: boolean;
  address: string;
  balance: string;
}

function App() {
  const amountRef = useRef<HTMLInputElement>();
  const toAddressRef = useRef<HTMLInputElement>();
  const [walletInfo, setWalletInfo] = useState<walletInfo>({
    isConnected: false,
    address: "",
    balance: "",
  });

  const [chainId, setChainId] = useState("");

  const isMetaMaskInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  const isABCInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isABC);
  };

  useEffect(() => {
    if (isMetaMaskInstalled()) {
      console.log("MetaMask is installed!");
      getBalance();
    } else {
      console.log("MetaMask is not installed!");
    }
  }, []);

  useEffect(() => {
    //getAccounts();
    //getBalance();
    const { ethereum } = window;
    if (ethereum) {
      ethereum.on("connect", (connectInfo) => {
        console.log("connect", connectInfo);
      });

      ethereum.on("accountsChanged", (accounts) => {
        console.log("accountsChanged", accounts);
        //setWalletInfo({ ...walletInfo, address: accounts[0] });
        getBalance();
      });
      ethereum.on("chainChanged", (chainId) => {
        console.log("chainChanged", chainId);
        setChainId(chainId);
        getBalance();
      });
    }
  }, []);

  const getBalance = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("No ethereum object found");
      return;
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      const balance = await ethereum.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });
      setWalletInfo({
        ...walletInfo,
        address: account,
        balance,
        isConnected: ethereum.isConnected(),
      });
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("No ethereum object found");
      return;
    }
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        //console.log(accounts);
        setWalletInfo({
          ...walletInfo,
          address: accounts[0],
          isConnected: ethereum.isConnected(),
        });
      })
      .catch((error) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log("Please connect to MetaMask.");
        } else {
          console.error(error);
        }
      });
  };

  const disconnectWallet = () => {};

  const etherToWeiHex = (ether: string) => {
    return Web3.utils.toHex(Web3.utils.toWei(ether, "ether"));
  };

  const hexToEther = (hex) => {
    return parseInt(hex) / 10 ** 18;
  };

  const sendEther = (e) => {
    e.preventDefault();
    const toAddressValue = toAddressRef.current;
    const amountValue = amountRef.current;

    const { ethereum } = window;
    if (!ethereum) {
      console.log("No ethereum object found");
      return;
    }

    // console.log(`fromAddressValue=${userInfo.address}`);
    // console.log(`toAddressValue=${toAddressValue.value}`);
    // console.log(`amountValue=${amountValue.value.toString()}`);
    // console.log(`amountValueWei=${etherToWeiHex(amountValue.value)}`);
    ethereum
      .request({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletInfo.address,
            to: toAddressValue.value,
            value: etherToWeiHex(amountValue.value),
          },
        ],
      })
      .then((txHash) => console.log(txHash))
      .catch((error) => console.error);
  };
  return (
    <div className="App">
      <header className="App-header"></header>
      <div>
        <p>{walletInfo.isConnected ? "연결됨" : "연결끊김"}</p>
        <p>wallet address : {walletInfo.address}</p>
        <p>chain : {chainId}</p>
        <p>balance : {hexToEther(walletInfo.balance)} ether</p>
      </div>
      <div>
        {walletInfo.isConnected ? (
          <button onClick={disconnectWallet}>Disconnect</button>
        ) : (
          <button onClick={connectWallet}>Connect</button>
        )}
      </div>
      <div>
        <h2>Send Ether</h2>
        <form>
          <p>
            <label htmlFor="to">To</label>
            <input type="text" name="to" ref={toAddressRef} />
          </p>
          <p>
            <label htmlFor="amount">Amount (ether)</label>
            <input type="text" name="amount" ref={amountRef} />
          </p>

          <button onClick={sendEther}>Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
