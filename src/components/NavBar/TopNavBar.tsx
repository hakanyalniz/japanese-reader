import { Link } from "react-router-dom";
import LogIn from "../LogIn/LogIn";
import "./TopNavBar.css";
import { useEffect, useState } from "react";
import { checkLoginStatus } from "../../pages/Home/helpers";

const TopNavBar = () => {
  const [logInStatus, setLogInStatus] = useState<boolean>(false);
  const [loginFormClose, setLoginFormClose] = useState(true);

  // The loginFormClose is used to close or open the login box
  const logInPopUp = () => {
    console.log("test");
    if (loginFormClose) {
      setLoginFormClose(false);
    } else {
      setLoginFormClose(true);
    }
  };

  const logOut = () => {
    fetch(`http://127.0.0.1:5000/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setLogInStatus(false);
      });
    return;
  };

  // Checks if user is logged in on page refresh
  useEffect(() => {
    (async () => {
      setLogInStatus(await checkLoginStatus());
    })();
  }, []);

  return (
    <div className="top-nav">
      <button
        onClick={async () => {
          setLogInStatus(await checkLoginStatus());
        }}
      >
        Check Login Status
      </button>
      {loginFormClose ? null : (
        <LogIn
          logInStatus={logInStatus}
          logInPopUp={logInPopUp}
          setLogInStatus={setLogInStatus}
        />
      )}
      <div className="left-nav">
        <Link className="nav-button" to="/">
          Home
        </Link>
        <Link className="nav-button" to="dictionary">
          Dictionary
        </Link>
        <Link className="nav-button" to="notebook">
          Notebook
        </Link>
      </div>
      <div className="right-nav">
        {logInStatus ? (
          <button className="nav-button" onClick={logOut}>
            Log out
          </button>
        ) : (
          <button className="nav-button" onClick={logInPopUp}>
            Log in
          </button>
        )}
      </div>
    </div>
  );
};

export default TopNavBar;
