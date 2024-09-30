import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Container,
  Box,
  Button,
  Dialog,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { CalendarToday, LocationOn, Gavel } from '@mui/icons-material';

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

        // Fetch auction details using auction IDs
        const auctionPromises = eventResponse.data.auctions.map((auctionId) =>
          axios.get(`http://localhost:3000/api/auctions/${auctionId}`)
        );
        const auctionResponses = await Promise.all(auctionPromises);
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back to Events
      </Button>
      <Box sx={{ mb: 4 }}>
        <img
          src={event.image || 'https://via.placeholder.com/800x400?text=No+Image'}
          alt={event.title}
          style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
        />
      </Box>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
        {event.title}
      </Typography>
      <Typography variant="body1" paragraph>
        {event.description}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CalendarToday fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body2" sx={{ mr: 3 }}>
          {new Date(event.date).toLocaleDateString()}
        </Typography>
        <LocationOn fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body2">{event.location || 'Virtual Event'}</Typography>
      </Box>
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Available Auctions
      </Typography>
      <List>
        {auctions.map((auction, index) => (
          <React.Fragment key={auction._id}>
            {index > 0 && <Divider />}
            <ListItem>
              <ListItemText
                primary={auction.itemName}
                secondary={`Starting Bid: $${auction.startingBid}`}
              />
              <Button
                variant="outlined"
                startIcon={<Gavel />}
                onClick={() => navigate(`/events/${eventId}/auctions/${auction._id}`)}
              >
                Bid Now
              </Button>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Container>
  );
};

export default EventDetailsPage;
