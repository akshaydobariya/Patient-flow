import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Stack,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Check as CheckMarkIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

/**
 * Modern Appointment Booking Component - Techline Style
 * Based on Figma design with sidebar navigation and step-by-step process
 */
const AppointmentBooking = ({
  apiUrl = 'http://localhost:5000/api',
  primaryColor = '#0F5C5C',
  accentColor = '#10B981',
  onBookingComplete,
  defaultDoctorId = null,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    department: '',
    reason: '',
    notes: '',
    interests: [],
    contactPreference: 'email',
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (defaultDoctorId && doctors.length > 0) {
      const doctor = doctors.find(d => d._id === defaultDoctorId);
      if (doctor) {
        handleDoctorSelect(doctor);
      }
    }
  }, [defaultDoctorId, doctors]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/availability/doctors`);
      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async (doctorId) => {
    try {
      const response = await fetch(`${apiUrl}/availability/${doctorId}`);
      const data = await response.json();
      setAppointmentTypes(data.availability?.appointmentTypes || []);
      if (data.availability?.appointmentTypes?.length > 0) {
        setSelectedType(data.availability.appointmentTypes[0]._id);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const loadSlots = async (doctorId, date, typeId) => {
    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];
      const startDate = new Date(dateStr + 'T00:00:00.000Z');
      const endDate = new Date(dateStr + 'T23:59:59.999Z');

      const response = await fetch(
        `${apiUrl}/calendar/slots?doctorId=${doctorId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();

      const typeName = appointmentTypes.find(t => t._id === typeId)?.name;
      const filtered = data.slots?.filter(
        slot => slot.isAvailable && slot.type === typeName
      ) || [];

      setAvailableSlots(filtered);
    } catch (error) {
      console.error('Error loading slots:', error);
      setError('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor);
    await loadAvailability(doctor._id);
    setCurrentStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (selectedDoctor && selectedType) {
      loadSlots(selectedDoctor._id, date, selectedType);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${apiUrl}/calendar/book-slot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: selectedSlot._id,
          patientName: formData.name,
          patientEmail: formData.email,
          patientPhone: formData.phone,
          reasonForVisit: formData.reason,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const data = await response.json();

      setConfirmationData({
        appointmentId: data.appointment._id,
        doctor: selectedDoctor,
        date: selectedSlot.startTime,
        time: `${new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: selectedSlot.type,
        patient: formData,
      });

      setBookingConfirmed(true);
      setCurrentStep(4);

      if (onBookingComplete) {
        onBookingComplete(data.appointment);
      }
    } catch (error) {
      setError(error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 2 && selectedDate && selectedSlot) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleBookAppointment();
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 2:
        return selectedDate && selectedSlot;
      case 3:
        return formData.name && formData.email && formData.phone && formData.reason;
      default:
        return false;
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (offset) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setSelectedMonth(newMonth);
  };

  const renderSidebar = () => (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        bgcolor: '#FAFBFC',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
      }}
    >
      {/* Doctor Info */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: primaryColor,
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {selectedDoctor?.name?.charAt(0) || 'T'}
          </Avatar>
          <Box>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
              {selectedDoctor ? 'Founder & Head of IT' : 'Techline'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
              {selectedDoctor ? selectedDoctor.name : 'Select Doctor'}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Step Indicators */}
      <Stack spacing={2}>
        {/* Step 1 - Tag/Appointment Type */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: currentStep >= 1 ? primaryColor : '#E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {currentStep > 1 ? (
              <CheckMarkIcon sx={{ color: '#FFF', fontSize: 18 }} />
            ) : (
              <CalendarIcon sx={{ color: currentStep === 1 ? '#FFF' : '#9CA3AF', fontSize: 18 }} />
            )}
          </Box>
          <Box flex={1}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: currentStep >= 1 ? '#1F2937' : '#9CA3AF' }}>
              Schritt 1
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Wählen Sie Ihren Wunschtermin aus.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ borderLeft: '2px dashed #E5E7EB', ml: 2, pl: 4, py: 1 }} />

        {/* Step 2 - Date & Time */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: currentStep >= 2 ? primaryColor : '#E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {currentStep > 2 ? (
              <CheckMarkIcon sx={{ color: '#FFF', fontSize: 18 }} />
            ) : (
              <TimeIcon sx={{ color: currentStep === 2 ? '#FFF' : '#9CA3AF', fontSize: 18 }} />
            )}
          </Box>
          <Box flex={1}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: currentStep >= 2 ? '#1F2937' : '#9CA3AF' }}>
              Uhrzeit
            </Typography>
            {selectedDate && currentStep >= 2 && (
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                {selectedDate.toLocaleDateString('de-DE')}
                {selectedSlot && ` - ${new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </Typography>
            )}
          </Box>
        </Stack>

        <Box sx={{ borderLeft: '2px dashed #E5E7EB', ml: 2, pl: 4, py: 1 }} />

        {/* Step 3 - Information */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: currentStep >= 3 ? primaryColor : '#E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {currentStep > 3 ? (
              <CheckMarkIcon sx={{ color: '#FFF', fontSize: 18 }} />
            ) : (
              <PersonIcon sx={{ color: currentStep === 3 ? '#FFF' : '#9CA3AF', fontSize: 18 }} />
            )}
          </Box>
          <Box flex={1}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: currentStep >= 3 ? '#1F2937' : '#9CA3AF' }}>
              Information eingeben
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Date Display */}
      {selectedDate && currentStep >= 2 && (
        <Box sx={{ mt: 4, p: 2, bgcolor: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
            {selectedDate.toLocaleDateString('de-DE', { weekday: 'long' })}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: primaryColor }}>
            {selectedDate.getDate()}. {selectedDate.toLocaleDateString('de-DE', { month: 'long' })}
          </Typography>
        </Box>
      )}
    </Paper>
  );

  const renderDoctorSelection = () => (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
        Datum & Uhrzeit wählen
      </Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
        Wählen Sie einen Berater aus
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={40} sx={{ color: primaryColor }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {doctors.map((doctor) => (
            <Grid item xs={12} sm={6} md={4} key={doctor._id}>
              <Card
                onClick={() => handleDoctorSelect(doctor)}
                sx={{
                  cursor: 'pointer',
                  border: `2px solid ${selectedDoctor?._id === doctor._id ? primaryColor : '#E5E7EB'}`,
                  borderRadius: '16px',
                  bgcolor: selectedDoctor?._id === doctor._id ? `${primaryColor}08` : '#FFF',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: primaryColor,
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(15,92,92,0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        bgcolor: primaryColor,
                        fontSize: '2rem',
                        fontWeight: 700,
                      }}
                    >
                      {doctor.name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
                        {doctor.specialty || 'IT Consultant'}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                        {doctor.name}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderDateTimeSelection = () => (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
        Datum & Uhrzeit wählen
      </Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
        Wählen Sie Ihr bevorzugtes Datum und Ihre bevorzugte Uhrzeit
      </Typography>

      <Grid container spacing={4}>
        {/* Calendar */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            {/* Month Navigation */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <IconButton onClick={() => changeMonth(-1)} size="small">
                <PrevIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
                {formatMonthYear(selectedMonth)}
              </Typography>
              <IconButton onClick={() => changeMonth(1)} size="small" sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: primaryColor } }}>
                <NextIcon sx={{ color: '#FFF' }} />
              </IconButton>
            </Stack>

            {/* Weekday Headers */}
            <Grid container spacing={1} sx={{ mb: 1 }}>
              {['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'].map((day) => (
                <Grid item xs key={day} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280' }}>
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar Days */}
            <Grid container spacing={1}>
              {getDaysInMonth(selectedMonth).map((day, index) => (
                <Grid item xs key={index} sx={{ textAlign: 'center' }}>
                  {day ? (
                    <Button
                      onClick={() => handleDateSelect(day)}
                      disabled={day < new Date().setHours(0, 0, 0, 0)}
                      sx={{
                        minWidth: 0,
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '50%',
                        p: 1,
                        bgcolor: isSameDay(day, selectedDate) ? primaryColor : 'transparent',
                        color: isSameDay(day, selectedDate) ? '#FFF' : day < new Date().setHours(0, 0, 0, 0) ? '#D1D5DB' : '#1F2937',
                        fontWeight: isSameDay(day, selectedDate) ? 700 : 400,
                        fontSize: '0.875rem',
                        '&:hover': {
                          bgcolor: isSameDay(day, selectedDate) ? primaryColor : '#F3F4F6',
                        },
                        '&.Mui-disabled': {
                          color: '#D1D5DB',
                        },
                      }}
                    >
                      {day.getDate()}
                    </Button>
                  ) : (
                    <Box sx={{ width: '100%', aspectRatio: '1' }} />
                  )}
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Time Slots */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #E5E7EB', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}>
              {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Typography>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={32} sx={{ color: primaryColor }} />
              </Box>
            ) : availableSlots.length > 0 ? (
              <Stack spacing={1.5} sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                {availableSlots.map((slot) => (
                  <Button
                    key={slot._id}
                    fullWidth
                    variant={selectedSlot?._id === slot._id ? 'contained' : 'outlined'}
                    onClick={() => handleSlotSelect(slot)}
                    sx={{
                      justifyContent: 'flex-start',
                      py: 1.5,
                      px: 2.5,
                      borderRadius: '12px',
                      borderWidth: 2,
                      borderColor: selectedSlot?._id === slot._id ? primaryColor : '#E5E7EB',
                      bgcolor: selectedSlot?._id === slot._id ? primaryColor : '#FFF',
                      color: selectedSlot?._id === slot._id ? '#FFF' : '#1F2937',
                      fontWeight: 600,
                      fontSize: '1rem',
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: primaryColor,
                        bgcolor: selectedSlot?._id === slot._id ? primaryColor : '#FAFBFC',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ScheduleIcon sx={{ fontSize: 20 }} />
                      <Typography>
                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Stack>
                  </Button>
                ))}
              </Stack>
            ) : (
              <Alert severity="info" sx={{ borderRadius: '12px' }}>
                Keine Termine verfügbar für dieses Datum
              </Alert>
            )}

            {selectedSlot && (
              <Button
                fullWidth
                variant="contained"
                onClick={handleNextStep}
                disabled={!canProceedToNext()}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  bgcolor: primaryColor,
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': {
                    bgcolor: primaryColor,
                    opacity: 0.9,
                  },
                }}
              >
                Weiter
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderInformationForm = () => (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
        Geben Sie Details ein
      </Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
        Bitte füllen Sie Ihre Informationen aus
      </Typography>

      <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #E5E7EB' }}>
        <Stack spacing={3}>
          {/* Name */}
          <TextField
            fullWidth
            label="Name*"
            placeholder="Ihr vollständiger Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#FAFBFC',
              },
            }}
          />

          {/* Email & Phone */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="E-Mail Adresse*"
                type="email"
                placeholder="ihre.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#FAFBFC',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefonnummer*"
                placeholder="+49 123 456789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#FAFBFC',
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Company & Position */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unternehmen"
                placeholder="Ihr Unternehmen"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#FAFBFC',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                placeholder="Ihre Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#FAFBFC',
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Reason for Visit */}
          <TextField
            fullWidth
            label="Grund Ihres Besuchs*"
            placeholder="Beschreiben Sie kurz Ihr Anliegen"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
            multiline
            rows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#FAFBFC',
              },
            }}
          />

          {/* Interests Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}>
              Welche Lösung interessiert Sie am meisten? *
            </Typography>
            <Grid container spacing={2}>
              {[
                'MANAGED CLOUD',
                'PRIVATE INFRASTRUCTURE',
                'MANAGED KUBERNETES',
                'COLOCATION / DATA CENTER',
                'MANAGED DATABASES',
                'MANAGED BACKUP',
                'INFRASTRUCTURE CONSULTING',
                'EMAIL & SHAREPOINT HOSTING',
                'PRIVATE CONNECTIVITY',
              ].map((interest) => (
                <Grid item xs={12} sm={6} key={interest}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.interests.includes(interest)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, interests: [...formData.interests, interest] });
                          } else {
                            setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
                          }
                        }}
                        sx={{
                          color: '#D1D5DB',
                          '&.Mui-checked': {
                            color: primaryColor,
                          },
                        }}
                      />
                    }
                    label={<Typography variant="body2">{interest}</Typography>}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Additional Notes */}
          <TextField
            fullWidth
            label="Anmerkung"
            placeholder="Weitere Informationen (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#FAFBFC',
              },
            }}
          />

          {/* Submit Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleBookAppointment}
            disabled={!canProceedToNext() || loading}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              bgcolor: primaryColor,
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                bgcolor: primaryColor,
                opacity: 0.9,
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Termin Buchen'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );

  const renderConfirmation = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 12px 32px rgba(16,185,129,0.3)',
        }}
      >
        <CheckIcon sx={{ fontSize: 56, color: '#FFF' }} />
      </Box>

      <Typography variant="h3" sx={{ fontWeight: 700, color: '#1F2937', mb: 2 }}>
        Termin bestätigt!
      </Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
        Ihre Buchung wurde erfolgreich abgeschlossen
      </Typography>

      <Paper
        sx={{
          p: 4,
          borderRadius: '16px',
          border: `2px solid ${accentColor}`,
          bgcolor: '#ECFDF5',
          maxWidth: 500,
          margin: '0 auto',
        }}
      >
        <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
          Buchungs-ID
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1F2937' }}>
          #{confirmationData?.appointmentId?.substring(0, 8).toUpperCase()}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={3} sx={{ textAlign: 'left' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
              Berater
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
              {confirmationData?.doctor.name}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
              Datum & Uhrzeit
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
              {new Date(confirmationData?.date).toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: primaryColor, mt: 0.5 }}>
              {confirmationData?.time}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
              Kontakt
            </Typography>
            <Typography variant="body2" sx={{ color: '#1F2937' }}>
              {confirmationData?.patient.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {confirmationData?.patient.email}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            borderColor: primaryColor,
            color: primaryColor,
            fontWeight: 600,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              borderColor: primaryColor,
            },
          }}
        >
          Neuer Termin
        </Button>
        <Button
          variant="contained"
          sx={{
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            bgcolor: primaryColor,
            fontWeight: 600,
            '&:hover': {
              bgcolor: primaryColor,
              opacity: 0.9,
            },
          }}
        >
          Zum Kalender
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', py: 4 }}>
      <Container maxWidth="xl">
        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Sidebar */}
          {currentStep > 1 && (
            <Grid item xs={12} md={3}>
              {renderSidebar()}
            </Grid>
          )}

          {/* Main Content */}
          <Grid item xs={12} md={currentStep > 1 ? 9 : 12}>
            <Paper
              sx={{
                p: 4,
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                bgcolor: '#FFF',
                minHeight: 600,
              }}
            >
              {currentStep === 1 && renderDoctorSelection()}
              {currentStep === 2 && renderDateTimeSelection()}
              {currentStep === 3 && renderInformationForm()}
              {currentStep === 4 && renderConfirmation()}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AppointmentBooking;