import React, { useEffect, useState } from "react";
import byteSize from "byte-size";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { Grid } from "@material-ui/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Loading from "../../../shared/Loading";
import PublishIcon from "@material-ui/icons/Publish";

const useStyles = makeStyles((theme) => ({
  card: {
    minWidth: 275,
    marginTop: theme.spacing(2),
  },
  noData: {
    marginTop: theme.spacing(40),
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    padding: theme.spacing(1),
  },
  title: {
    buttons: {
      display: "flex",
      justifyContent: "flex-end",
    },
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    paddingTop: "10px",
  },
  footer: {
    fontSize: 16,
    paddingTop: "5px",
  },
  upload: {
    display: "none",
  },
}));

const Assignments = ({ userInformation, setNotification, forumid }) => {
  const classes = useStyles();

  dayjs.extend(relativeTime);

  const [loading, setLoading] = useState(true);
  const [loadingFileUpload, setLoadingFileUpload] = useState(false);

  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);

  const getFiles = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/files/assignments", {
        method: "GET",
        headers: { token: localStorage.token, forumid },
      });

      const parseRes = await response.json();

      setFiles(parseRes.map((file) => ({ ...file, loading: false })));
    } catch (error) {
      console.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getFiles();
  }, []);

  const handleFileUpload = async () => {
    try {
      setLoadingFileUpload(true);

      if (!file) {
        setNotification({
          open: true,
          severity: "error",
          message: "No file selected!",
        });
        return setLoadingFileUpload(false);
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/files/assignments", {
        method: "POST",
        headers: { token: localStorage.token, forumid },
        body: formData,
      });

      const parseRes = await response.json();

      if (parseRes.status === true) {
        setFiles([{ ...parseRes.file, isowner: true }, ...files]);
        setNotification({
          open: true,
          severity: "success",
          message: parseRes.message,
        });
      } else {
        setNotification({
          open: true,
          severity: "error",
          message: parseRes.message,
        });
      }

      setFile(null);
      return setLoadingFileUpload(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileView = async (key) => {
    setFiles(
      files.map((file) =>
        file.aws_name === key ? { ...file, loading: true } : file
      )
    );

    try {
      if (!key) {
        return setNotification({
          open: true,
          severity: "error",
          message: "No file!",
        });
      }

      const response = await fetch(`/api/files/assignments/${key}`, {
        method: "GET",
        headers: { token: localStorage.token },
      });

      const parseRes = await response.json();

      const file = new Blob([new Uint8Array(parseRes.file.data)], {
        type: parseRes.fileType,
      });

      const fileURL = URL.createObjectURL(file);

      return window.open(fileURL);
    } catch (error) {
      console.error(error);
    }

    return setFiles(
      files.map((file) =>
        file.aws_name === key ? { ...file, loading: false } : file
      )
    );
  };

  const handleFileRemove = async (key) => {
    setFiles(
      files.map((file) =>
        file.aws_name === key ? { ...file, loading: true } : file
      )
    );

    try {
      const response = await fetch(`/api/files/assignments/${key}`, {
        method: "DELETE",
        headers: { token: localStorage.token },
      });

      const parseRes = await response.json();

      if (parseRes.status === true) {
        setFiles(files.filter((file) => file.aws_name !== key));
        return setNotification({
          open: true,
          severity: "success",
          message: parseRes.message,
        });
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
        message: error,
      });
    }
    setFiles(
      files.map((file) =>
        file.aws_name === key ? { ...file, loading: false } : file
      )
    );
  };

  return (
    <>
      <div>
        <Box display="flex" m={3} justifyContent="center">
          <ButtonGroup>
            <Button
              startIcon={<PublishIcon />}
              variant="contained"
              color="secondary"
              component="label"
              disabled={loadingFileUpload}
              disableElevation
            >
              Select file
              <input
                className={classes.upload}
                id="file-upload"
                type="file"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  e.target.value = null;
                }}
                hidden
              />
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleFileUpload}
              disabled={loadingFileUpload}
            >
              {loadingFileUpload ? "Uploading file..." : "Upload file"}
            </Button>
          </ButtonGroup>
          {file && file.name}
        </Box>

        <div>
          {!loading ? (
            files.length === 0 ? (
              <Box display="flex" justifyContent="center" m={2}>
                <Typography variant="h4"> No files yet!</Typography>
              </Box>
            ) : (
              files.map((file) => (
                <div key={file.id}>
                  <Card className={classes.card} variant="elevation">
                    <CardContent>
                      <Typography
                        className={classes.title}
                        color="textSecondary"
                        gutterBottom
                      >
                        {`${dayjs(file.date).format("DD/MM/YYYY")} (${dayjs(
                          file.date
                        ).fromNow()})`}
                      </Typography>

                      <Grid container wrap="nowrap" spacing={0}>
                        <Typography variant="h6" component="h2">
                          {file.filename}
                        </Typography>
                      </Grid>

                      <Typography color="textSecondary">
                        {`${byteSize(file.size)}`}
                      </Typography>
                    </CardContent>

                    <div className={classes.buttons}>
                      <CardActions>
                        {(userInformation.type !== "Student" ||
                          file.isowner) && (
                          <Button
                            variant="contained"
                            style={
                              file.loading
                                ? undefined
                                : {
                                    backgroundColor: "#d11a2a",
                                    color: "white",
                                  }
                            }
                            onClick={() => handleFileRemove(file.aws_name)}
                            disabled={file.loading}
                          >
                            Delete
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          colour="primary"
                          onClick={() => handleFileView(file.aws_name)}
                          disabled={file.loading}
                        >
                          View
                        </Button>
                      </CardActions>
                    </div>
                  </Card>
                </div>
              ))
            )
          ) : (
            <div className={classes.noData}>
              <Loading />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Assignments;
