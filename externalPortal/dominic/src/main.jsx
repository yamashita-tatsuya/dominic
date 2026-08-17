import React, { createContext, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Cookies from 'js-cookie';

const AuthContext = createContext();

const theme = createTheme({
  palette: {
    primary: {
      main: "#008000",
    },
    success: {
      main: "#4caf50",
    },
  },
});

function Root() {
  const [userId, setUserId] = useState(() => Cookies.get("userId") || "");
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    setLoadingAuth(false);
  }, []);

  useEffect(() => {
    if (token) Cookies.set("token", token, { secure: true, sameSite: 'Strict' });
    else Cookies.remove("token");
  }, [token]);

  useEffect(() => {
    if (userId) Cookies.set("userId", userId, { secure: true, sameSite: 'Strict' });
    else Cookies.remove("userId");
  }, [userId]);

  const authData = {
    userId,
    setUserId,
    token,
    setToken,
    loadingAuth,
  };

  return (
    <AuthContext.Provider value={authData}>
      <ThemeProvider theme={theme}>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
export default AuthContext;
