import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import InfoIcon from "@material-ui/icons/Info";
import { Link } from "react-router-dom";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import WarningIcon from "@material-ui/icons/Warning";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  menuPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    height: 600,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const Menu = ({ match }) => {
  const classes = useStyles();

  return (
    <Paper className={classes.menuPaper} elevation={2}>
      <List>
        <ListItem
          button
          key={"Account information"}
          component={Link}
          to={`${match.url}/account-information`}
        >
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText
            primary={<Typography noWrap>Account information</Typography>}
          />
        </ListItem>
        <ListItem
          button
          key={"Advanced"}
          component={Link}
          to={`${match.url}/advanced`}
        >
          <ListItemIcon>
            <WarningIcon />
          </ListItemIcon>
          <ListItemText primary={<Typography noWrap>Advanced</Typography>} />
        </ListItem>
        <ListItem
          button
          key={"Dashboard"}
          component={Link}
          to="/main/dashboard"
        >
          <ListItemIcon>
            <ArrowBackIcon />
          </ListItemIcon>
          <ListItemText
            primary={<Typography noWrap>Return to dashboard</Typography>}
          />
        </ListItem>
      </List>
    </Paper>
  );
};

export default Menu;
