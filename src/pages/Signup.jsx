import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import '../App.css';  // Import same theme CSS

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setIsRegistered(true);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="voltroute-page light">
      <div className="animated-bg"></div>

      <div className="container-fluid">
        <div className="voltroute-center-card shadow-lg">
          {isRegistered ? (
            <div className="text-center">
              <h3 className="text-gradient mb-3">Signup Successful ✅</h3>
              <Link to="/login" className="btn btn-glow btn-primary btn-lg">
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="fw-bold text-gradient mb-4">Sign Up</h2>
              <form onSubmit={handleSignup}>
                <div className="mb-3 text-start">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3 text-start">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-glow btn-success btn-lg w-100">
                  Sign Up
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
