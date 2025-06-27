import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Box, Button, CircularProgress, Typography, useTheme, useMediaQuery } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import AuctionBiddingInterface from './AuctionBiddingInterface';
import useAuctionSocket from '../hooks/useAuctionSocket';

const AuctionBiddingPage = () => {
  const [auction, setAuction] = useState(null);
  const [leaderboard, setLeaderboard] = useState({
    topBids: [],
    totalBids: 0,
    uniqueBidders: 0,
    currentLeader: null,
    currentHighestBid: 0,
    minimumNextBid: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverTime, setServerTime] = useState(new Date());
  const [isEnded, setIsEnded] = useState(false);
  const [showFinishedPopup, setShowFinishedPopup] = useState(false);

  const { eventId, auctionId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userId = localStorage.getItem('userId');
  const lastBidAmountRef = useRef(0);

  const calculateEndTime = useCallback((auctionData) => {
    if (!auctionData?.createdAt || !auctionData?.duration) return null;
    return new Date(new Date(auctionData.createdAt).getTime() + auctionData.duration * 60 * 1000);
  }, []);

  const hasShownEndedPopup = useCallback((auctionId) => {
    return localStorage.getItem(`auction_ended_popup_${auctionId}`) === 'shown';
  }, []);

  const markEndedPopupAsShown = useCallback((auctionId) => {
    localStorage.setItem(`auction_ended_popup_${auctionId}`, 'shown');
  }, []);

  const { socketConnected, newBidAlert, snackbar, setSnackbar, initializeSocket, cleanupSocket, refreshLeaderboard } = useAuctionSocket({
    userId,
    auctionId,
    eventId,
    setLeaderboard,
    setAuction,
    setServerTime,
    setIsEnded,
    setShowFinishedPopup,
    hasShownEndedPopup,
    markEndedPopupAsShown,
    lastBidAmountRef
  });

  const fetchAuction = useCallback(async () => {
    try {
      if (!eventId || !auctionId) {
        throw new Error("Missing eventId or auctionId");
      }

      const response = await axios.get(`http://localhost:3000/api/events/${eventId}/auctions/${auctionId}`);
      const auctionData = response.data;

      const endTime = calculateEndTime(auctionData);
      const now = new Date(auctionData.serverTime || Date.now());
      const isAuctionEnded = endTime ? now >= endTime : false;

      setAuction(auctionData);
      setIsEnded(isAuctionEnded || auctionData.status === 'finished');
      setServerTime(new Date(auctionData.serverTime || Date.now()));

      if (auctionData.leaderboard) {
        setLeaderboard(auctionData.leaderboard);
        lastBidAmountRef.current = auctionData.leaderboard.currentHighestBid || 0;
      }

      if ((isAuctionEnded || auctionData.status === 'finished') && !hasShownEndedPopup(auctionId)) {
        setShowFinishedPopup(true);
        markEndedPopupAsShown(auctionId);
      }
    } catch (err) {
      console.error('Fetch auction error:', err);
      setError(`Failed to fetch auction details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [eventId, auctionId, calculateEndTime, hasShownEndedPopup, markEndedPopupAsShown]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;

      try {
        await fetchAuction();
        if (mounted) {
          initializeSocket();
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();

    return () => {
      mounted = false;
      cleanupSocket();
    };
  }, [fetchAuction, initializeSocket, cleanupSocket]);

  if (loading && !auction) {
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
            Back to Event
          </Button>
        </Box>
        <AuctionBiddingInterface
          auction={auction}
          leaderboard={leaderboard}
          isEnded={isEnded}
          userId={userId}
          socketConnected={socketConnected}
          newBidAlert={newBidAlert}
          snackbar={snackbar}
          setSnackbar={setSnackbar}
          refreshLeaderboard={refreshLeaderboard}
          showFinishedPopup={showFinishedPopup}
          setShowFinishedPopup={setShowFinishedPopup}
          calculateEndTime={calculateEndTime}
          eventId={eventId}
          auctionId={auctionId}
        />
      </motion.div>
    </Container>
  );
};

export default AuctionBiddingPage;
