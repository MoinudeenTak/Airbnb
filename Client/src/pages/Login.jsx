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
      const { data } = await login(form);
      loginUser(data.accessToken, data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE IMAGE */}
      <div className="hidden lg:flex w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1505691723518-36a5ac3be353)"
        }}
      >
        <div className="bg-black/40 flex items-center justify-center w-full">
          <h1 className="text-white text-4xl font-bold">
            Find your next stay
          </h1>
        </div>
      </div>

      {/* RIGHT SIDE LOGIN FORM */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 bg-gray-50 px-6">

        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

          {/* LOGO */}
          <h1 className="text-3xl font-bold text-center text-rose-500 mb-2">
            Airbnb
          </h1>

          <p className="text-center text-gray-500 mb-6">
            Login to your account
          </p>

          {error && (
            <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* EMAIL */}
            <div>
              <input
                name="email"
                placeholder="Email address"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <input
                name="password"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* OPTIONS */}
            <div className="flex justify-between text-sm">

              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-rose-500 hover:underline"
              >
                Forgot password?
              </Link>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition"
            >
              Login
            </button>

          </form>

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-3 text-gray-400 text-sm">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* SOCIAL LOGIN */}
          <div className="space-y-3">

            <button className="w-full border rounded-lg py-3 hover:bg-gray-50">
              Continue with Google
            </button>

            <button className="w-full border rounded-lg py-3 hover:bg-gray-50">
              Continue with Facebook
            </button>

          </div>

          {/* REGISTER */}
          <p className="text-center text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-rose-500 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}