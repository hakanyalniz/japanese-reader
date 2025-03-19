import "./LogIn.css";

const LogIn = () => {
  return (
    <div className="login-box">
      <h3>Log In</h3>
      <form action="">
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LogIn;
