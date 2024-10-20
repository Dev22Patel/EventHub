import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
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
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ArrowBack, Gavel, AccessTime } from '@mui/icons-material';

const AuctionBiddingPage = () => {
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showFinishedPopup, setShowFinishedPopup] = useState(false);
  const navigate = useNavigate();
  const { eventId, auctionId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userId = localStorage.getItem('userId');

  const calculateEndTime = useCallback((auctionData) => {
    if (!auctionData?.createdAt || !auctionData?.duration) return null;
    return new Date(new Date(auctionData.createdAt).getTime() + auctionData.duration * 60 * 1000);
  }, []);

  const isEventHost = useMemo(() => {
    return auction?.event?.host === userId;
  }, [auction?.event?.host, userId]);

  const hasShownEndedPopup = useCallback((auctionId) => {
    return localStorage.getItem(`auction_ended_popup_${auctionId}`) === 'shown';
  }, []);

  const markEndedPopupAsShown = useCallback((auctionId) => {
    localStorage.setItem(`auction_ended_popup_${auctionId}`, 'shown');
  }, []);

  const fetchAuction = useCallback(async () => {
    try {
      if (!eventId || !auctionId) {
        throw new Error("Missing eventId or auctionId");
      }
      const response = await axios.get(`http://localhost:3000/api/events/${eventId}/auctions/${auctionId}`);
      const auctionData = response.data;

      const endTime = calculateEndTime(auctionData);
      const now = new Date();
      const isAuctionEnded = endTime ? now >= endTime : false;

      setAuction(auctionData);
      setIsEnded(isAuctionEnded || auctionData.status === 'finished');

      if ((isAuctionEnded || auctionData.status === 'finished') && !hasShownEndedPopup(auctionId)) {
        setShowFinishedPopup(true);
        markEndedPopupAsShown(auctionId);
      }
    } catch (err) {
      setError(`Failed to fetch auction details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [eventId, auctionId, calculateEndTime]);

  useEffect(() => {
    fetchAuction();
    const intervalId = setInterval(fetchAuction, 5000);
    return () => clearInterval(intervalId);
  }, [fetchAuction]);

  useEffect(() => {
    if (!auction || isEnded) return;

    const endTime = calculateEndTime(auction);
    if (!endTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      if (now >= endTime) {
        setIsEnded(true);
        setTimeLeft('Auction Ended');
        clearInterval(timer);
        fetchAuction();
        return;
      }

      const difference = endTime.getTime() - now.getTime();
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [auction, isEnded, calculateEndTime, fetchAuction]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setSnackbar({
        open: true,
        message: 'Please log in to place a bid',
        severity: 'error'
      });
      return;
    }

    if (isEventHost) {
      setSnackbar({
        open: true,
        message: 'Event hosts cannot bid on their own auctions',
        severity: 'error'
      });
      return;
    }

    const bidAmountNum = Number(bidAmount);
    if (!isBidValid(bidAmountNum)) {
      setSnackbar({
        open: true,
        message: `Bid must be at least $${auction.currentHighestBid + auction.bidIncrement}`,
        severity: 'error'
      });
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/events/${eventId}/auctions/${auctionId}/bids`,
        {
          amount: bidAmountNum,
          id: userId,
          userId:userId
        }
      );
      setLoading(true);
      setAuction(response.data);
      setBidAmount('');
      setSnackbar({
        open: true,
        message: 'Bid placed successfully!',
        severity: 'success'
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to place bid. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
    finally{
        setLoading(false);
    }
  };

  const isBidValid = (amount) => {
    if (!auction || isEnded) return false;
    const bidAmountNum = Number(amount);
    const minimumBid = getMinimumBidAmount();

    return (
      !isNaN(bidAmountNum) &&
      bidAmountNum >= minimumBid
    );
  };

  const getHighestBidder = () => {
    if (!auction || auction.bids.length === 0) return null;

    return auction.bids.reduce((prev, current) => {
      return (prev.amount > current.amount) ? prev : current;
    });
  };

  const getMinimumBidAmount = () => {
    if (!auction) return 0;

    if (auction.bids.length === 0) {
      return auction.startingBid;
    }

    return auction.currentHighestBid + auction.bidIncrement;
  };

  const getHelperText = () => {
    const minBid = getMinimumBidAmount();
    if (auction.bids.length === 0) {
      return `Starting bid: $${minBid.toLocaleString()}`;
    }
    return `Minimum bid: $${minBid.toLocaleString()}`;
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

  if (!auction) return null;
  const winner = getHighestBidder();
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
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
                  {isEnded ? 'Final Bid:' : 'Current Bid:'} ${auction.currentHighestBid.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccessTime fontSize="large" sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" color={isEnded ? 'error' : 'inherit'}>
                  {!timeLeft ? "Auction Ended" : timeLeft}
                </Typography>
              </Box>

              {isEnded ? (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ color: 'success.contrastText' }}>
                    {winner ? `Auction Winner: Anonymous ` : 'No Bids Placed'}
                  </Typography>
                  {winner && (
                    <Typography variant="h6" sx={{ color: 'success.contrastText', mt: 1 }}>
                      Winning Bid: ${winner.amount.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box component="form" onSubmit={handleBidSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label={auction.bids.length === 0 ? "Enter Starting Bid" : "Your Bid Amount"}
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    fullWidth
                    variant="outlined"
                    required
                    helperText={getHelperText()}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={!isBidValid(bidAmount) || isEventHost}
                  >
                    {isEventHost ? 'Hosts Cannot Bid' : 'Place Bid'}
                  </Button>
                </Box>
              )}
            </Paper>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                Bid History
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List>
                  {auction.bids.length > 0 ? (
                    auction.bids
                      .sort((a, b) => b.amount - a.amount)
                      .map((bid, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={`Anonymous Bidder ${bid.userId === userId ? '(You)' : ''}`}
                              secondary={`Bid Amount: $${bid.amount.toLocaleString()}`}
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))
                  ) : (
                    <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                      No bids placed yet
                    </Typography>
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
                  <ListItemText
                    primary="Event"
                    secondary={auction.event.title}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Start Date"
                    secondary={new Date(auction.createdAt).toLocaleString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="End Date"
                    secondary={new Date(auction.auctionEndTime).toLocaleString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Starting Bid"
                    secondary={`$${auction.startingBid.toLocaleString()}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Minimum Increment"
                    secondary={`$${auction.bidIncrement.toLocaleString()}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={isEnded ? "Finished" : "Active"}
                  />
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
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <AnimatePresence>
        {showFinishedPopup && (
          <Dialog
            open={showFinishedPopup}
            onClose={() => setShowFinishedPopup(false)}
            aria-labelledby="auction-finished-dialog-title"
          >
            <DialogTitle id="auction-finished-dialog-title">Auction Finished</DialogTitle>
            <DialogContent>
              <Typography>
                This auction has ended. The winning bid was ${auction.currentHighestBid.toLocaleString()}.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowFinishedPopup(false)} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default AuctionBiddingPage;
