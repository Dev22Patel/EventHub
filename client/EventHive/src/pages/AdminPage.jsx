import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";

const AdminPage = () => {
  const { login, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const { setIsAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    login();

    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://eventhub-2dqv.onrender.com/api/users");
        setUsers(response.data);
        console.log(response.data);
      } catch (error) {
        toast.error("Error fetching users");
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await axios.get("https://eventhub-2dqv.onrender.com/api/events/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        console.log(response.data);
        setEvents(response.data);
      } catch (error) {
        toast.error("Error fetching events");
      }
    };

    fetchUsers();
    fetchEvents();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`https://eventhub-2dqv.onrender.com/api/users/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Error deleting user");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await axios.delete(`https://eventhub-2dqv.onrender.com/api/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.status === 204) {
        setEvents(events.filter((event) => event._id !== eventId));
        toast.success("Event deleted successfully");
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.response?.data?.message || "Error deleting event");
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   setIsAdmin(false);
  //   logout();
  //   navigate("/auth");
  // };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ textAlign: "center", mb: 3 }}>
          Welcome Admin
        </Typography>

        {/* <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{ mb: 2 }}
        >
          Logout
        </Button> */}

        <ToastContainer />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Events" />
          <Tab label="Users" />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Name</TableCell>
                  <TableCell>Event Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.description}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Users
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((event) => (
                    <TableRow key={event._id} >
                      <TableCell>{event.username}</TableCell>
                      <TableCell>{event.email}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteUser(event._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminPage;
