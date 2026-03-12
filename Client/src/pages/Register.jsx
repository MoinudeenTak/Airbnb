import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authServices";
import { useAuth } from "../context/authContext";

export default function Register() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "guest"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const { data } = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });

      loginUser(data.token, data.user);

      if (form.role === "host") {
        navigate("/host/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE IMAGE */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267)"
        }}
      >
        <div className="bg-black/40 flex items-center justify-center w-full">
          <h1 className="text-white text-4xl font-bold text-center px-10">
            Start your journey with Airbnb
          </h1>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex items-center justify-center w-full lg:w-1/2 bg-gray-50 px-6">

        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

          <h1 className="text-3xl font-bold text-center text-rose-500 mb-2">
            Create Account
          </h1>

          <p className="text-center text-gray-500 mb-6">
            Join as a guest or host
          </p>

          {error && (
            <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ROLE SELECTOR */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                I want to join as:
              </p>

              <div className="grid grid-cols-2 gap-3">

                <label
                  className={`border rounded-lg p-3 cursor-pointer text-center ${
                    form.role === "guest"
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="guest"
                    checked={form.role === "guest"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  👤 Guest
                </label>

                <label
                  className={`border rounded-lg p-3 cursor-pointer text-center ${
                    form.role === "host"
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="host"
                    checked={form.role === "host"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  🏠 Host
                </label>

              </div>
            </div>

            {/* NAME */}
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />

            {/* EMAIL */}
            <input
              name="email"
              placeholder="Email Address"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                name="password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <input
              name="confirmPassword"
              placeholder="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />

            {/* TERMS */}
            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" required />
              I agree to the
              <span className="text-rose-500 cursor-pointer ml-1">
                Terms & Conditions
              </span>
            </label>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition"
            >
              Create Account
            </button>

          </form>

          {/* LOGIN LINK */}
          <p className="text-center text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-rose-500 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}