import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authServices";
import { useAuth } from "../context/authContext";

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // call API
      const { data } = await login(form);

      // debug response
      console.log("LOGIN RESPONSE:", data);

      // save token and user
      // loginUser(data.token, data.user); wrong token
      loginUser(data.accessToken, data);

      // redirect
      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          type="email"
          required
        />

        <input
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          type="password"
          required
        />

        <button type="submit">Login</button>
      </form>

      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}