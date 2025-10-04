import React from 'react';
import PatientFlowWidget from './PatientFlowWidget';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0EA5E9',
    },
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
      <PatientFlowWidget
        apiUrl={process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}
        theme="light"
        primaryColor="#0EA5E9"
        compact={false}
        onBookingComplete={handleBookingComplete}
        showHeader={true}
      />
    </ThemeProvider>
  );
}

export default App;
