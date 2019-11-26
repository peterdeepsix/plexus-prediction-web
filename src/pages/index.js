import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '../components/Link';

export default function Index() {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Plexus Prediction Engine
        </Typography>
        <Link href="/predictions" color="secondary">
          Go to the predictions page.
        </Link>
      </Box>
    </Container>
  );
}
