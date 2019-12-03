// React
import React from 'react'

// Material-ui
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { useContext } from 'react';
import UserContext from '../lib/UserContext';

// Main export
export default function Index() {
  const { user, handleLogin, handleLogout } = useContext(UserContext);
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h2" component="h2" gutterBottom>
          Plexus Prediction Engine
      </Typography>
      </Box>
      {user ? (
        <Typography variant="h6" component="h6" gutterBottom>
          {user.displayName} is logged in as frig!
        </Typography>
      ) : (
          <Typography variant="h6" component="h6" gutterBottom>
            Login yo shit son!
          </Typography>
        )
      }
    </Container>
  )
}