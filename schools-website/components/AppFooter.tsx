import React from 'react';
import { Box, Typography, Link as MuiLink } from '@mui/material';

const AppFooter: React.FC = () => {
  return (
    <Box sx={{
      mt: 4,
      py: 3,
      px: 2,
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)'),
      borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      textAlign: 'center',
      color: (theme) => theme.palette.text.secondary,
      backdropFilter: 'blur(16px)',
    }}>
      <Typography variant="body2">
        © 2025 Essential X, All Rights Reserved. |{' '}
        <MuiLink
          href="https://www.linkedin.com/company/essentialx/"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Our LinkedIn
        </MuiLink>
      </Typography>
    </Box>
  );
};

export default AppFooter;
