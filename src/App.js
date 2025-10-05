import React from 'react';
import AppointmentBooking from './AppointmentBooking';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0F5C5C',
    },
    secondary: {
      main: '#10B981',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

function App() {
  const handleBookingComplete = (appointment) => {
    console.log('Booking completed:', appointment);
    // You can add custom logic here, like showing a notification
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppointmentBooking
        apiUrl={process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}
        primaryColor="#0F5C5C"
        accentColor="#10B981"
        onBookingComplete={handleBookingComplete}
      />
    </ThemeProvider>
  );
}

export default App;
