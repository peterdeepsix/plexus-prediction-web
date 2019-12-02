// Main
import React, { useState } from 'react';
import axios from 'axios';

// Components
import Link from '../components/Link';

// Material-ui
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

// Material-ui styles
const useStyles = makeStyles(theme => ({
  input: {
    display: 'none',
  },
}));

export default function Predictions() {
  const classes = useStyles();

  const [selectedFiles, setSelectedFiles] = useState(null);

  const handleChange = event => {
    const files = event.target.files;
    setSelectedFiles(files)
    console.log(files)
  }
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h5" component="h5" gutterBottom>
          Predictions
        </Typography>
        <Box my={4}>

          <input
            accept="image/*"
            className={classes.input}
            id="contained-button-file"
            multiple
            type="file"
            onChange={handleChange}
          />
        </Box>
        <Box my={4}>
          <label htmlFor="contained-button-file">
            <Button variant="contained" color="primary" component="span">
              Upload Images
                </Button>
          </label>
        </Box>
        <Button variant="contained" color="primary" component={Link} naked href="/">
          Index Page
        </Button>
      </Box>
    </Container >
  );
}
