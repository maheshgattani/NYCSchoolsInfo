import React, { ReactNode } from 'react';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import { Box } from '@mui/material';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <AppFooter />
    </Box>
  );
};

export default Layout;
