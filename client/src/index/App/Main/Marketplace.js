import { useState, useEffect } from "react";
import { Switch, Route, Redirect, useParams } from "react-router-dom";

import Profiles from "./Marketplace/Profiles";
import ProfileView from "./Marketplace/ProfileView";

const Marketplace = ({
  match,
  setNotification,
  userInformation,
  setAppBarTitle,
}) => {
  const { id } = useParams();

  // return !id ? <Profiles />

  useEffect(() => {
    setAppBarTitle("Marketplace");
  }, [setAppBarTitle]);

  // const [profile, setProfile] = useState({
  //   isSet: false,
  //   firstname: "",
  //   lastname: "",
  //   subjects: [],
  //   rate: "",
  //   times: [],
  //   description: "",
  // });

  // const handleProfileOpen = (profile) => () => {
  //   const {
  //     id,
  //     firstname,
  //     lastname,
  //     subjects,
  //     rate,
  //     times,
  //     education,
  //     description,
  //   } = profile;
  //   setProfile({
  //     isSet: true,
  //     id: id,
  //     firstname: firstname,
  //     lastname: lastname,
  //     subjects: subjects,
  //     rate: rate,
  //     times: times,
  //     education: education,
  //     description: description,
  //   });
  // };

  // const [credentialsURL, setCredentialsURL] = useState("");

  // const handleInitialiseCredentials = async (tutorProfileId) => {
  //   try {
  //     const response = await fetch("/api/files/credentials", {
  //       method: "GET",
  //       headers: { token: localStorage.token, credentialsId: tutorProfileId },
  //       responseType: "blob",
  //     });

  //     const blobRes = await response.blob();

  //     if (blobRes.type === "application/pdf") {
  //       const file = new Blob([blobRes], { type: blobRes.type });

  //       const fileURL = URL.createObjectURL(file);

  //       setCredentialsURL(fileURL);
  //       console.log(fileURL);
  //     } else {
  //       setCredentialsURL("");
  //     }
  //   } catch (error) {
  //     console.error(error.message);
  //   }
  // };

  // return !id ? (
  //   <Profiles />
  // ) : (
  //   (<ProfileView
  //     {...props}
  //     userInformation={userInformation}
  //     setNotification={setNotification}
  //   />)(
  //     <>
  //       <Switch>
  //         <Route
  //           exact
  //           path={`${match.url}`}
  //           render={(props) => <Profiles {...props} />}
  //         />
  //         <Route
  //           path={`${match.url}/view`}
  //           render={(props) =>
  //             profile.isSet ? (
  //               <ProfileView
  //                 {...props}
  //                 userInformation={userInformation}
  //                 setNotification={setNotification}
  //               />
  //             ) : (
  //               <Redirect to={match.url} />
  //             )
  //           }
  //         />
  //       </Switch>
  //     </>
  //   )
  // );
  return (
    <Switch>
      <Route
        exact
        path="/main/marketplace"
        render={(props) => (
          <Profiles
            {...props}
            setNotification={setNotification}
            userInformation={userInformation}
          />
        )}
      />
      <Route
        path="/main/marketplace/:id"
        render={(props) => (
          <ProfileView
            {...props}
            setNotification={setNotification}
            userInformation={userInformation}
          />
        )}
      />
    </Switch>
  );
};

export default Marketplace;
