import { createContext, useReducer } from "react";
import PropTypes from "prop-types";

export const Error = createContext();

const initialState = {
  nameError: null,
  emailError: null,
  passwordError: null,
  confirmPasswordError: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "NAME_ERROR":
      return { ...state, nameError: action.payload };
    case "EMAIL_ERROR":
      return { ...state, emailError: action.payload };
    case "PASSWORD_ERROR":
      return { ...state, passwordError: action.payload };
    case "CONFIRMPASSWORD_ERROR":
      return { ...state, confirmPasswordError: action.payload };
    default:
      return state;
  }
};

export const CatchErrors = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Error.Provider value={value}>{children}</Error.Provider>;
};

CatchErrors.propTypes = {
  children: PropTypes.node.isRequired,
};
