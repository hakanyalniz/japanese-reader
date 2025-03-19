import "./LogIn.css";
import { useState } from "react";

const LogIn = () => {
  const [signUp, setSignUp] = useState(Boolean);

  const dissappearForm = () => {
    const element = document.getElementById("login-box");
    if (element) {
      element.style.display = "none";
    }
  };

  const handleLogIn = () => {
    if (signUp) {
      setSignUp(false);
    } else {
      setSignUp(true);
    }
  };

  return (
    <div id="login-box">
      {signUp ? (
        <>
          <h3>Sign Up</h3>
          <form action="">
            <input type="text" placeholder="Username" required />
            <input type="password" placeholder="Password" required />
            <input type="password" placeholder="Confirm Password" required />
            <button type="submit" onClick={dissappearForm}>
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
          <form action="">
            <input type="text" placeholder="Username" required />
            <input type="password" placeholder="Password" required />
            <button type="submit" onClick={dissappearForm}>
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
