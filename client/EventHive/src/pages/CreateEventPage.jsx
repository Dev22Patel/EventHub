import React, { useState } from 'react';
import {
  Typography,
  Button,
  Container,
  Grid,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  AttachMoney,
  AccessTime
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const CreateEventPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState('in-person');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [auctionItemName, setAuctionItemName] = useState('');
  const [auctionItemDescription, setAuctionItemDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [bidIncrement, setBidIncrement] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const steps = ['Event Details', 'Event Image', 'Auction Details'];

  const navigate = useNavigate();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId'); // Change this if you used a different key
    const formData = {
      title: eventName,
      description: eventDescription,
      eventType: eventType,
      location: eventType === 'in-person' ? eventLocation : undefined,
      date: new Date(eventDate).toISOString(),
      image: previewImage,
      host: userId, // Replace with actual host ID (e.g., from user session)
      auctions: [
        {
          itemName: auctionItemName,
          itemDescription: auctionItemDescription,
          startingBid: parseFloat(startingBid),
          bidIncrement: parseFloat(bidIncrement),
          duration: parseInt(auctionDuration),
        }
      ],
    };

    try {
      console.log(formData);
      const response = await axios.post('http://localhost:3000/api/events/createEvent', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Event created successfully:', response.data);
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
        Create Your Event
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Name"
                  variant="outlined"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Event Type</FormLabel>
                  <RadioGroup
                    row
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    <FormControlLabel value="in-person" control={<Radio />} label="In-person" />
                    <FormControlLabel value="virtual" control={<Radio />} label="Virtual" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {eventType === 'in-person' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Location"
                    variant="outlined"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Box sx={{ textAlign: 'center' }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<ImageIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Event Image
                </Button>
              </label>
              {previewImage && (
                <Box
                  sx={{
                    width: '100%',
                    height: 300,
                    backgroundImage: `url(${previewImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 1,
                  }}
                />
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Auction Item Name"
                  variant="outlined"
                  value={auctionItemName}
                  onChange={(e) => setAuctionItemName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={auctionItemDescription}
                  onChange={(e) => setAuctionItemDescription(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Starting Bid"
                  variant="outlined"
                  type="number"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  InputProps={{
                    startAdornment: <AttachMoney />,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bid Increment"
                  variant="outlined"
                  type="number"
                  value={bidIncrement}
                  onChange={(e) => setBidIncrement(e.target.value)}
                  InputProps={{
                    startAdornment: <AttachMoney />,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Auction Duration (hours)"
                  variant="outlined"
                  type="number"
                  value={auctionDuration}
                  onChange={(e) => setAuctionDuration(e.target.value)}
                  InputProps={{
                    startAdornment: <AccessTime />,
                  }}
                  required
                />
              </Grid>
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ChevronLeft />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              type={activeStep === steps.length - 1 ? 'submit' : 'button'}
              onClick={activeStep === steps.length - 1 ? undefined : handleNext}
              endIcon={activeStep === steps.length - 1 ? null : <ChevronRight />}
            >
              {activeStep === steps.length - 1 ? 'Create Event' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </form>
    </Container>
  );
};

export default CreateEventPage;
