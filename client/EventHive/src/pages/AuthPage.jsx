import React, { useState } from "react";
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Select,
  MenuItem,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import GavelIcon from "@mui/icons-material/Gavel";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

const AuthPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated, login, logout,setIsAdmin , setIsAuthenticated , isAdmin} = useAuth();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogin = async (values, { setSubmitting }) => {
    if (values.email == "admin123@gmail.com" && values.password == "adminpass") {
      setIsAdmin(true);
      // setIsAuthenticated(false);
      navigate("/admin");
    } else {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/auth/login",
          values
        );
        logout
        console.log(response);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId);
        login();
        toast.success("Login successful!");
        navigate("/");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "An error occurred during login"
        );
      }
    }

    setSubmitting(false);
  };

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        values
      );
      console.log(response.data.token);
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      login();
      toast.success("Registration successful!"); // Success toast
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred during registration"
      );
    }
    setSubmitting(false);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully!");
    navigate("/");
  };
  
  return (
    <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
      <Paper
        variant="outlined"
        sx={{
          my: { xs: 3, md: 6 },
          p: { xs: 2, md: 3 },
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <GavelIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
            Welcome to EventHive
          </Typography>
        </Box>


        <ToastContainer />

        {isAuthenticated && !isAdmin ? (
          <>
            <Typography variant="h6" sx={{ textAlign: "center", mt: 3 }}>
              Are you sure you want to log out!
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="error"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{ mb: 3 }}
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>

            {tabValue === 0 && (
              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={LoginSchema}
                onSubmit={handleLogin}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <Field
                      as={TextField}
                      name="email"
                      label="Email Address"
                      fullWidth
                      margin="normal"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                    <Field
                      as={TextField}
                      name="password"
                      label="Password"
                      type="password"
                      fullWidth
                      margin="normal"
                      error={touched.password && Boolean(errors.password)}
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
                    <Box sx={{ textAlign: "center" }}>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => navigate("/forgot-password")}
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
                initialValues={{
                  username: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  role: "",
                }}
                validationSchema={RegisterSchema}
                onSubmit={handleRegister}
              >
                {({ errors, touched, isSubmitting, setFieldValue }) => (
                  <Form>
                    <Field
                      as={TextField}
                      name="username"
                      label="Full Name"
                      fullWidth
                      margin="normal"
                      error={touched.username && Boolean(errors.username)}
                      helperText={touched.username && errors.username}
                    />
                    <Field
                      as={TextField}
                      name="email"
                      label="Email Address"
                      fullWidth
                      margin="normal"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                    <Field
                      as={TextField}
                      name="password"
                      label="Password"
                      type="password"
                      fullWidth
                      margin="normal"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                    <Field
                      as={TextField}
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      fullWidth
                      margin="normal"
                      error={
                        touched.confirmPassword &&
                        Boolean(errors.confirmPassword)
                      }
                      helperText={
                        touched.confirmPassword && errors.confirmPassword
                      }
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
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link href="/" variant="body2" color="primary">
                Back to Home
              </Link>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default AuthPage;
