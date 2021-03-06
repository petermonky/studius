import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import "./App/App.css";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

import Home from "./App/Home";
import Register from "./App/Register";
import Login from "./App/Login";
import Account from "./App/Account";
import Loading from "./shared/Loading";
import Main from "./App/Main";

const theme = createMuiTheme({
  typography: {
    fontFamily: ["Noto Sans", "Roboto"].join(","),
  },
  palette: {
    primary: {
      main: "#34495E",
    },
    secondary: {
      main: "#000000",
    },
  },
});

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const App = () => {
  const [userState, setUserState] = useState({
    isLoading: true,
    isAuthenticated: false,
  });

  const [notification, setNotification] = useState({
    open: false,
    severity: "",
    message: "",
  });

  const setAuth = (authBoolean) => {
    setUserState({
      isLoading: false,
      isAuthenticated: authBoolean,
    });
  };

  const handleAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { token: localStorage.token },
      });

      const parseRes = await response.json();

      setUserState({
        isLoading: false,
        isAuthenticated: parseRes === true,
      });
    } catch (error) {
      setUserState({
        isLoading: false,
        isAuthenticated: false,
      });

      setNotification({
        open: true,
        severity: "error",
        message: "Server connection timeout",
      });
    }
  };

  useEffect(() => {
    handleAuth();
  }, []);

  const handleNotification = (event, reason) => {
    // disable clickaway
    if (reason === "clickaway") {
      return;
    }

    setNotification({ ...notification, open: false });
  };

  const Notification = () => {
    return (
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotification}
      >
        <Alert onClose={handleNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    );
  };

  return (
    <>
      <MuiThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Router>
            <Switch>
              <Route exact path="/" render={() => <Home />} />
              <Route
                path="/register"
                render={(props) =>
                  userState.isAuthenticated ? (
                    <Redirect to="/main" />
                  ) : userState.isLoading ? (
                    <Loading />
                  ) : (
                    <Register
                      {...props}
                      setAuth={setAuth}
                      setNotification={setNotification}
                    />
                  )
                }
              />
              <Route
                path="/login"
                render={(props) =>
                  userState.isAuthenticated ? (
                    <Redirect to="/main" />
                  ) : userState.isLoading ? (
                    <Loading />
                  ) : (
                    <Login
                      {...props}
                      setAuth={setAuth}
                      setNotification={setNotification}
                    />
                  )
                }
              />
              <Route
                path="/main"
                render={(props) =>
                  userState.isAuthenticated ? (
                    <Main
                      {...props}
                      setAuth={setAuth}
                      setNotification={setNotification}
                    />
                  ) : userState.isLoading ? (
                    <Loading />
                  ) : (
                    <Redirect to="/login" />
                  )
                }
              />
              <Route
                path="/account"
                render={(props) =>
                  userState.isAuthenticated ? (
                    <Account
                      {...props}
                      setAuth={setAuth}
                      setNotification={setNotification}
                    />
                  ) : userState.isLoading ? (
                    <Loading />
                  ) : (
                    <Redirect to="/login" />
                  )
                }
              />
            </Switch>
          </Router>
          <Notification />
        </MuiPickersUtilsProvider>
      </MuiThemeProvider>
    </>
  );
};

export default App;
