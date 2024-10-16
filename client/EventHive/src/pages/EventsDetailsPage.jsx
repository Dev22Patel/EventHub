import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Container,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import { CalendarToday, LocationOn, Gavel, ArrowBack } from '@mui/icons-material';

const EventDetailsPage = () => {
  const [event, setEvent] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { eventId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventResponse = await axios.get(`http://localhost:3000/api/events/${eventId}`);
        setEvent(eventResponse.data);

        const auctionPromises = eventResponse.data.auctions.map((auctionId) =>
          axios.get(`http://localhost:3000/api/auctions/${auctionId}`)
        );
        
        const auctionResponses = await Promise.all(auctionPromises);
        console.log(auctionResponses);
        const auctionData = auctionResponses.map((res) => res.data);
        setAuctions(auctionData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch event details. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error
          </Typography>
          <Typography>{error}</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
        variant="outlined"
      >
        Back to Events
      </Button>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {event.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {event.description}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              <CalendarToday sx={{ mr: 1 }} color="primary" />
              <Typography>
                {new Date(event.date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              <LocationOn sx={{ mr: 1 }} color="primary" />
              <Typography>{event.location || 'Virtual Event'}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Available Auctions
      </Typography>
      <Grid container spacing={3}>
  {auctions.map((auction, index) => (
    <Grid item xs={12} sm={6} md={4} key={auction._id}>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {auction.itemName}
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Chip
              icon={<Gavel />}
              label={`Starting bid: $${auction.startingBid}`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            variant="contained"
            onClick={() => navigate(`/events/${eventId}/auctions/${auction._id}`)}
            fullWidth
          >
            Bid Now
          </Button>
        </CardActions>
      </Card>
    </Grid>
  ))}
</Grid>

    </Container>
  );
};

export default EventDetailsPage;
