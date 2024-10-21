import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";
import { Link } from "react-router-dom";
import GavelIcon from "@mui/icons-material/Gavel";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { isAuthenticated, setIsAuthenticated , user, isAdmin, setIsAdmin } = useAuth();
  const handleLogout = () => {
    // localStorage.removeItem("token");
    setIsAdmin(false);
    setIsAuthenticated(false);
    // logout();
    navigate("/auth");
  };

  if (isAdmin) {
    return (
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: "1px solid #e0e0e0" }}
      >
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center">
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <GavelIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography
                  variant="h5"
                  component="span"
                  sx={{ fontWeight: "bold" }}
                >
                  EventHive
                </Typography>
              </Link>
            </Box>
          </Typography>
          <Link to="/auth" style={{ textDecoration: "none" }}>
            <Button
              variant="outlined"
              color="primary"
              sx={{ my: 1, mx: 1.5 }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Link>
        </Toolbar>
      </AppBar>
    );
  } else {
    return (
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: "1px solid #e0e0e0" }}
      >
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center">
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <GavelIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography
                  variant="h5"
                  component="span"
                  sx={{ fontWeight: "bold" }}
                >
                  EventHive
                </Typography>
              </Link>
            </Box>
          </Typography>
          <nav>
            <Link to="/events" style={{ textDecoration: "none" }}>
              <Button
                color="inherit"
                sx={{ my: 1, mx: 1.5, color: "text.primary" }}
              >
                Sponsor Events
              </Button>
            </Link>
            <Link to="/create-event" style={{ textDecoration: "none" }}>
              <Button
                color="inherit"
                sx={{ my: 1, mx: 1.5, color: "text.primary" }}
              >
                Create Events
              </Button>
            </Link>
            <Link to="/sponsors" style={{ textDecoration: "none" }}>
              <Button
                color="inherit"
                sx={{ my: 1, mx: 1.5, color: "text.primary" }}
              >
                Sponsors List
              </Button>
            </Link>
          </nav>
          {!isAuthenticated ? (
            <Link to="/auth" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                color="primary"
                sx={{ my: 1, mx: 1.5 }}
              >
                Login / Register
              </Button>
            </Link>
          ) : (
            <Link to="/profile" style={{ textDecoration: "none" }}>
              <IconButton sx={{ ml: 1 }}>
                <Avatar src={user?.avatarUrl} alt={user?.name}>
                  {user?.name?.charAt(0)}
                </Avatar>
              </IconButton>
            </Link>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}
