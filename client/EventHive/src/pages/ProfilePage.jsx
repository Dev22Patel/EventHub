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
      <Paper elevation={3} sx={{ mt: 4, p: 4 }}>
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
              label="Verified User"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">User Information</Typography>
            <Typography>Name: {user?.name || 'Not provided'}</Typography>
            <Typography>Email: {user?.email || 'Not provided'}</Typography>
            <Typography>Phone: {user?.phone || 'Not provided'}</Typography>
            <Typography>User Type: {user?.userType || 'Not specified'}</Typography>
          </Grid>
          {user?.userType === 'sponsor' && (
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Company Information</Typography>
              <Typography>Company: {user?.companyName || 'Not provided'}</Typography>
              <Typography>Website: {user?.companyWebsite || 'Not provided'}</Typography>
              <Typography>Industry: {user?.industry || 'Not provided'}</Typography>
              <Typography>Budget: {user?.sponsorshipBudget || 'Not provided'}</Typography>
            </Grid>
          )}
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
                    margin="normal"
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Select
                    fullWidth
                    margin="normal"
                    label="User Type"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="sponsor">Sponsor</MenuItem>
                    <MenuItem value="eventHost">Event Host</MenuItem>
                  </Select>
                </Grid>
                {formData.userType === 'sponsor' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Company Name"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Company Website"
                        name="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Sponsorship Budget"
                        name="sponsorshipBudget"
                        value={formData.sponsorshipBudget}
                        onChange={handleChange}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={12}>
                  <input
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    id="verification-document"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="verification-document">
                    <Button variant="contained" component="span">
                      Upload Verification Document
                    </Button>
                  </label>
                  {formData.verificationDocument && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      File uploaded: {formData.verificationDocument.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.agreementAccepted}
                        onChange={handleChange}
                        name="agreementAccepted"
                        color="primary"
                        required
                      />
                    }
                    label="I agree to the terms and conditions"
                  />
                </Grid>
              </Grid>
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
