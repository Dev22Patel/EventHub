import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Grid,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  LinearProgress,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  CameraAlt as CameraAltIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  AttachMoney as AttachMoneyIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, hostedEvents, sponsoredEvents, updateProfile, logout, updateProfileImage } = useAuth();
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    userType: user?.userType || '',
    companyName: user?.companyName || '',
    companyWebsite: user?.companyWebsite || '',
    industry: user?.industry || '',
    sponsorshipBudget: user?.sponsorshipBudget || '',
    bio: user?.bio || '',
    verificationDocument: null,
    agreementAccepted: false,
  });
  const [formProgress, setFormProgress] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    calculateFormProgress();
  }, [formData]);

  const calculateFormProgress = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => value !== '' && value !== null && value !== false).length;
    setFormProgress((filledFields / totalFields) * 100);
  };

  const handleOpenForm = () => setOpenForm(true);
  const handleCloseForm = () => setOpenForm(false);
  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData(prevData => ({ ...prevData, verificationDocument: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    handleCloseForm();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await updateProfileImage(file);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: 2 }}>
        {!user?.isProfileComplete && (
          <Alert severity="info" sx={{ mb: 4 }}>
            Please complete your profile to become verified and access all features.
          </Alert>
        )}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box display="flex" alignItems="center">
            <Box position="relative">
              <Avatar
                src={user?.avatarUrl}
                alt={user?.name}
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
                {user?.name}
                {user?.isProfileComplete && (
                  <VerifiedIcon sx={{ ml: 1, color: 'primary.main' }} />
                )}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {/* {user?.userType === 'sponsor' ? 'Sponsor' : 'Event Host'} */}
              </Typography>
            </Box>
          </Box>
          {user?.isProfileComplete && (
            <Chip
              icon={<VerifiedIcon />}
              label="Verified User"
              color="primary"
              variant="outlined"
            />
          )}
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
                <Typography>{user?.email || 'Not provided'}</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <PhoneIcon color="action" sx={{ mr: 1 }} />
                <Typography>{user?.phone || 'Not provided'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Bio</Typography>
              <Typography>{user?.bio || 'No bio provided'}</Typography>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>Hosted Events</Typography>
            {hostedEvents.length > 0 ? (
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
            ) : (
              <Typography>No events hosted yet.</Typography>
            )}
          </Box>
        )}

        {tabValue === 2 && (
            <Box>
  <Typography variant="h6" gutterBottom>Sponsored Events</Typography>
  {sponsoredEvents && sponsoredEvents.participatedAuctions.length > 0 ? (
    <List>
      {sponsoredEvents.participatedAuctions.map((auction) => (
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
  ) : (
    <Typography>No events sponsored yet.</Typography>
  )}
</Box>

        )}

        <Box mt={4} display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleOpenForm}
          >
            {user?.isProfileComplete ? 'Edit Profile' : 'Complete Profile'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
          <DialogTitle>
            {user?.isProfileComplete ? 'Edit Profile' : 'Complete Your Profile'}
          </DialogTitle>
          <LinearProgress variant="determinate" value={formProgress} sx={{ mb: 2 }} />
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Website"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sponsorship Budget"
                    name="sponsorshipBudget"
                    value={formData.sponsorshipBudget}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <AttachMoneyIcon />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    multiline
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                  >
                    Upload Verification Document
                    <input
                      type="file"
                      hidden
                      onChange={handleFileUpload}
                    />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.agreementAccepted}
                        onChange={handleChange}
                        name="agreementAccepted"
                      />
                    }
                    label="I accept the terms and conditions"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseForm}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Save</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Paper>
    </Container>
  );
}
