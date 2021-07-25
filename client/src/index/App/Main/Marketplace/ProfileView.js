import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  layout: {
    width: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: 600,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  title: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(1),
  },
  fileUpload: {
    display: "none",
  },
  contractText: {
    marginTop: theme.spacing(2),
  },
}));

const ProfileView = ({ userInformation, setNotification, history }) => {
  const { id } = useParams();

  const classes = useStyles();

  const [profile, setProfile] = useState({
    isSet: false,
    firstname: "",
    lastname: "",
    subjects: [],
    rate: "",
    times: [],
    description: "",
  });

  const [credentialsKey, setCredentialsKey] = useState("");

  const handleViewCredentials = async () => {
    const response = await fetch(`/api/files/credentials/${credentialsKey}`, {
      method: "GET",
      headers: { token: localStorage.token },
    });

    const blobRes = await response.blob();

    // if (blobRes.type === "text/html") {
    //   return setNotification({
    //     open: true,
    //     severity: "error",
    //     message: "error",
    //   });
    // }

    const file = new Blob([blobRes], { type: "application/pdf" });

    const fileURL = URL.createObjectURL(file);

    window.open(fileURL);
  };

  const getProfile = async () => {
    try {
      const responseProfile = await fetch(`/api/marketplace/${id}`, {
        method: "GET",
        headers: { token: localStorage.token },
      });

      const parseResProf = await responseProfile.json();

      setProfile(parseResProf);

      const responseCredentials = await fetch("/api/files/credentials", {
        method: "GET",
        headers: { token: localStorage.token, tutorid: id },
      });

      const parseRes = await responseCredentials.json();

      const { key } = parseRes;

      return setCredentialsKey(key);
    } catch (error) {}
  };

  useEffect(() => {
    getProfile();
  }, []);

  const [contractOpen, setContractOpen] = useState(false);

  const handleContractOpen = () => {
    setContractOpen(true);
  };

  const handleContractClose = () => {
    setContractOpen(false);
  };

  const [contractSubject, setContractSubject] = useState("");

  const handleContractConfirm = async (event) => {
    event.preventDefault();

    try {
      const tutorName =
        userInformation.type === "Tutor"
          ? `${userInformation.firstname} ${userInformation.lastname}`
          : `${profile.firstname} ${profile.lastname}`;
      const studentName =
        userInformation.type === "Tutor"
          ? `${profile.firstname} ${profile.lastname}`
          : `${userInformation.firstname} ${userInformation.lastname}`;

      const body = {
        OUID: profile.id,
        subject: contractSubject,
        tutorName,
        studentName,
      };

      const response = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.token,
        },
        body: JSON.stringify(body),
      });

      const parseRes = await response.json();

      if (parseRes.status === true) {
        setNotification({
          open: true,
          severity: "success",
          message: parseRes.message,
        });
        history.push("/main/dashboard");
      } else {
        setNotification({
          open: true,
          severity: "error",
          message: parseRes.message,
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        severity: "error",
        message: error.message,
      });
      console.error(error.message);
    }
  };

  const handleContractChange = (event) => {
    setContractSubject(event.target.value);
  };

  const Contract = () => {
    return (
      <Dialog open={contractOpen} maxWidth="xs" fullWidth>
        <DialogTitle id="contract-title">Test</DialogTitle>
        <DialogContent>
          <FormControl variant="outlined" fullWidth required>
            <InputLabel id="subject">Subject</InputLabel>
            <Select
              labelId="subject"
              id="subject"
              value={contractSubject}
              name="subject"
              onChange={handleContractChange}
              label="Subject"
              MenuProps={{
                anchorOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                getContentAnchorEl: null,
              }}
            >
              {profile.subjects
                .map((subject) =>
                  Array.isArray(subject)
                    ? [subject[0], subject.join(" ")]
                    : [subject, subject]
                )
                .map((subject) => (
                  <MenuItem value={subject[0]}>{subject[1]}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <DialogContentText
            className={classes.contractText}
            id="contract-description"
          >
            You will engage in tuition upon confirmation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContractClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={contractSubject && handleContractConfirm}
            color="primary"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography className={classes.title} variant="h4" align="center">
            {`${profile.firstname} ${profile.lastname} `}
          </Typography>
          <Grid container spacing={2} justify="center" direction="column">
            <Grid item xs={12}>
              <Typography variant="h6">Subjects</Typography>
              <Typography>
                {profile.subjects
                  .map((subject) =>
                    Array.isArray(subject) ? subject.join(" ") : subject
                  )
                  .join(", ")}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Rate</Typography>
              <Typography>$ {profile.rate} / hr</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Available times</Typography>
              <Typography>
                {`${moment(profile.times[0], "HH:mm").format(
                  "hh:mm A"
                )} — ${moment(profile.times[1], "HH:mm").format("hh:mm A")}`}
              </Typography>
            </Grid>
            {userInformation.type === "Student" ? (
              <Grid item xs={12}>
                <Typography variant="h6">Education</Typography>
                <Typography>{profile.education}</Typography>
              </Grid>
            ) : null}
            <Grid item xs={12}>
              <Typography variant="h6">Description</Typography>
              <Typography style={{ whiteSpace: "pre-line" }}>
                {profile.description}
              </Typography>
            </Grid>
            <Grid item xs={12}></Grid>
          </Grid>
          <div className={classes.buttons}>
            {userInformation.type === "Student" ? (
              <Button
                variant="outlined"
                color="primary"
                className={classes.button}
                onClick={handleViewCredentials}
                disabled={!credentialsKey}
              >
                {credentialsKey ? "View credentials" : "No credentials"}
              </Button>
            ) : null}
            <Button
              color="secondary"
              className={classes.button}
              component={Link}
              to={"/main/marketplace"}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={handleContractOpen}
            >
              Send contract
            </Button>
          </div>
        </Paper>
      </main>
      <Contract />
    </>
  );
};

export default ProfileView;
