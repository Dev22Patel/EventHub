import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Container,
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { ArrowBack, Gavel, AccessTime, AttachMoney } from '@mui/icons-material';

const AuctionBiddingPage = () => {
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const { eventId, auctionId } = useParams();

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        if (!eventId || !auctionId) {
          throw new Error('Missing eventId or auctionId');
        }
        const response = await axios.get(`http://localhost:3000/api/events/${eventId}/auctions/${auctionId}`);
        setAuction(response.data);
      } catch (err) {
        console.error('Error fetching auction:', err);
        setError(`Failed to fetch auction details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [eventId, auctionId]);

  useEffect(() => {
    if (auction) {
      const timer = setInterval(() => {
        const now = new Date();
        const durationInMs = auction.duration * 60 * 1000; // Convert duration to milliseconds
        const end = new Date(auction.createdAt).getTime() + durationInMs; // Calculate end time
        const difference = end - now.getTime();

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          const seconds = Math.floor((difference / 1000) % 60);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Auction Ended');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [auction]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:3000/api/events/${eventId}/auctions/${auctionId}/bids`, {
        amount: Number(bidAmount),
      });
      setAuction(response.data); // Update auction state with the new auction data
      setSnackbar({ open: true, message: 'Bid placed successfully!', severity: 'success' });
      setBidAmount(''); // Reset bid amount
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to place bid. Please try again.', severity: 'error' });
    }
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

  if (!auction) {
    return null;
  }
  const options = {
    year: 'numeric',
    month: 'long', // "long" for full month name, "short" for abbreviated
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short' // Include time zone abbreviation
};
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back to Event
      </Button>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          {auction.itemName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessTime sx={{ mr: 1 }} />
          <Typography variant="body1" color="text.secondary">
            Time Left: {timeLeft}
          </Typography>
        </Box>
        <Typography variant="body1" paragraph>
          {auction.itemDescription}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Current Highest Bid: ${auction.currentHighestBid}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Starting Bid: ${auction.startingBid}
          </Typography>
        </Box>
        <form onSubmit={handleBidSubmit}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <AttachMoney sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <TextField
              id="bid-amount"
              label="Your Bid"
              type="number"
              variant="standard"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              sx={{ mr: 2 }}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<Gavel />}
              disabled={Number(bidAmount) <= auction.currentHighestBid || Number(bidAmount) < auction.startingBid}
              onClick={handleBidSubmit}
            >
              Place Bid
            </Button>
          </Box>
        </form>
      </Paper>
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Bid History
      </Typography>
      <List>
        {auction.bids.map((bid, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider />}
            <ListItem>
              <ListItemText
                primary={`$${bid.amount}`}
                secondary={`Bidding Time: ${Date(bid.timestamp).toLocaleString('en-US', options)}`}
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AuctionBiddingPage;
