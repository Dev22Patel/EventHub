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
  Paper,
  IconButton
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  AttachMoney,
  AccessTime,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateEventPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    eventType: 'in-person',
    location: '',
    date: '',
    image: null,
  });
  const [auctions, setAuctions] = useState([{
    itemName: '',
    itemDescription: '',
    startingBid: '',
    bidIncrement: '',
    duration: '',
  }]);

  const steps = ['Event Details', 'Auction Details'];
  const navigate = useNavigate();

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuctionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAuctions = auctions.map((auction, i) =>
      i === index ? { ...auction, [name]: value } : auction
    );
    setAuctions(updatedAuctions);
  };

  const handleAddAuction = () => {
    setAuctions([...auctions, {
      itemName: '',
      itemDescription: '',
      startingBid: '',
      bidIncrement: '',
      duration: '',
    }]);
  };
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleRemoveAuction = (index) => {
    setAuctions(auctions.filter((_, i) => i !== index));
  };

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setEventData(prev => ({ ...prev, image: reader.result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    console.log(userId);
    if (!userId) {
      alert('You must be logged in to create an event.');
      return;
    }

    const formData = new FormData();

    // Append all event data
    Object.keys(eventData).forEach(key => {
      if (key === 'date') {
        formData.append(key, new Date(eventData[key]).toISOString());
      }  else {
        formData.append(key, eventData[key]);
      }
    });



    // Append user ID as the event host
    formData.append('host', userId);

    // Format auctions and append them
    const formattedAuctions = auctions.map(auction => ({
      itemName: auction.itemName,
      itemDescription: auction.itemDescription,
      startingBid: parseFloat(auction.startingBid),
      bidIncrement: parseFloat(auction.bidIncrement),
      duration: parseInt(auction.duration),
    }));

    formData.append('auctions', JSON.stringify(formattedAuctions));

    // Log FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.post('http://localhost:3000/api/events/createEvent', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Event created successfully:', response.data);
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error.response ? error.response.data : error.message);
      alert('Failed to create event. Please check the console for more details.');
    }
  };
  // ... (keep the handleNext and handleBack functions)

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
                  name="title"
                  variant="outlined"
                  value={eventData.title}
                  onChange={handleEventChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Description"
                  name="description"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={eventData.description}
                  onChange={handleEventChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Event Type</FormLabel>
                  <RadioGroup
                    row
                    name="eventType"
                    value={eventData.eventType}
                    onChange={handleEventChange}
                  >
                    <FormControlLabel value="in-person" control={<Radio />} label="In-person" />
                    <FormControlLabel value="virtual" control={<Radio />} label="Virtual" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {eventData.eventType === 'in-person' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Location"
                    name="location"
                    variant="outlined"
                    value={eventData.location}
                    onChange={handleEventChange}
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Date"
                  name="date"
                  type="date"
                  value={eventData.date}
                  onChange={handleEventChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
            </Grid>
          )}



          {activeStep === 1 && (
            <>
              {auctions.map((auction, index) => (
                <Grid container spacing={3} key={index} sx={{ mb: 4 }}>
                  <Grid item xs={12}>
                    <Typography variant="h6">Auction Item {index + 1}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Auction Item Name"
                      name="itemName"
                      variant="outlined"
                      value={auction.itemName}
                      onChange={(e) => handleAuctionChange(index, e)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Item Description"
                      name="itemDescription"
                      variant="outlined"
                      multiline
                      rows={4}
                      value={auction.itemDescription}
                      onChange={(e) => handleAuctionChange(index, e)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Starting Bid"
                      name="startingBid"
                      variant="outlined"
                      type="number"
                      value={auction.startingBid}
                      onChange={(e) => handleAuctionChange(index, e)}
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
                      name="bidIncrement"
                      variant="outlined"
                      type="number"
                      value={auction.bidIncrement}
                      onChange={(e) => handleAuctionChange(index, e)}
                      InputProps={{
                        startAdornment: <AttachMoney />,
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Auction Duration (minutes)"
                      name="duration"
                      variant="outlined"
                      type="number"
                      value={auction.duration}
                      onChange={(e) => handleAuctionChange(index, e)}
                      InputProps={{
                        startAdornment: <AccessTime />,
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <IconButton onClick={() => handleRemoveAuction(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddAuction}
                sx={{ mt: 2 }}
              >
                Add Another Auction Item
              </Button>
            </>
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
