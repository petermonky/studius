import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import RefreshIcon from "@material-ui/icons/Refresh";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  refresh: {
    marginBottom: theme.spacing(2),
  },
}));

const Refresh = ({ loading, click }) => {
  const classes = useStyles();

  return (
    <Box display="flex" className={classes.refresh}>
      <Button
        variant="contained"
        onClick={click}
        startIcon={<RefreshIcon />}
        disabled={loading}
        disableElevation
      >
        Refresh
      </Button>
    </Box>
  );
};

export default Refresh;
