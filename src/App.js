import "./App.css";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import Web3 from "web3";
import contractABI from "./artifacts/contract.json";
const contractAddress = "0x61De71734C89C9a359028962f6834A2ae099293e";

//Initialize within your constructor
const web3auth = new Web3Auth({
  clientId: `BNVHKQQNqwNQSTBomstQ29-Hxh-ri77E5OreTGJ6lLyHr0vj7cnbr6sZTxOXyjF_8nlYltULDWY-f2Cx70PbMUM`, // Get your Client ID from Web3Auth Dashboard
  //   chainConfig: {
  //     chainNamespace: "eip155",
  //     chainId: "0x5", // Please use 0x5 for Goerli Testnet
  //   },
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x13881", // hex of 80001, polygon testnet
    rpcTarget: "https://rpc-mumbai.maticvigil.com/",
    // Avoid using public rpcTarget in production.
    // Use services like Infura, Quicknode etc
  },
  theme: "dark",
  web3AuthNetwork: "cyan",
});

function App() {
  const [userData, setUserData] = useState({
    name: "",
    profileImage: "",
    address: "",
    balance: "",
  });
  const [msg, setMsg] = useState({ inputMsg: "", responseMsg: "" });
  const [sendMsgText, setSendMsgText] = useState("Send Msg");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginInstance, setLoginInstance] = useState();
  const [address, setAddress] = useState("");

  // web3auth code

  //initialize web3auth at the rendering of the app
  const initializeWeb3Auth = useCallback(async () => {
    await web3auth.initModal();
    // console.log(data);
  }, []);

  // login function
  const login = async () => {
    try {
      const login = await web3auth.connect();
      console.log(login);
      if (login) {
        setLoginInstance(login);
        const provider = new ethers.providers.Web3Provider(login);
        console.log(provider);
        const signer = provider.getSigner();

        // Get user's Ethereum public address
        const address = await signer.getAddress();
        setAddress(address);
        console.log(address);
        const balance = ethers.utils.formatEther(
          await provider.getBalance(address) // Balance is in wei
        );
        const data = await web3auth.getUserInfo();
        console.log(data);
        setUserData({
          name: data.name,
          profileImage: data.profileImage,
          email: data.email,
          address: address,
          balance: balance / Math.pow(10, 18).toFixed(4),
        });
        setLoggedIn(true);
      }
      console.log(login);
    } catch (err) {
      console.log(err);
    }
  };
  // contract instance

  const updateMsg = async () => {
    try {
      setSendMsgText("Sending...");
      // const login = await web3auth.connect();
      // const provider = new ethers.providers.Web3Provider(loginInstance);
      // console.log(provider);
      // const signer = provider.getSigner();
      // console.log(signer);
      // const contract = new ethers.Contract(
      //   contractAddress,
      //   contractABI,
      //   signer
      // );
      const web3 = new Web3(loginInstance);
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const fromAddress = (await web3.eth.getAccounts())[0];
      const response = await contract.methods
        .sayHello(msg.inputMsg)
        .send(
          {
            from: fromAddress,
          },
          function (error, transactionHash) {
            if (transactionHash) {
              console.log(transactionHash);

              setSendMsgText("Sent");
              setTimeout(() => {
                setSendMsgText("Send Msg");
                setMsg({ inputMsg: "", responseMsg: "" });
              }, 2000);
              // setApproveCase(3);
            } else {
              console.log(error);
            }
          }
        )
        .on("receipt", async function (receipt) {
          console.log(receipt);
        })
        .on("error", async function (error) {
          console.log(error);
        });
      console.log(response);

      // const receipt = await contract.methods.sayHello("NEW_MESSAGE").send({
      //   from: fromAddress,
      //   maxPriorityFeePerGas: "500000000000", // Max priority fee per gas
      //   maxFeePerGas: "60000000000000", // Max fee per gas
      // });
      // console.log(receipt);
      // Send transaction to smart contract to update message
      // const tx = await contract.sayHello("NEW_MESSAGE");
      // // Wait for transaction to finish
      // const receipt = await tx.wait();
      // console.log(receipt);
    } catch (err) {
      console.log(err);
    }
  };
  const displayMsg = async () => {
    try {
      // const login = await web3auth.connect();
      // const provider = new ethers.providers.Web3Provider(loginInstance);
      // const signer = provider.getSigner();

      // const contract = new ethers.Contract(
      //   contractAddress,
      //   contractABI,
      //   signer
      // );
      const web3 = new Web3(loginInstance);
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      console.log(contract);
      // Send transaction to smart contract to update message
      const message = await contract.methods.getHello().call();
      // const data = await contract.getHello();
      setMsg({ ...msg, responseMsg: message });
      console.log(message);
    } catch (err) {
      console.log(err);
    }
  };

  const sendFunds = async () => {
    try {
      const login = web3auth.connect();
      console.log(web3auth.provider);
      // const provider = web3auth.provider;
      const provider = new ethers.providers.Web3Provider(web3auth.provider);
      const web3 = new Web3(loginInstance);
      // console.log(web3);
      const signer = provider.getSigner(login.address);
      console.log(signer);
      const destination = "0x408402F30618a6985c56cF9608E04CEA12CddC37";
      const amount = ethers.utils.parseEther("0.01858");
      const fromAddress = (await web3.eth.getAccounts())[0];
      // console.log(fromAddress);
      // Send transaction to smart contract to update message
      const tx = await signer.sendTransaction({
        from: fromAddress,
        to: fromAddress,
        value: amount,
        maxPriorityFeePerGas: "5000000000", // Max priority fee per gas
        maxFeePerGas: "6000000000000", // Max fee per gas
      });
      const receipt = await tx.wait();
      console.log(receipt);
    } catch (err) {
      console.log(err);
    }
  };
  // user information function after connection
  const getUserInfo = async () => {
    try {
      const data = await web3auth.getUserInfo();
      console.log("// connected user data");
      // setuserData(data);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const authenticateUser = async () => {
    try {
      const data = await web3auth.authenticateUser({
        email: "jaydp.lamprostech@gmail.com",
      });
      console.log("// user authenticateUser");
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };
  // get user address and balance

  const logout = async () => {
    try {
      const logout = await web3auth.logout();
      console.log(logout);
      setLoggedIn(false);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const getContractBalance = async () => {
    try {
      const web3 = new Web3(loginInstance);
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      console.log(contract);
      // Send transaction to smart contract to update message
      const balance = await contract.methods.contractBalance().call();
      console.log(balance);
    } catch (err) {
      console.log(err);
    }
  };

  const sendIntoContract = async () => {
    try {
      const web3 = new Web3(loginInstance);
      console.log(web3);
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const fromAddress = (await web3.eth.getAccounts())[0];
      console.log(fromAddress);
      // const amount = ethers.utils.parseEther("0.00858");
      const response = await contract.methods
        .sendInContract(100000000)
        .send(
          {
            from: fromAddress,
          },
          function (error, transactionHash) {
            if (transactionHash) {
              console.log(transactionHash);
            } else {
              console.log(error);
            }
          }
        )
        .on("receipt", async function (receipt) {
          console.log(receipt);
        })
        .on("error", async function (error) {
          console.log(error);
        });
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    initializeWeb3Auth();
    console.log("inside the useEffect");
  }, [initializeWeb3Auth]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="button-grp">
          <button onClick={login}>Login</button>
          {/* <button className="getUserInfo" onClick={getUserInfo}>
            Get User Info
          </button>
          <button className="authenticateUser" onClick={authenticateUser}>
            authenticateUser
          </button> */}
          <button className="logout" onClick={logout}>
            logout
          </button>
        </div>
        <div className="msg">
          <input
            type="text"
            value={msg.inputMsg ? msg.inputMsg : ""}
            onChange={(e) => setMsg({ ...msg, inputMsg: e.target.value })}
          />
          <button onClick={() => updateMsg()}>{sendMsgText}</button>
        </div>
        <div className="msg">
          <button onClick={() => displayMsg()}>Get Msg</button>
          {msg.responseMsg ? <p>{msg.responseMsg}</p> : <p>-</p>}
        </div>
        <div className="msg">
          <button onClick={getContractBalance}>Get Contract Balance</button>
          <button onClick={sendIntoContract}>sendIntoContract</button>
        </div>
        <table className="user-info-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User Data</th>
            </tr>
          </thead>
          <tbody>
            {loggedIn ? (
              <>
                <tr>
                  <td>Name</td>
                  <td>{userData.name}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>{userData.email}</td>
                </tr>
                <tr>
                  <td>Profile Picture</td>
                  <td>
                    <img
                      className="profile"
                      src={userData.profileImage}
                      alt="profile"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Address</td>
                  <td>{userData.address}</td>
                </tr>
                <tr>
                  <td>Balance</td>
                  <td>{userData.balance}</td>
                </tr>
              </>
            ) : (
              <>
                <tr>
                  <td>Name</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Profile Picture</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Address</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Balance</td>
                  <td>-</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </header>
    </div>
  );
}

export default App;
