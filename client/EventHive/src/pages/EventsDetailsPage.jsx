import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Container,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { CalendarToday, LocationOn, Gavel, AttachMoney } from '@mui/icons-material';

const EventDetailsPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAuction, setOpenAuction] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  const { eventId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/events/${eventId}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch event details. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleOpenAuction = (auction) => {
    navigate(`/events/${eventId}/auctions/${auction._id}`);
  };

  const handleCloseAuction = () => {
    setOpenAuction(false);
    setSelectedAuction(null);
  };

  const handleBidSubmit = () => {
    console.log(`Bid submitted for ${selectedAuction.itemName}: $${bidAmount}`);
    handleCloseAuction();
  };

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
        {event.auctions.map((auction, index) => (
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
                onClick={() => handleOpenAuction(auction)}
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
