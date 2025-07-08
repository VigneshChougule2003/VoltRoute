import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import '../App.css';  // Import same CSS theme here

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="voltroute-page light">
      <div className="animated-bg"></div>

      <div className="container-fluid">
        <div className="voltroute-center-card shadow-lg">
          <h2 className="fw-bold text-gradient mb-4">Log In</h2>
          <form onSubmit={handleLogin}>
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
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
