import { Navigate } from "react-router-dom";
import { useAuthentication } from "./auth";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthentication();

  return <div>{isAuthenticated ? children : <Navigate to="/register" />}</div>;
};

export default ProtectedRoute;
