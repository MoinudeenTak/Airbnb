import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authServices";
import { useAuth } from "../context/authContext";

export default function Register() {
  const { loginUser } = useAuth();
  const navigate      = useNavigate();

  const [form, setForm]   = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await register(form);
      loginUser(data.token, data.user);   // store token + set user
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="name"     placeholder="Name"     value={form.name}     onChange={handleChange} required />
        <input name="email"    placeholder="Email"    value={form.email}    onChange={handleChange} type="email" required />
        <input name="password" placeholder="Password" value={form.password} onChange={handleChange} type="password" required />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}