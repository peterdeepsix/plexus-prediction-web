// Main
import React, { useState } from 'react';
import { useContext } from 'react';

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

// Material-ui styles
const useStyles = makeStyles(theme => ({
    input: {
        display: 'none',
    },
}));

export default function Upload() {
    const classes = useStyles();
    const { user, handleLogin, handleLogout } = useContext(UserContext);
    const [selectedFiles, setSelectedFiles] = useState(null);

    const handleChange = event => {
        const files = event.target.files;
        setSelectedFiles(files)
        console.log(files)
    }
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
                            <Button variant="contained" color="primary" component="span">
                                Upload Images
          </Button>
                        </label>
                    </React.Fragment>
                ) : (
                        <Typography variant="h6" component="h6" gutterBottom>
                            Login to upload media.
            </Typography>
                    )
                }
            </Box>
        </Container >
    );
}
