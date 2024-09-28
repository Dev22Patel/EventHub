import React, { useState } from 'react';
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
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateProfile, logout, updateProfileImage } = useAuth();
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: user?.companyName || '',
    companyWebsite: user?.companyWebsite || '',
    industry: user?.industry || '',
    sponsorshipBudget: user?.sponsorshipBudget || '',
    bio: user?.bio || '',
  });
  const navigate = useNavigate();

  const handleOpenForm = () => setOpenForm(true);
  const handleCloseForm = () => setOpenForm(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
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
      <Paper elevation={3} sx={{ mt: 4, p: 4 }}>
        {!user?.isProfileComplete && (
          <Alert severity="info" sx={{ mb: 4 }}>
            Please complete your profile to become a verified sponsor and access all features.
          </Alert>
        )}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box display="flex" alignItems="center">
            <Box position="relative">
              <Avatar
                src={user?.avatarUrl}
                alt={user?.name}
                sx={{ width: 100, height: 100, mr: 2 }}
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
              <Typography variant="h4" display="flex" alignItems="center">
                {user?.name}
                {user?.isProfileComplete && (
                  <VerifiedIcon sx={{ ml: 1, color: 'primary.main' }} />
                )}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>
          {user?.isProfileComplete && (
            <Chip
              icon={<VerifiedIcon />}
              label="Verified Sponsor"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Company Information</Typography>
            <Typography>{user?.companyName || 'Not provided'}</Typography>
            <Typography>{user?.companyWebsite || 'Not provided'}</Typography>
            <Typography>{user?.industry || 'Not provided'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Sponsorship Details</Typography>
            <Typography>Budget: {user?.sponsorshipBudget || 'Not provided'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Bio</Typography>
            <Typography>{user?.bio || 'No bio provided'}</Typography>
          </Grid>
        </Grid>

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

        <Dialog open={openForm} onClose={handleCloseForm}>
          <DialogTitle>{user?.isProfileComplete ? 'Edit Profile' : 'Complete Your Profile'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Company Website"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Sponsorship Budget"
                name="sponsorshipBudget"
                value={formData.sponsorshipBudget}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Bio"
                name="bio"
                multiline
                rows={4}
                value={formData.bio}
                onChange={handleChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseForm}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Paper>
    </Container>
  );
}
