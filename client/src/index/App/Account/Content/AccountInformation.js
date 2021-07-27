import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Loading from "../../../shared/Loading";

const useStyles = makeStyles((theme) => ({
  noData: {
    paddingTop: theme.spacing(25),
  },
  title: {
    padding: theme.spacing(2),
  },
  list: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
}));

const AccountInformation = ({
  loading,
  accountInformation,
  handleDialogueOpen,
}) => {
  const classes = useStyles();

  return (
    <>
      <Typography variant="h4" className={classes.title} noWrap>
        Account information
      </Typography>
      {!loading ? (
        <List className={classes.list}>
          {["First name", "Last name", "Email address", "Password"].map(
            (type, index) => (
              <>
                <ListItem alignItems="center" key={type}>
                  <ListItemText
                    primary={
                      <Typography gutterBottom variant="h5">
                        {type}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body1"
                          color="textPrimary"
                        >
                          {
                            accountInformation[
                              Object.keys(accountInformation)[index]
                            ]
                          }
                        </Typography>
                      </>
                    }
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDialogueOpen(type)}
                  >
                    Edit
                  </Button>
                </ListItem>
                <Divider component="li" />
              </>
            )
          )}
        </List>
      ) : (
        <div className={classes.noData}>
          <Loading />
        </div>
      )}
    </>
  );
};

export default AccountInformation;
