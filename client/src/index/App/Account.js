import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Content from "./Account/Content";
import Menu from "./Account/Menu";

const Account = ({ setAuth, setNotification, ...props }) => {
  return (
    <>
      <Container maxWidth="lg">
        <Grid
          container
          spacing={2}
          direction="row"
          alignItems="center"
          justify="center"
          style={{ minHeight: "100vh" }}
        >
          <Grid item xs={3}>
            <Menu {...props} />
          </Grid>
          <Grid item xs={9}>
            <Content
              {...props}
              setAuth={setAuth}
              setNotification={setNotification}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Account;
