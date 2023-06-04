import { useEffect, useReducer, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./r.css";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const reducer = (state, action) => {
  switch (action.type) {
    case "REGISTER_REQUEST":
      return { ...state, loading: true };
    case "REGISTER_SUCCESS":
      return {
        ...state,
        loading: false,
        passwordError: null,
        nameError: null,
        error: null,
      };
    case "REGISTER_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "NAME_ERROR":
      return {
        ...state,
        loading: false,
        passwordError: null,
        nameError: action.payload,
      };
    case "PASSWORD_ERROR":
      return {
        ...state,
        loading: false,
        passwordError: action.payload,
        nameError: null,
      };

    default:
      return state;
  }
};

export default function Login() {
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";
  const navigate = useNavigate();
  useEffect(() => {
    const token = Cookies.get("token"); // Retrieve the token from the cookie
    console.log(token);
    if (token) {
      navigate(redirect);
    }
  }, [navigate, redirect]);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [{ loading, error, passwordError, nameError }, dispatch] = useReducer(
    reducer,
    {
      loading: false,
      nameError: null,
      passwordError: null,
      error: null,
    }
  );
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !password) {
      dispatch({ type: "REGISTER_FAIL", payload: "All fields are required" });
      return;
    }

    try {
      dispatch({ type: "REGISTER_REQUEST" });
      const { data } = await axios.post(`http://localhost:5000/user/login`, {
        name,
        password,
      });

      const { nameError, passwordError, token, user } = data;

      if (nameError) {
        dispatch({ type: "NAME_ERROR", payload: nameError });
      } else if (passwordError) {
        dispatch({ type: "PASSWORD_ERROR", payload: passwordError });
      } else {
        dispatch({ type: "REGISTER_SUCCESS" });
        navigate(redirect);
        toast.success(data.message);
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ name: user.name, userId: user._id })
        );
        Cookies.set("token", token, { expires: 1000, secure: true });
      }
    } catch (error) {
      dispatch({ type: "REGISTER_FAIL", payload: error.response.data.error });
    }
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" action="">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          className={`block w-full rounded-sm p-2 mb-2 border ${
            nameError ? "border-red-500" : ""
          }`}
          placeholder="name"
        />
        {nameError && (
          <div className="text-red-500 my-2 animate-shake">{nameError}</div>
        )}
        <input
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className={`block w-full rounded-sm p-2 mb-2 border ${
            passwordError ? "border-red-500" : ""
          }`}
          placeholder="password"
        />
        {passwordError && (
          <div className="text-red-500 my-2 animate-shake">{passwordError}</div>
        )}
        {error && (
          <div className="text-red-500 my-2 animate-shake">{error}</div>
        )}

        <button
          onClick={handleRegister}
          type="button"
          className="bg-blue-500 text-white block w-full rounded-sm p-2 red1">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Loading...
            </div>
          ) : (
            "Login"
          )}
        </button>
        <div className="my-1">
          Create new account?{" "}
          <a className="underline text-blue-500" href="/register">
            Rgister
          </a>
        </div>
      </form>
    </div>
  );
}
