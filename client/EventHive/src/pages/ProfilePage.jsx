import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  Grid,
  Paper,
  Chip,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Logout as LogoutIcon,
  CameraAlt as CameraAltIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, hostedEvents, sponsoredEvents, logout, updateProfileImage } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  let imagep=null;
  if(localStorage.getItem('profileImage')){
    imagep=localStorage.getItem('profileImage');
  }
  const [profileImage, setProfileImage] = useState(imagep);
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`https://eventhub-2dqv.onrender.com/api/auth/user/${userId}`)

        if (response.status !== 200) {
          throw new Error('Failed to fetch user details');
        }

        setUserDetails(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file) {
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64String = reader.result;
          localStorage.setItem('profileImage', base64String); // Save image in localStorage
          setProfileImage(base64String); // Update the local state with the new image
        };

        reader.readAsDataURL(file); // Convert image to base64 string
      }
    }
  };



  const currentUser = userDetails || user;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: 2 }}>

        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box display="flex" alignItems="center">
            <Box position="relative">
              <Avatar
                src={profileImage!=null ? profileImage : (currentUser?.avatarUrl)}
                alt={currentUser?.name}
                sx={{ width: 120, height: 120, mr: 3 }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'background.paper',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <CameraAltIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center">
                {currentUser?.username}

              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {currentUser?.email}
              </Typography>
            </Box>
          </Box>

        </Box>

        <Divider sx={{ my: 3 }} />

        <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="Profile" />
          <Tab label="Hosted Events" />
          <Tab label="Sponsored Events" />
        </Tabs>

        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>User Information</Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <EmailIcon color="action" sx={{ mr: 1 }} />
                <Typography>{currentUser?.email || 'Not provided'}</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <PhoneIcon color="action" sx={{ mr: 1 }} />
                <Typography>{currentUser?.phone || 'Not provided'}</Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>Hosted Events</Typography>
            {hostedEvents.length > 0 ? (
              <Box
                style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  padding: '8px',
                  borderRadius: '4px'
                }}
              >
                <List>
                  {hostedEvents.map((event) => (
                    <ListItem key={event._id}>
                      <ListItemText
                        primary={event.title}
                        secondary={`Date: ${new Date(event.date).toLocaleDateString()} - Location: ${event.location}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <Typography>No events hosted yet.</Typography>
            )}
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Sponsored Events</Typography>
            {sponsoredEvents && sponsoredEvents.length > 0 ? (
              <Box
                style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  padding: '8px',
                  borderRadius: '4px'
                }}
              >
                <List>
                  {sponsoredEvents.map((auction) => (
                    <ListItem key={auction._id}>
                      <ListItemText
                        primary={auction.itemName}
                        secondary={`Date: ${new Date(auction.createdAt).toLocaleDateString()} - Description: ${auction.itemDescription}`}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Status: {auction.status} - Current Highest Bid: ${auction.currentHighestBid}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <Typography>No events sponsored yet.</Typography>
            )}
          </Box>
        )}

        <Box mt={4} display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
