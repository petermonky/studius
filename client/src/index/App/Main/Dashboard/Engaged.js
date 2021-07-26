import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MaterialLink from "@material-ui/core/Link";
import React from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { Link as RouterLink } from "react-router-dom";
import { Grid } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Loading from "../../../shared/Loading";

const useStyles = makeStyles((theme) => ({
  noData: {
    paddingTop: theme.spacing(45),
  },
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const defaultProps = {
  bgcolor: "background.paper",
  borderColor: "grey.500",
  border: 1,
};

const Engaged = ({ match, userInformation }) => {
  const classes = useStyles();

  const [loading, setLoading] = useState(true);

  const [forums, setForums] = useState([]);

  // get the forums
  const getEngaged = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/dashboard/engaged", {
        method: "GET",
        headers: { token: localStorage.token },
      });

      const parseRes = await response.json();

      setForums(parseRes.forums);
    } catch (error) {
      console.error(error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    getEngaged();
  }, []);

  return !loading ? (
    forums.length === 0 ? (
      <Typography align="center" className={classes.noData} variant="h5">
        <MaterialLink component={RouterLink} to={`/main/marketplace`}>
          Meet a{" "}
          {userInformation.type === "Tutor"
            ? "student"
            : userInformation.type === "Student"
            ? "tutor"
            : ""}
        </MaterialLink>{" "}
        to get started!
      </Typography>
    ) : (
      <>
        <Box display="flex" m={1}>
          <Grid direction="row" container spacing={2}>
            {forums.map((forum, index) => (
              <Grid item xs={8} sm={3} key={index}>
                <Box borderRadius={5} {...defaultProps}>
                  <Card className={classes.root}>
                    <CardActionArea
                      className={classes.root}
                      component={RouterLink}
                      to={`forum/${forum.id}/announcements`}
                    >
                      <CardContent>
                        <Typography variant="h5" component="h2">
                          {forum.subject}
                        </Typography>
                        <Typography
                          className={classes.pos}
                          color="textSecondary"
                        >
                          {userInformation.type === "Student"
                            ? `Tutor: ${forum.tutor_name}`
                            : `Student: ${forum.student_name}`}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </>
    )
  ) : (
    <div className={classes.noData}>
      <Loading />
    </div>
  );
};

export default Engaged;
