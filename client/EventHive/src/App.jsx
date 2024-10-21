import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import CreateEventPage from './pages/CreateEventPage';
import SponsorEventsPage from './pages/SponserEventPage';
import ProfilePage from './pages/ProfilePage';
import EnhancedSponsorsPage from './pages/SponsorsPage';
import EventDetailsPage from './pages/EventsDetailsPage';
import AuctionBiddingPage from './pages/AuctionBiddingPage';
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#424242',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <AuthProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/create-event" element={<CreateEventPage />} />
          <Route path="/events" element={<SponsorEventsPage />} />
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sponsors" element={<EnhancedSponsorsPage />} />
          <Route path="/events/:eventId/auctions/:auctionId" element={<AuctionBiddingPage />} />
        </Routes>
        
        <Footer />
      </Router>
    </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
