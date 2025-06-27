import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Typography,
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
  DialogActions,
  Badge,
  Card,
  CardContent,
  Chip,
  Avatar
} from '@mui/material';
import {
  Gavel,
  AccessTime,
  TrendingUp,
  EmojiEvents,
  Person,
  Refresh,
  SignalWifiConnectedNoInternet4,
  SignalWifi4Bar
} from '@mui/icons-material';
import { getMinimumBidAmount, getHelperText , isBidValid } from '../utils/auctionUtils';

const AuctionBiddingInterface = ({
  auction,
  leaderboard,
  isEnded,
  userId,
  socketConnected,
  newBidAlert,
  snackbar,
  setSnackbar,
  refreshLeaderboard,
  showFinishedPopup,
  setShowFinishedPopup,
  calculateEndTime,
  eventId,
  auctionId
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isEventHost = useMemo(() => {
    return auction?.event?.host === userId;
  }, [auction?.event?.host, userId]);

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
  }, [auction, isEnded, calculateEndTime]);

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
    if (!isBidValid(bidAmountNum, auction, leaderboard, isEnded)) {
      const minBid = getMinimumBidAmount(auction, leaderboard);
      setSnackbar({
        open: true,
        message: `Bid must be at least $${minBid.toLocaleString()}`,
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:3000/api/events/${eventId}/auctions/${auctionId}/bids`,
        {
          amount: bidAmountNum,
          id: userId,
          userId: userId
        }
      );

      setBidAmount('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to place bid. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getHighestBidder = () => {
    return leaderboard.currentLeader || (auction?.bids?.length > 0 ?
      auction.bids.reduce((prev, current) => (prev.amount > current.amount) ? prev : current) : null);
  };

  const winner = getHighestBidder();
  const currentHighestBid = leaderboard.currentHighestBid || auction.currentHighestBid;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={socketConnected ? <SignalWifi4Bar /> : <SignalWifiConnectedNoInternet4 />}
            label={socketConnected ? 'Live' : 'Disconnected'}
            color={socketConnected ? 'success' : 'error'}
            size="small"
          />
          <Button
            startIcon={<Refresh />}
            onClick={refreshLeaderboard}
            size="small"
            disabled={!socketConnected}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <motion.div
            animate={newBidAlert ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={newBidAlert ? 12 : 8}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 2,
                border: newBidAlert ? `2px solid ${theme.palette.primary.main}` : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                {auction.itemName}
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                {auction.itemDescription}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Badge badgeContent={newBidAlert ? "NEW!" : 0} color="primary">
                  <Gavel fontSize="large" sx={{ color: 'primary.main', mr: 1 }} />
                </Badge>
                <motion.div
                  key={currentHighestBid}
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                    {isEnded ? 'Final Bid:' : 'Current Bid:'} ${currentHighestBid.toLocaleString()}
                  </Typography>
                </motion.div>
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
                    label={leaderboard.totalBids === 0 ? "Enter Starting Bid" : "Your Bid Amount"}
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    fullWidth
                    variant="outlined"
                    required
                    helperText={getHelperText(auction, leaderboard)}
                    disabled={loading}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={!isBidValid(bidAmount, auction, leaderboard, isEnded) || isEventHost || loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : isEventHost ? 'Hosts Cannot Bid' : 'Place Bid'}
                  </Button>
                </Box>
              )}
            </Paper>
          </motion.div>

          {/* Remaining JSX for Leaderboard, Bid History, and Auction Details remains unchanged */}
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <EmojiEvents sx={{ color: 'gold', mr: 1 }} />
              <Typography variant="h5" gutterBottom>
                Live Leaderboard
              </Typography>
              <Chip
                label={`${leaderboard.totalBids} bids`}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6" color="primary">
                      {leaderboard.totalBids}
                    </Typography>
                    <Typography variant="body2">
                      Total Bids
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6" color="primary">
                      {leaderboard.uniqueBidders}
                    </Typography>
                    <Typography variant="body2">
                      Bidders
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6" color="primary">
                      ${getMinimumBidAmount(auction, leaderboard).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Next Bid
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List>
                {leaderboard.topBids.length > 0 ? (
                  leaderboard.topBids.map((bid, index) => (
                    <motion.div
                      key={`${bid.bidderId}-${bid.amount}-${bid.timestamp}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ListItem sx={{
                        bgcolor: bid.isWinning ? 'success.light' : 'background.paper',
                        borderRadius: 1,
                        mb: 1,
                        border: bid.isWinning ? '2px solid' : '1px solid',
                        borderColor: bid.isWinning ? 'success.main' : 'divider'
                      }}>
                        <Avatar sx={{
                          bgcolor: bid.isWinning ? 'success.main' : 'primary.main',
                          mr: 2,
                          width: 32,
                          height: 32
                        }}>
                          {bid.isWinning ? <EmojiEvents /> : bid.rank}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                                Anonymous Bidder {bid.bidderId === userId ? '(You)' : ''}
                              </Typography>
                              {bid.isWinning && (
                                <Chip label="Leading" size="small" color="success" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="h6" color="primary">
                                ${bid.amount.toLocaleString()}
                              </Typography>
                              <Typography variant="caption">
                                {new Date(bid.timestamp).toLocaleTimeString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            #{bid.rank}
                          </Typography>
                          {bid.isWinning && <TrendingUp color="success" />}
                        </Box>
                      </ListItem>
                    </motion.div>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                    No bids placed yet
                  </Typography>
                )}
              </List>
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Bid History
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List>
                {auction.bids && auction.bids.length > 0 ? (
                  auction.bids
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((bid, index) => (
                    <React.Fragment key={`${bid.bidder}-${bid.amount}-${index}`}>
                      <ListItem>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                        <ListItemText
                          primary={`Anonymous Bidder ${bid.bidder === userId ? '(You)' : ''}`}
                          secondary={
                            <Box>
                              <Typography variant="h6" color="primary">
                                ${bid.amount.toLocaleString()}
                              </Typography>
                              <Typography variant="caption">
                                {new Date(bid.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < auction.bids.length - 1 && <Divider />}
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
                  secondary={new Date(auction.auctionEndTime || calculateEndTime(auction)).toLocaleString()}
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
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={isEnded ? "Finished" : "Active"}
                        color={isEnded ? "error" : "success"}
                        size="small"
                      />
                      {socketConnected && (
                        <Chip
                          label="Live Updates"
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

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
                This auction has ended. The winning bid was ${currentHighestBid.toLocaleString()}.
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
    </>
  );
};

export default AuctionBiddingInterface;
