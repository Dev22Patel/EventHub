import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
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
  Alert,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ArrowBack, Gavel, AccessTime } from '@mui/icons-material';

const AuctionBiddingPage = () => {
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const navigate = useNavigate();
    const { eventId, auctionId } = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchAuction = async () => {
      try {
        if (!eventId || !auctionId) {
          throw new Error("Missing eventId or auctionId");
        }
        const response = await axios.get(`http://localhost:3000/api/events/${eventId}/auctions/${auctionId}`);
        setAuction(response.data);
      } catch (err) {
        setError(`Failed to fetch auction details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    //polling
    useEffect(() => {
      fetchAuction();
      const intervalId = setInterval(fetchAuction, 3000);
      return () => clearInterval(intervalId);
    }, [auctionId, eventId]);

    useEffect(() => {
        if (auction) {
          const timer = setInterval(() => {
            const now = new Date();
            const serverTime = new Date(auction.serverTime);
            const auctionEndTime = new Date(auction.auctionEndTime);
            const timeDiff = serverTime.getTime() - now.getTime();
            const difference = auctionEndTime.getTime() - (now.getTime() + timeDiff);

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


    const id = localStorage.getItem('userId');

    const handleBidSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post(`http://localhost:3000/api/events/${eventId}/auctions/${auctionId}/bids`, {
          amount: Number(bidAmount),
          id: id
        });
        setAuction(response.data);
        setSnackbar({ open: true, message: 'Bid placed successfully!', severity: 'success' });
        setBidAmount('');
      } catch (err) {
        console.error('Bid placement error:', err.response?.data || err.message);
        setSnackbar({
          open: true,
          message: `Failed to place bid: ${err.response?.data?.message || err.message}`,
          severity: 'error'
        });
      }
    };

    const isBidValid = () => {
      if (!auction) return false;
      const bidAmountNum = Number(bidAmount);
      return (
        bidAmountNum > auction.currentHighestBid &&
        bidAmountNum >= auction.currentHighestBid + auction.bidIncrement
      );
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

    const isAuctionFinished = auction.status === 'finished' || timeLeft === 'Auction Ended';

    const winner = isAuctionFinished && auction.bids.length > 0
      ? auction.bids.reduce((prev, current) => (prev.amount > current.amount) ? prev : current)
      : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back to Event
        </Button>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                {auction.itemName}
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                {auction.itemDescription}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Gavel fontSize="large" sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                  {isAuctionFinished ? 'Final Bid:' : 'Current Highest Bid:'} ${auction.currentHighestBid}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccessTime fontSize="large" sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">{timeLeft}</Typography>
              </Box>
              {isAuctionFinished ? (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ color: 'success.contrastText' }}>
                    Auction Winner: {winner ? 'Anonymous Bidder' : 'No winner'}
                  </Typography>
                  {winner && (
                    <Typography variant="h6" sx={{ color: 'success.contrastText', mt: 1 }}>
                      Winning Bid: ${winner.amount}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box component="form" onSubmit={handleBidSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Enter your bid"
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    fullWidth
                    variant="outlined"
                    required
                    helperText={`Minimum bid: $${auction.currentHighestBid + auction.bidIncrement}`}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={!isBidValid()}
                  >
                    Place Bid
                  </Button>
                </Box>
              )}
            </Paper>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                Bid History
              </Typography>
              <Box sx={{ height: auction.bids.length === 0 ? 100 : 300, overflow: 'auto' }}>
                <List>
                  {auction.bids
                    .slice()
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 3)
                    .map((bid, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={`Anonymous Bidder`}
                            secondary={`Amount: $${bid.amount}`}
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  {auction.bids.length === 0 && (
                    <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                      No Bidder Currently
                    </Typography>
                  )}
                  {auction.bids.length > 3 && (
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {auction.bids
                        .slice()
                        .sort((a, b) => b.amount - a.amount)
                        .slice(3)
                        .map((bid, index) => (
                          <React.Fragment key={index + 3}>
                            <ListItem>
                              <ListItemText
                                primary={`Anonymous Bidder`}
                                secondary={`Amount: $${bid.amount}`}
                              />
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))}
                    </Box>
                  )}
                </List>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                Auction Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Organizer" secondary={auction.event.title} />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Start Date"
                    secondary={new Date(auction.createdAt).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Starting Bid" secondary={`$${auction.startingBid}`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Bid Increment" secondary={`$${auction.bidIncrement}`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Status" secondary={isAuctionFinished ? "Finished" : "Pending"} />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AuctionBiddingPage;
