// Main
import React, { useState } from 'react';
import { useContext } from 'react';

import "firebase/storage";

// Auth context
import UserContext from '../lib/UserContext';

// Components
import Link from '../components/Link';

// Material-ui
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

// Media recorder
import { ReactMediaRecorder } from "react-media-recorder";

// Material-ui styles
const useStyles = makeStyles(theme => ({
    input: {
        display: 'none',
    },
}));

export default function Record() {
    const classes = useStyles();
    const { firestore, storage, user, handleLogin, handleLogout } = useContext(UserContext);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [image, setImage] = useState(null);
    const [url, setUrl] = useState("");
    const [progress, setProgress] = useState(0);

    console.log(user)
    const handleChange = event => {
        const files = event.target.files;
        setSelectedFiles(files)
        setImage(files[0])
        console.log(files)
    }

    const handleUpload = () => {

        const uploadTask = storage.ref(`plexus-predictions-up/${image.name}`).put(image);
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
                let bucket
                let fullPath
                let downloadURL

                storage.ref(`plexus-predictions-up/${image.name}`)
                    .getMetadata()
                    .then(function (metadata) {
                        Console.log(metadata)
                        bucket = metadata.bucket
                        fullPath = metadata.fullPath
                    }).catch(function (error) {
                        // Uh-oh, an error occurred!
                    });

                downloadURL = storage.ref(`plexus-predictions-up/${image.name}`)
                    .getDownloadURL().
                    then(function (url) {
                        Console.log(url)
                        setUrl(url)
                    }).catch(function (error) {
                        // Uh-oh, an error occurred!
                    });
                console.log('bucket', bucket)
                console.log('fullPath', fullPath)
                console.log('downloadURL', downloadURL)

                let { uid, email, displayName } = user;

                let newPrediction = {
                    url: downloadURL,
                    userName: displayName,
                    userId: uid,
                    email,
                    bucket,
                    fullPath
                }
                console.log('newPrediction', newPrediction);
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
                    <React.Fragment>
                          <ReactMediaRecorder
      video
      render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
        <div>
          <p>{status}</p>
          <button onClick={startRecording}>Start Recording</button>
          <button onClick={stopRecording}>Stop Recording</button>
          <video src={mediaBlobUrl} controls autoplay loop />
        </div>
      )}
    />

                        <LinearProgress variant="determinate" value={progress} />

                    </React.Fragment>
                ) : (
                        <Typography variant="body1" component="body1" gutterBottom>
                            Login to record media.
            </Typography>
                    )
                }
            </Box>
        </Container >
    );
}
