import { useState, useEffect, React } from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Route, Switch, Redirect, useParams } from "react-router-dom";
import Menu from "../Main/Forum/Menu";
import Announcements from "../Main/Forum/Announcements";
import Assignments from "../Main/Forum/Assignments";
import Files from "../Main/Forum/Files";
import QnA from "../Main/Forum/QnA";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Fab from "@material-ui/core/Fab";
import { Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  menu: {
    position: "fixed",
  },
  leaveButton: {
    top: theme.spacing(1),
  },
}));

const Forum = ({
  match,
  userInformation,
  setNotification,
  setAppBarTitle,
  history,
  props,
}) => {
  const { forumid } = useParams();

  const [openLeaveDialogue, setOpenLeaveDialogue] = useState(false);

  const [validForum, setValidForum] = useState(true);

  const handleGetForum = async () => {
    try {
      const response = await fetch(`/api/forum/id/${forumid}`, {
        method: "GET",
        headers: { token: localStorage.token },
      });

      const parseRes = await response.json();

      if (parseRes === false) {
        return setValidForum(false);
      }

      setAppBarTitle(
        `Forum - ${parseRes.subject} with ${
          userInformation.type === "Tutor"
            ? parseRes.student_name
            : parseRes.tutor_name
        }`
      );
    } catch (error) {
      console.error(error);
    }
  };

  const classes = useStyles();

  useEffect(() => {
    handleGetForum();
  }, [setAppBarTitle]);

  const handleLeaveForum = async () => {
    try {
      const response = await fetch(`/api/forum/id/${forumid}`, {
        method: "DELETE",
        headers: { token: localStorage.token },
      });

      const parseRes = await response.json();

      if (parseRes.status === true) {
        setNotification({
          open: true,
          severity: "success",
          message: parseRes.message,
        });
        return history.push("/main/dashboard");
      } else {
        return setNotification({
          open: true,
          severity: "error",
          message: parseRes.message,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const LeaveDialogue = () => (
    <Dialog open={openLeaveDialogue} maxWidth="xs" fullWidth>
      <DialogTitle id="attribute-dialogue">Leave tuition</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you would like to leave this tuition? All documents and
          data related to this forum will be permanently deleted.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => setOpenLeaveDialogue(false)}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleLeaveForum}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );

  return !validForum ? (
    <Redirect to={"/main/dashboard"} />
  ) : (
    <>
      <Container maxWidth="lg">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          className={classes.menu}
        >
          <Grid item xs={12}>
            <Grid container direction="column">
              <Menu match={match} />
              <Button
                variant="contained"
                className={classes.leaveButton}
                onClick={() => setOpenLeaveDialogue(true)}
              >
                Leave tuition
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box m={2} display="flex" justifyContent="flex-end">
          <Grid item xs={10}>
            <Switch>
              <Route
                exact
                path={`${match.url}/announcements`}
                render={(props) => (
                  <Announcements
                    {...props}
                    setNotification={setNotification}
                    userInformation={userInformation}
                    forumid={forumid}
                  />
                )}
              />
              <Route
                path={`${match.url}/assignments`}
                render={() => (
                  <Assignments
                    setNotification={setNotification}
                    userInformation={userInformation}
                    forumid={forumid}
                  />
                )}
              />
              <Route
                path={`${match.url}/files`}
                render={(props) => (
                  <Files
                    {...props}
                    setNotification={setNotification}
                    userInformation={userInformation}
                    forumid={forumid}
                  />
                )}
              />
              <Route
                path={`${match.url}/qna`}
                render={() => (
                  <QnA
                    setNotification={setNotification}
                    userInformation={userInformation}
                    forumid={forumid}
                  />
                )}
              />
            </Switch>
          </Grid>
        </Box>
      </Container>
      <LeaveDialogue />
    </>
  );
};

export default Forum;
