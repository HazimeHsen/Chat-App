import { useState, useEffect } from "react";
import axios from "axios";

export function useAuthentication() {
  const [authenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Send a request to the backend for token validation
      const check = async () => {
        await axios
          .get(`${import.meta.env.VITE_HOST}/user/validate-token`, {
            headers: {
              Authorization: token,
            },
          })
          .then((response) => {
            const { valid } = response.data;
            if (valid) {
              setAuthenticated(true);
            } else {
              localStorage.removeItem("token");
              setAuthenticated(false);
            }
          })
          .catch((error) => {
            console.error("Error validating token:", error);
          });
      };
      check();
    } else {
      setAuthenticated(false);
    }
  }, []);

  return authenticated;
}
