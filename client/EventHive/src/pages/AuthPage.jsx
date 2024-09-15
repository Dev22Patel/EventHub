import React, { useState } from 'react';
import { Container, Paper, Tabs, Tab, Box, Typography, TextField, Button, Link } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import GavelIcon from '@mui/icons-material/Gavel';
import { useNavigate } from 'react-router-dom';  // for navigation to Forgot Password page

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

const AuthPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = (values, { setSubmitting }) => {
    // Handle form submission here
    console.log(values);
    setSubmitting(false);
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <GavelIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            Welcome to EventHive
          </Typography>
        </Box>
        <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        {tabValue === 0 && (
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Field
                  as={TextField}
                  name="email"
                  label="Email Address"
                  fullWidth
                  margin="normal"
                  error={touched.email && errors.email}
                  helperText={touched.email && errors.email}
                />
                <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={touched.password && errors.password}
                  helperText={touched.password && errors.password}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting}
                >
                  Sign In
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    href="#"
                    onClick={() => navigate('/forgot-password')}
                    variant="body2"
                    color="primary"
                  >
                    Forgot Password?
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        )}
        {tabValue === 1 && (
          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Field
                  as={TextField}
                  name="name"
                  label="Full Name"
                  fullWidth
                  margin="normal"
                  error={touched.name && errors.name}
                  helperText={touched.name && errors.name}
                />
                <Field
                  as={TextField}
                  name="email"
                  label="Email Address"
                  fullWidth
                  margin="normal"
                  error={touched.email && errors.email}
                  helperText={touched.email && errors.email}
                />
                <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={touched.password && errors.password}
                  helperText={touched.password && errors.password}
                />
                <Field
                  as={TextField}
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={touched.confirmPassword && errors.confirmPassword}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting}
                >
                  Sign Up
                </Button>
              </Form>
            )}
          </Formik>
        )}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link href="/" variant="body2" color="primary">
            Back to Home
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthPage;
