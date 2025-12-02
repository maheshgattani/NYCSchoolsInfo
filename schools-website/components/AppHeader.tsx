import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

const AppHeader: React.FC = () => {
  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: 'none' }}>
      <Toolbar>
        <Link href="https://www.essentialx.us" passHref legacyBehavior>
          <Typography variant="h6" component="a" sx={{ flexGrow: 1, color: 'white', textDecoration: 'none', cursor: 'pointer' }}>
            <b>EssentialX</b>
          </Typography>
        </Link>
        <Button color="inherit" href="https://www.paypal.com/ncp/payment/MZVYKAFW3NBGQ" sx={{ color: 'white', borderColor: 'white', marginRight: 2 }}>
          Donate
        </Button>
        <Button color="inherit" href="mailto:contact@essentialx.us" sx={{ color: 'white', borderColor: 'white' }}>
          Contact
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
