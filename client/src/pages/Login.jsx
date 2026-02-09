import React, { useState } from "react";
import { useAppcontext } from "../context/Appcontext";
import toast from "react-hot-toast";

const Login = () => {
  const [state, setState] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { axios, setToken,navigate } = useAppcontext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = state === "login" ? "/api/user/login" : "/api/user/register";

    try {
      const { data } = await axios.post(url, { name, email, password });

      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        toast.success(state === "login" ? "Logged in!" : "Account created!");
        navigate('/')
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md text-center bg-gray-900/80 backdrop-blur-md border border-gray-700/50 hover:border-indigo-500/30 rounded-2xl px-8 py-10 shadow-2xl transition-all duration-300"
      >
        <h1 className="text-white text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          {state === "login" ? "Welcome Back 👋" : "Create Account 🚀"}
        </h1>

        <p className="text-gray-400 text-sm mt-3">
          {state === "login"
            ? "Login to continue your journey"
            : "Sign up to get started"}
        </p>

        {/* Name Field */}
        {state !== "login" && (
          <div className="flex items-center mt-8 w-full bg-gray-800/50 border border-gray-700 hover:border-indigo-500/50 h-12 rounded-full px-5 focus-within:border-indigo-500 focus-within:bg-gray-800 transition-all duration-200">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        {/* Email */}
        <div className="flex items-center w-full mt-6 bg-gray-800/50 border border-gray-700 hover:border-indigo-500/50 h-12 rounded-full px-5 focus-within:border-indigo-500 focus-within:bg-gray-800 transition-all duration-200">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="flex items-center mt-6 w-full bg-gray-800/50 border border-gray-700 hover:border-indigo-500/50 h-12 rounded-full px-5 focus-within:border-indigo-500 focus-within:bg-gray-800 transition-all duration-200">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="ml-2 text-gray-400 hover:text-indigo-400 transition-colors duration-200"
          >
            {showPassword ? (
              /* Eye Off Icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-7-9-7a17.465 17.465 0 014.735-5.74M6.18 6.18A9.956 9.956 0 0112 5c5 0 9 7 9 7a17.457 17.457 0 01-4.35 5.34M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6L3 3"
                />
              </svg>
            ) : (
              /* Eye Icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-8 w-full h-11 rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all duration-200 font-semibold shadow-lg hover:shadow-indigo-500/50"
        >
          {state === "login" ? "Login" : "Create Account"}
        </button>

        {/* Toggle */}
        <p
          onClick={() =>
            setState((prev) => (prev === "login" ? "register" : "login"))
          }
          className="text-gray-400 text-sm mt-6 cursor-pointer transition-colors duration-200"
        >
          {state === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
          <span className="text-indigo-400 hover:text-indigo-300 hover:underline ml-1 font-semibold transition-colors duration-200">
            {state === "login" ? "Sign up" : "Login"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
