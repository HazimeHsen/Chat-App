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
        emailError: null,
        passwordError: null,
        confirmPasswordError: null,
        nameError: null,
        error: null,
      };
    case "REGISTER_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "NAME_ERROR":
      return {
        ...state,
        loading: false,
        emailError: null,
        passwordError: null,
        confirmPasswordError: null,
        nameError: action.payload,
      };
    case "EMAIL_ERROR":
      return {
        ...state,
        loading: false,
        emailError: action.payload,
        passwordError: null,
        confirmPasswordError: null,
        nameError: null,
      };
    case "PASSWORD_ERROR":
      return {
        ...state,
        loading: false,
        emailError: null,
        passwordError: action.payload,
        confirmPasswordError: null,
        nameError: null,
      };
    case "CONFIRMPASSWORD_ERROR":
      return {
        ...state,
        loading: false,
        emailError: null,
        passwordError: null,
        confirmPasswordError: action.payload,
        nameError: null,
      };
    default:
      return state;
  }
};

export default function Register() {
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
    const token = Cookies.get("token"); // Retrieve the token from the cookie
    console.log(token);
    if (token) {
      navigate(redirect);
    }
  }, [navigate, redirect, token]);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [
    {
      loading,
      error,
      emailError,
      passwordError,
      confirmPasswordError,
      nameError,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: false,
    nameError: null,
    emailError: null,
    passwordError: null,
    confirmPasswordError: null,
    error: null,
  });
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      dispatch({ type: "REGISTER_FAIL", payload: "All fields are required" });
      return;
    }

    try {
      dispatch({ type: "REGISTER_REQUEST" });
      const { data } = await axios.post(
        `
        http://localhost:5000/user/register`,
        {
          email,
          name,
          password,
          confirmPassword,
        }
      );
      console.log(data);
      const {
        nameError,
        emailError,
        passwordError,
        confirmPasswordError,
        token,
        user,
      } = data;

      if (nameError) {
        dispatch({ type: "NAME_ERROR", payload: nameError }); // Update the dispatch action type
      } else if (emailError) {
        dispatch({ type: "EMAIL_ERROR", payload: emailError });
      } else if (passwordError) {
        dispatch({ type: "PASSWORD_ERROR", payload: passwordError });
      } else if (confirmPasswordError) {
        dispatch({
          type: "CONFIRMPASSWORD_ERROR",
          payload: confirmPasswordError,
        });
      } else {
        dispatch({ type: "REGISTER_SUCCESS", payload: data.message });
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          className={`block w-full rounded-sm p-2 mb-2 border ${
            emailError ? "border-red-500" : ""
          }`}
          placeholder="email"
        />
        {emailError && (
          <div className="text-red-500 my-2 animate-shake">{emailError}</div>
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
        <input
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          className={`block w-full rounded-sm p-2 mb-2 border ${
            confirmPasswordError ? "border-red-500" : ""
          }`}
          placeholder="confirm password"
        />
        {confirmPasswordError && (
          <div className="text-red-500 my-2 animate-shake">
            {confirmPasswordError}
          </div>
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
            "Register"
          )}
        </button>
        <div className="my-1">
          Do you have account?{" "}
          <a className="underline text-blue-500" href="/login">
            Login
          </a>
        </div>
      </form>
    </div>
  );
}
