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

const Files = ({ userInformation, setNotification, forumid }) => {
  const classes = useStyles();

  dayjs.extend(relativeTime);

  const [loading, setLoading] = useState(true);
  const [loadingFileUpload, setLoadingFileUpload] = useState(false);

  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);

  const getFiles = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/files/files", {
        method: "GET",
        headers: { token: localStorage.token, forumid },
      });

      const parseRes = await response.json();

      setFiles([...parseRes]);
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

      const response = await fetch("/api/files/files", {
        method: "POST",
        headers: { token: localStorage.token, forumid },
        body: formData,
      });

      const parseRes = await response.json();

      if (parseRes.status === true) {
        setFiles([{ ...parseRes.file, isowner: true }, ...files]);
        console.log(files);
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
    try {
      if (!key) {
        return setNotification({
          open: true,
          severity: "error",
          message: "No file!",
        });
      }

      const response = await fetch(`/api/files/files/${key}`, {
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
  };

  const handleFileRemove = async (key) => {
    try {
      const response = await fetch(`/api/files/files/${key}`, {
        method: "DELETE",
        headers: { token: localStorage.token },
      });

      const parseRes = await response.json();

      if (parseRes.status === true) {
        setFiles(files.filter((file) => file.aws_name !== key));
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
    } catch (error) {
      setNotification({
        open: true,
        severity: "error",
        message: error,
      });
    }
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
                onChange={(e) => setFile(e.target.files[0])}
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
                        {file.isowner && (
                          <Button
                            variant="contained"
                            style={{
                              backgroundColor: "#CC0000",
                              color: "white",
                            }}
                            onClick={() => handleFileRemove(file.aws_name)}
                          >
                            Delete
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          colour="primary"
                          onClick={() => handleFileView(file.aws_name)}
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

export default Files;
