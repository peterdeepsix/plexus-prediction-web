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

// Material-ui styles
const useStyles = makeStyles(theme => ({
    input: {
        display: 'none',
    },
}));

export default function Upload() {
    const classes = useStyles();
    const { storage, user, handleLogin, handleLogout } = useContext(UserContext);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [image, setImage] = useState(null);
    const [url, setUrl] = useState("");
    const [progress, setProgress] = useState(0);

    console.log(storage)
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
                storage
                    .ref("plexus-predictions-up")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        setUrl(url);
                    });
            }
        );
    };

    return (
        <Container maxWidth="sm">
            <Box my={4}>
                {user ? (
                    <React.Fragment>
                        <input
                            accept="image/*"
                            className={classes.input}
                            id="contained-button-file"
                            multiple
                            type="file"
                            onChange={handleChange}
                        />
                        <label htmlFor="contained-button-file">
                            <Button variant="outlined" color="primary" component="span">
                                Select Images
                            </Button>
                        </label>
                        {console.log(selectedFiles)}
                        {selectedFiles ? <Button variant="contained" color="primary" component="span" onClick={handleUpload}>
                            Upload Images
                            </Button> : <Button disabled variant="contained" color="primary" component="span" onClick={handleUpload}>
                                Upload Images
                            </Button>}

                        <img
                            src={url || "https://via.placeholder.com/256x256"}
                            alt="Uploaded Images"
                            height="256"
                            width="256"
                        />
                        <LinearProgress variant="determinate" value={progress} />
                    </React.Fragment>
                ) : (
                        <Typography variant="body1" component="body1" gutterBottom>
                            Login to upload media.
            </Typography>
                    )
                }
            </Box>
        </Container >
    );
}
