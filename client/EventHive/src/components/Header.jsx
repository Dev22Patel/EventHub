import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import GavelIcon from "@mui/icons-material/Gavel";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { isAuthenticated, setIsAuthenticated, user, isAdmin, setIsAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAdmin(false);
    setIsAuthenticated(false);
    navigate("/auth");
  };

  useEffect(() => {
    const imagep = localStorage.getItem('profileImage');
    setProfile(imagep);

    const intId = setInterval(() => {
      const updatedImage = localStorage.getItem('profileImage');
      setProfile(updatedImage);
    }, 1000);

    return () => clearInterval(intId);
  }, []);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const renderAdminNav = () => (
    <Link to="/auth" style={{ textDecoration: "none" }}>
      <Button variant="outlined" color="primary" sx={{ my: 1, mx: 1.5 }} onClick={handleLogout}>
        Logout
      </Button>
    </Link>
  );

  const renderUserNav = () => (
    <>
      <Link to="/events" style={{ textDecoration: "none" }}>
        <Button color="inherit" sx={{ my: 1, mx: 1.5 }}>
          Sponsor Events
        </Button>
      </Link>
      <Link to="/create-event" style={{ textDecoration: "none" }}>
        <Button color="inherit" sx={{ my: 1, mx: 1.5 }}>
          Create Events
        </Button>
      </Link>
      <Link to="/sponsors" style={{ textDecoration: "none" }}>
        <Button color="inherit" sx={{ my: 1, mx: 1.5 }}>
          Sponsors List
        </Button>
      </Link>
    </>
  );

  const renderProfileButton = () => (
    <Link to="/profile" style={{ textDecoration: "none" }}>
      <IconButton sx={{ ml: 1 }}>
        <Avatar src={profile || undefined} alt={user?.name}>
          {user?.name?.charAt(0)}
        </Avatar>
      </IconButton>
    </Link>
  );

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: "1px solid #e0e0e0" }}>
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center">
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <GavelIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h5" component="span" sx={{ fontWeight: "bold" }}>
                  EventHive
                </Typography>
              </Link>
            </Box>
          </Typography>
          {isMobile ? (
            <>
              <IconButton edge="end" color="inherit" onClick={toggleDrawer(true)}>
                <GavelIcon />
              </IconButton>
              <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                <List sx={{ width: 250 }}>
                  {isAuthenticated ? renderUserNav() : (
                    <Link to="/auth" style={{ textDecoration: "none" }}>
                      <ListItem button>
                        <ListItemText primary="Login / Register" />
                      </ListItem>
                    </Link>
                  )}
                  {isAuthenticated && renderProfileButton()}
                </List>
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isAdmin ? renderAdminNav() : renderUserNav()}
              {!isAuthenticated ? (
                <Link to="/auth" style={{ textDecoration: "none" }}>
                  <Button variant="outlined" color="primary" sx={{ my: 1, mx: 1.5 }}>
                    Login / Register
                  </Button>
                </Link>
              ) : (
                renderProfileButton()
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}
