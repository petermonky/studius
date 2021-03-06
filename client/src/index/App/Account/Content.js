import { useState, useEffect } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Dialogue from "./Content/Dialogue";
import Paper from "@material-ui/core/Paper";

import AccountInformation from "./Content/AccountInformation";
import Advanced from "./Content/Advanced";

const useStyles = makeStyles((theme) => ({
  attributes: {
    padding: theme.spacing(2),
  },
  detailPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    height: 600,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  list: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
}));

const Content = ({ match, ...props }) => {
  const classes = useStyles();

  const [loading, setLoading] = useState(true);

  const [accountInformation, setAccountInformation] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const getAccountInformation = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/account", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      const parseRes = await response.json();

      setAccountInformation({ ...parseRes, password: "********" });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error.message);
    }
  };

  const [dialogue, setDialogue] = useState({
    open: false,
    type: "",
  });

  const handleDialogueOpen = (type) => () => {
    setDialogue({
      open: true,
      type: type,
    });
  };

  const handleDialogueClose = () => {
    setDialogue({ ...dialogue, open: false });
  };

  useEffect(() => {
    getAccountInformation();
  }, [dialogue.open]);

  return (
    <>
      <Paper className={classes.detailPaper} elevation={2}>
        <div className={classes.attributes}>
          <Switch>
            <Route
              exact
              path={`${match.url}/`}
              render={() => (
                <Redirect to={`${match.url}/account-information`} />
              )}
            />
            <Route
              path={`${match.url}/account-information`}
              render={() => (
                <AccountInformation
                  loading={loading}
                  accountInformation={accountInformation}
                  handleDialogueOpen={handleDialogueOpen}
                />
              )}
            />
            <Route
              path={`${match.url}/advanced`}
              render={() => (
                <Advanced
                  accountInformation={accountInformation}
                  handleDialogueOpen={handleDialogueOpen}
                />
              )}
            />
          </Switch>
        </div>
      </Paper>
      <Dialogue
        {...props}
        dialogue={dialogue}
        setDialogue={setDialogue}
        accountInformation={accountInformation}
        handleDialogueClose={handleDialogueClose}
      />
    </>
  );
};

export default Content;
