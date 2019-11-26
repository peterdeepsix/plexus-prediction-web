import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '../components/Link';

import { useAuth } from "../lib/use-auth";

export default function Predictions() {
  // Get auth state and re-render anytime it changes
  const auth = useAuth();
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Predictions
        </Typography>
        {auth.user ? (
          <Fragment>
            <Typography variant="body1" gutterBottom>
              {auth.user.email} is signed in.
            </Typography>
          </Fragment>
        ) : (
            <Typography variant="body1" gutterBottom>
              No user is currently signed in.
        </Typography>
          )}
        <Button variant="contained" color="primary" component={Link} naked href="/">
          Go to the index page
        </Button>
      </Box>
    </Container>
  );
}
