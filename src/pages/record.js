// Main
import React, { useState, useRef, useEffect } from "react";
import { useContext } from "react";

import "firebase/storage";

// Auth context
import UserContext from "../lib/UserContext";

// Components
import Link from "../components/Link";
import DefaultUpload from "../components/DefaultUpload"

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
  console.log("stream")
  console.log(stream)

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log("deep stream")
      console.log(stream)
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  if (!stream) {
    return null;
  }
  return <video ref={videoRef} autoPlay controls />;
};

export default function Record() {
  const classes = useStyles();
  const { firestore, storage, user, handleLogin, handleLogout } = useContext(
    UserContext
  );
  const [media, setMedia] = useState(null);
  const [progress, setProgress] = useState(0);

  // const handleSaveMedia = (mediaBlobUrl) => {
  //   console.log("handleSaveMedia")
  //   console.log(mediaBlobUrl)
  //   setMedia(mediaBlobUrl)
  // };

  // const handleUploadMedia = () => {
  //   console.log("handleUploadMedia")
  //   console.log("media to be uploaded")
  //   console.log(media)
  // };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        {user ? (
          <ReactMediaRecorder
            video
            render={({
              status,
              error,
              startRecording,
              stopRecording,
              mediaBlobUrl,
              videoPreviewStream
            }) => {
              return (
                <Container maxWidth="sm">
                  <Box my={4}>
                    <Typography variant="h6" component="h6" gutterBottom>
                      Upload Files
                    </Typography>
                    <Button color="primary" variant="contained">
                        Upload Recording
                      </Button>
                    <DefaultUpload />
                  </Box>
                  <Box my={4}>
                    <Typography variant="h6" component="h6" gutterBottom>
                      Status: {status}
                    </Typography>
                  </Box>
                  <Box my={4}>
                    <Typography variant="h6" component="h6" gutterBottom>
                      Error: {error}
                    </Typography>
                  </Box>
                  <Box my={4}>
                    <Typography variant="h6" component="h6" gutterBottom>
                      Upload Progress
                    </Typography>
                    <LinearProgress variant="determinate" value={progress} />
                  </Box>
                  <Box my={4}>
                    <Button
                    variant="outlined"
                      onClick={startRecording}
                    >
                      Start Recording
                    </Button>
                    {console.log("media")}
                    {console.log(media)}
                    </Box>
                    <Box my={4}>
                      <Button variant="outlined" onClick={stopRecording}>
                        Stop Recording
                      </Button>
                    </Box>
                    <Box my={4}>
                    <Typography variant="h6" component="h6" gutterBottom>
                    videoPreviewStream
                    </Typography>
                    <VideoPreview stream={videoPreviewStream} />
                    </Box>
                  <Box my={4}>
                    <Typography variant="h6" component="h6" gutterBottom>
                      mediaBlobUrl
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
