import { useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';

const useAuctionSocket = ({
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
}) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [newBidAlert, setNewBidAlert] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);

  const initializeSocket = useCallback(() => {
    if (socketRef.current?.connected || isInitializedRef.current) {
      console.log('Socket already connected or initializing');
      return;
    }

    isInitializedRef.current = true;

    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      autoConnect: true
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setSocketConnected(true);
      socket.emit('authenticate', { userId, auctionId, eventId });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setSocketConnected(false);
      isInitializedRef.current = false;

      if (reason === 'io server disconnect' || reason === 'transport close') {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!socketRef.current?.connected) {
            console.log('Attempting to reconnect...');
            socket.connect();
          }
        }, 2000);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
      isInitializedRef.current = false;
    });

    socket.on('leaderboard_update', (data) => {
      if (data.auctionId === auctionId) {
        setLeaderboard(data.leaderboard);
        setServerTime(new Date(data.serverTime));

        setAuction(prev => {
          if (prev && prev.status !== data.status) {
            const updatedAuction = { ...prev, status: data.status };
            if (data.status === 'finished' || data.updateType === 'auction_ended') {
              setIsEnded(true);
              if (!hasShownEndedPopup(auctionId)) {
                setShowFinishedPopup(true);
                markEndedPopupAsShown(auctionId);
              }
            }
            return updatedAuction;
          }
          return prev;
        });

        if (data.updateType === 'new_bid' && data.leaderboard.currentHighestBid > lastBidAmountRef.current) {
          setNewBidAlert(true);
          setTimeout(() => setNewBidAlert(false), 3000);
          lastBidAmountRef.current = dataMijn.leaderboard.currentHighestBid;
        }
      }
    });

    socket.on('new_bid', (data) => {
      if (data.auctionId === auctionId) {
        const bidderName = data.bidder?.name || 'Anonymous';
        const isCurrentUser = data.bidder?.id === userId;
        setSnackbar({
          open: true,
          message: isCurrentUser
            ? `Your bid of $${data.amount.toLocaleString()} was placed successfully!`
            : `New bid of $${data.amount.toLocaleString()} by ${bidderName}`,
          severity: isCurrentUser ? 'success' : 'info'
        });
      }
    });

    socket.on('auction_leaderboard_update', (data) => {
      if (data.auctionId === auctionId) {
        console.log('Auction leaderboard update:', data);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Connection error occurred',
        severity: 'error'
      });
    });

    return socket;
  }, [userId, auctionId, eventId, setLeaderboard, setAuction, setServerTime, setIsEnded, setShowFinishedPopup, hasShownEndedPopup, markEndedPopupAsShown]);

  const cleanupSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.emit('leave_auction', { auctionId });
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    isInitializedRef.current = false;
    setSocketConnected(false);
  }, [auctionId]);

  const refreshLeaderboard = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('request_leaderboard', { auctionId });
    }
  }, [auctionId]);

  return { socketConnected, newBidAlert, snackbar, setSnackbar, initializeSocket, cleanupSocket, refreshLeaderboard };
};

export default useAuctionSocket;
