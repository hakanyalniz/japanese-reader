import "./LogIn.css";
import { useState } from "react";

interface LoginInterface {
  setLogInStatus: React.Dispatch<React.SetStateAction<boolean>>;
  logInStatus: boolean;
  logInPopUp: () => void;
}

const LogIn: React.FC<LoginInterface> = ({
  setLogInStatus,
  logInStatus,
  logInPopUp,
}) => {
  const [signUp, setSignUp] = useState(Boolean);

  const handleLogIn = () => {
    if (signUp) {
      setSignUp(false);
    } else {
      setSignUp(true);
    }
  };

  const handleSignUpSubmit = (event, signOrLog) => {
    // const element = document.getElementById("login-box");
    // if (element) {
    //   element.style.display = "none";
    // }
    logInPopUp();

    event.preventDefault(); // Prevent the form from submitting normally

    // Get form data
    const formData = new FormData(event.target.form);

    // Send form data to the backend using Fetch API
    fetch(`http://127.0.0.1:5000/${signOrLog}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("session", "Test");
          setLogInStatus(true);
          console.log(data);
        } else {
          console.log(data);
        }
      });
  };

  return (
    <div id="login-box">
      {signUp ? (
        <>
          <h3>Sign Up</h3>
          <span className="exit-form" onClick={logInPopUp}>
            X
          </span>
          <form action="/signup" method="post" id="signup-form">
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <input type="password" placeholder="Confirm Password" required />
            <button
              type="submit"
              onClick={(event) => handleSignUpSubmit(event, "signup")}
            >
              Sign Up
            </button>
            <p>Want to Log In?</p>
            <span className="nav-button" onClick={handleLogIn}>
              Log In
            </span>
          </form>
        </>
      ) : (
        <>
          <h3>Log In</h3>
          <span className="exit-form" onClick={logInPopUp}>
            X
          </span>
          <form action="">
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button
              type="submit"
              onClick={(event) => handleSignUpSubmit(event, "login")}
            >
              Log In
            </button>
            <p>Not Signed Up?</p>
            <span className="nav-button" onClick={handleLogIn}>
              Sign Up
            </span>
          </form>
        </>
      )}
    </div>
  );
};

export default LogIn;
