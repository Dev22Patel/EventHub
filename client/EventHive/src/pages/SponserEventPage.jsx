import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, Container, Grid, Box, CircularProgress } from '@mui/material';
import { CalendarToday, LocationOn, Gavel } from '@mui/icons-material';

const EventCard = ({ event }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        className="w-full h-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ scale: 1.03 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Link to={`/events/${event._id}`} className="block h-full no-underline">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            {/* Remove the image section entirely */}
            <div className="p-4 flex-grow">
              <h2 className="text-xl font-bold text-black mb-1">{event.title}</h2>
              <motion.p 
                className="text-sm text-gray-600 mb-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
              >
                {event.description}
              </motion.p>
              <div className="flex items-center mb-2">
                <CalendarToday className="w-4 h-4 mr-2 text-gray-500" />
                <Typography variant="body2" className="text-gray-600">
                  {new Date(event.date).toLocaleDateString()}
                </Typography>
              </div>
              <div className="flex items-center">
                <LocationOn className="w-4 h-4 mr-2 text-gray-500" />
                <Typography variant="body2" className="text-gray-600">
                  {event.location || 'Virtual Event'}
                </Typography>
              </div>
            </div>
            <div className="px-4 pb-4">
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-black text-white px-4 py-2 rounded-full inline-flex items-center"
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    <span>{event.auctions.length} Auction{event.auctions.length !== 1 ? 's' : ''}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };


const SponsorEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:3000/api/events');
          setEvents(response.data);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch events. Please try again later.');
          setLoading(false);
        }
      };


    fetchEvents();
  }, []);

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

  return (
    <Container maxWidth="lg" className="mt-8 mb-8">
      <Typography variant="h3" gutterBottom align="center" className="font-bold mb-8">
        Sponsorship Opportunities
      </Typography>

      <Grid container spacing={4}>
        {events.map((event) => (
          <Grid item key={event._id} xs={12} sm={6} md={4}>
            <EventCard event={event} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SponsorEventsPage;
