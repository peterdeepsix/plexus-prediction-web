// Main
import React, { useState, useRef, useEffect } from "react";
import { useContext } from "react";

import "firebase/storage";

// Auth context
import UserContext from "../lib/UserContext";

// Components
import Link from "../components/Link";

// Material-ui
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

// Media recorder
import { ReactMediaRecorder } from "react-media-recorder";

// Material-ui styles
const useStyles = makeStyles(theme => ({
  input: {
    display: "none"
  }
}));

const VideoPreview = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  if (!stream) {
    return null;
  }
  return <video ref={videoRef} width={500} height={500} autoPlay controls />;
};

export default function Record() {
  const classes = useStyles();
  const { firestore, storage, user, handleLogin, handleLogout } = useContext(
    UserContext
  );
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);

  console.log(user);
  const handleChange = event => {
    const files = event.target.files;
    setSelectedFiles(files);
    setImage(files[0]);
    console.log(files);
  };

  const handleUpload = () => {
    const uploadTask = storage
      .ref(`plexus-predictions-up/${image.name}`)
      .put(image);
    uploadTask.on(
      "state_changed",
      snapshot => {
        // progress function ...
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      error => {
        // Error function ...
        console.log(error);
      },
      () => {
        // complete function ...
        let bucket;
        let fullPath;
        let downloadURL;

        storage
          .ref(`plexus-predictions-up/${image.name}`)
          .getMetadata()
          .then(function(metadata) {
            Console.log(metadata);
            bucket = metadata.bucket;
            fullPath = metadata.fullPath;
          })
          .catch(function(error) {
            // Uh-oh, an error occurred!
          });

        downloadURL = storage
          .ref(`plexus-predictions-up/${image.name}`)
          .getDownloadURL()
          .then(function(url) {
            Console.log(url);
            setUrl(url);
          })
          .catch(function(error) {
            // Uh-oh, an error occurred!
          });
        console.log("bucket", bucket);
        console.log("fullPath", fullPath);
        console.log("downloadURL", downloadURL);

        let { uid, email, displayName } = user;

        let newPrediction = {
          url: downloadURL,
          userName: displayName,
          userId: uid,
          email,
          bucket,
          fullPath
        };
        console.log("newPrediction", newPrediction);
        setProgress(0);

        // let predictionAdded = firestore.collection('predictions').add(newPrediction);
        // console.log('prediction added', predictionAdded);
      }
    );
  };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        {user ? (
          <ReactMediaRecorder
            video
            render={({
              status,
              startRecording,
              stopRecording,
              mediaBlobUrl,
              videoPreviewStream
            }) => {
              return (
                <Container maxWidth="sm">
                  <Box my={4}>
                    <Typography variant="h6" component="h6" gutterBottom>
                      Status: {status}
                    </Typography>
                    <LinearProgress variant="determinate" value={progress} />
                  </Box>
                  <Box my={4}>
                    <Button
                      color="primary"
                      component="span"
                      onClick={startRecording}
                    >
                      Start Recording
                    </Button>
                    <Button component="span" onClick={stopRecording}>
                      Stop Recording
                    </Button>
                  </Box>
                  <Box my={4}>
                    <Typography variant="h6" component="h6" gutterBottom>
                      Preview
                    </Typography>
                    <video
                      src={videoPreviewStream}
                      width={500}
                      height={500}
                      autoPlay
                      controls
                    />
                  </Box>
                  <Box my={4}>
                    <Typography variant="h6" component="h6" gutterBottom>
                      Local File
                    </Typography>
                    <video src={mediaBlobUrl} controls autoPlay loop />
                  </Box>
                </Container>
              );
            }}
          />
        ) : (
          <Typography variant="body1" component="body1" gutterBottom>
            Login to record media.
          </Typography>
        )}
      </Box>
    </Container>
  );
}
