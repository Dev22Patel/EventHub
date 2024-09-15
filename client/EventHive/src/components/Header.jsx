import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import GavelIcon from '@mui/icons-material/Gavel';

const Header = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar>
        <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center">
            <GavelIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="span" sx={{ fontWeight: 'bold' }}>
              EventHive
            </Typography>
          </Box>
        </Typography>
        <nav>
          <Link to="/#features" style={{ textDecoration: 'none' }}>
            <Button color="inherit" sx={{ my: 1, mx: 1.5, color: 'black' }}>
              Features
            </Button>
          </Link>
          <Link to="/#hosts" style={{ textDecoration: 'none' }}>
            <Button color="inherit" sx={{ my: 1, mx: 1.5, color: 'black' }}>
              For Hosts
            </Button>
          </Link>
          <Link to="/#sponsors" style={{ textDecoration: 'none' }}>
            <Button color="inherit" sx={{ my: 1, mx: 1.5, color: 'black' }}>
              For Sponsors
            </Button>
          </Link>
        </nav>
        <Link to="/auth" style={{ textDecoration: 'none' }}>
          <Button variant="outlined" color="primary" sx={{ my: 1, mx: 1.5 }}>
            Login / Register
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
