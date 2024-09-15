import React, { useState } from 'react';
import { Typography, Button, Container, Grid, Card, CardContent, Box } from '@mui/material';
import { CalendarToday, Gavel, People, TrendingUp, EmojiEvents, Spa } from '@mui/icons-material';
import DemoWalkthroughModal from "../components/DemoWalkthroughModal";
import { Link } from 'react-router-dom';
const FeatureCard = ({ icon, title, description }) => (
  <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0' }}>
    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
      {icon}
      <Typography gutterBottom variant="h5" component="h2" sx={{ mt: 2, fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const LandingPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Connect Event Hosts with Sponsors
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            EventHive brings event hosts and sponsors together through innovative auction-based sponsorships.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Link to='/auth'>
            <Button variant="contained" color="primary" sx={{ mx: 1 }}>
              Get Started
            </Button>
          </Link>
            <Button variant="outlined" color="primary" sx={{ mx: 1 }} onClick={handleOpen}>
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 8 }} maxWidth="md" id="features">
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Key Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<CalendarToday fontSize="large" color="primary" />}
              title="Event Listings"
              description="Easily create and manage your event listings for sponsorship opportunities."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<Gavel fontSize="large" color="primary" />}
              title="Auction Platform"
              description="Conduct transparent and competitive auctions for sponsorship slots."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<People fontSize="large" color="primary" />}
              title="Sponsor Matching"
              description="Connect with the right sponsors for your event's unique needs and audience."
            />
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'background.paper', py: 8 }} id="hosts">
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                For Event Hosts
              </Typography>
              <Typography variant="body1" paragraph>
                Maximize your event's potential by connecting with the perfect sponsors through our innovative auction system.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <TrendingUp color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">Increase sponsorship revenue</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <People color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">Access a wide network of potential sponsors</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Spa color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">Streamline the sponsorship process</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0',
                }}
              >
                <img
                  src="https://img.freepik.com/free-vector/wedding-planner-concept-illustration_114360-2720.jpg?size=626&ext=jpg&ga=GA1.1.1170291314.1694801382&semt=ais_hybrid"
                  alt="Event Management"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 8 }} id="sponsors">
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0',
                }}
              >
                <img
                  src="https://img.freepik.com/free-vector/flat-business-deal-concept_23-2148123416.jpg?ga=GA1.1.1170291314.1694801382&semt=ais_hybrid"
                  alt="Sponsors"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                For Sponsors
              </Typography>
              <Typography variant="body1" paragraph>
                Discover and secure high-value sponsorship opportunities through our transparent auction platform.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <EmojiEvents color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">Bid on premium sponsorship slots</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarToday color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">Access a diverse range of events</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">Maximize your marketing ROI</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 8 }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Transform Your Events?
          </Typography>
          <Typography variant="body1" paragraph>
            Join EventHive today and experience the future of event sponsorships.
          </Typography>
          <Link to='/auth'>
          <Button variant="contained" color="secondary" size="large" sx={{ mt: 2, color: 'primary.main', bgcolor: 'secondary.main'}}>
            Get Started Now
          </Button>
          </Link>
        </Container>
      </Box>

      {/* Add the modal component */}
      <DemoWalkthroughModal open={modalOpen} onClose={handleClose} />
    </>
  );
};

export default LandingPage;
