import "./App.css";

import { Web3Auth } from "@web3auth/modal";
import { useCallback, useEffect, useState } from "react";

//Initialize within your constructor
const web3auth = new Web3Auth({
  clientId: `${process.env.REACT_WEB3AUTH_CLIENTID}`, // Get your Client ID from Web3Auth Dashboard
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x5", // Please use 0x5 for Goerli Testnet
  },
  theme: "dark",
});

function App() {
  const [userData, setuserData] = useState({ name: "", profileImage: "" });
  const [loggedIn, setLoggedIn] = useState(false);

  // web3auth code

  //initialize web3auth at the rendering of the app
  const initializeWeb3Auth = useCallback(async () => {
    const data = await web3auth.initModal();
    console.log(data);
  }, []);

  // login function
  const login = async () => {
    try {
      const login = await web3auth.connect();
      if (login) {
        const data = await web3auth.getUserInfo();
        console.log(data);
        setuserData(data);
        setLoggedIn(true);
      }
      console.log(login);
    } catch (err) {
      console.log(err);
    }
  };

  // user information function after connection
  const getUserInfo = async () => {
    try {
      const data = await web3auth.getUserInfo();
      console.log("// connected user data");
      setuserData(data);
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

  useEffect(() => {
    initializeWeb3Auth();
    console.log("inside the useEffect");
  }, [initializeWeb3Auth]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="button-grp">
          <button onClick={login}>Login</button>
          <button className="getUserInfo" onClick={getUserInfo}>
            Get User Info
          </button>
          <button className="authenticateUser" onClick={authenticateUser}>
            authenticateUser
          </button>
          <button className="logout" onClick={logout}>
            logout
          </button>
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
              </>
            )}
          </tbody>
        </table>
      </header>
    </div>
  );
}

export default App;
