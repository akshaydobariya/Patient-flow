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
  Chip,
  Fade,
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
  ArrowForward as ArrowForwardIcon,
  Event as EventIcon,
} from '@mui/icons-material';

/**
 * Modern Minimalistic Appointment Booking Component
 * Clean, trendy design with smooth animations and excellent UX
 */
const AppointmentBooking = ({
  apiUrl = 'http://localhost:5000/api',
  primaryColor = '#0D9488',
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
    notes: '',
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

      // Create date range for the selected date
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const typeName = appointmentTypes.find(t => t._id === typeId)?.name;

      let url = `${apiUrl}/calendar/slots?doctorId=${doctorId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      if (typeName) {
        url += `&appointmentType=${encodeURIComponent(typeName)}`;
      }

      console.log('Loading slots:', {
        date: date.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        typeName,
        url
      });

      const response = await fetch(url);
      const data = await response.json();

      console.log('API Response:', {
        slotsReceived: data.slots?.length || 0,
        rules: data.rules,
        count: data.count
      });

      // Filter slots - backend already applies rules
      const filtered = data.slots?.filter(slot => slot.isAvailable) || [];

      console.log('Filtered slots:', filtered.length);

      if (filtered.length > 0) {
        console.log('Sample slots:', filtered.slice(0, 3).map(s => ({
          start: s.startTime,
          end: s.endTime,
          type: s.type,
          available: s.isAvailable
        })));
      }

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
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const isToday = (date) => {
    if (!date) return false;
    return isSameDay(date, new Date());
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (offset) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setSelectedMonth(newMonth);
  };

  const renderProgressIndicator = () => (
    <Box sx={{ mb: 6 }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        {[
          { step: 1, label: 'Select Doctor', icon: PersonIcon },
          { step: 2, label: 'Choose Time', icon: CalendarIcon },
          { step: 3, label: 'Your Details', icon: DescriptionIcon },
          { step: 4, label: 'Confirmation', icon: CheckIcon },
        ].map(({ step, label, icon: Icon }, index) => (
          <React.Fragment key={step}>
            <Stack alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: currentStep >= step ? primaryColor : '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: currentStep === step ? `0 4px 12px ${primaryColor}40` : 'none',
                }}
              >
                <Icon sx={{ color: currentStep >= step ? '#FFF' : '#9CA3AF', fontSize: 24 }} />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: currentStep === step ? 600 : 400,
                  color: currentStep >= step ? '#1F2937' : '#9CA3AF',
                  fontSize: '0.75rem',
                }}
              >
                {label}
              </Typography>
            </Stack>
            {index < 3 && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  bgcolor: currentStep > step ? primaryColor : '#E5E7EB',
                  transition: 'all 0.3s ease',
                  borderRadius: 1,
                  maxWidth: 80,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Stack>
    </Box>
  );

  const renderDoctorSelection = () => (
    <Fade in timeout={500}>
      <Box>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', mb: 1.5 }}>
            Choose Your Doctor
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.125rem' }}>
            Select a healthcare professional for your appointment
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={48} sx={{ color: primaryColor }} />
          </Box>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {doctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                <Card
                  onClick={() => handleDoctorSelect(doctor)}
                  sx={{
                    cursor: 'pointer',
                    border: `2px solid ${selectedDoctor?._id === doctor._id ? primaryColor : 'transparent'}`,
                    borderRadius: '20px',
                    bgcolor: '#FFF',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: selectedDoctor?._id === doctor._id
                      ? `0 20px 40px ${primaryColor}20`
                      : '0 4px 6px rgba(0,0,0,0.05)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${primaryColor}20`,
                      borderColor: primaryColor,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: `${primaryColor}15`,
                        color: primaryColor,
                        fontSize: '2rem',
                        fontWeight: 700,
                        margin: '0 auto 16px',
                        border: `3px solid ${primaryColor}30`,
                      }}
                    >
                      {doctor.name?.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                      Dr. {doctor.name}
                    </Typography>
                    <Chip
                      label={doctor.specialty || 'General Physician'}
                      size="small"
                      sx={{
                        bgcolor: '#F1F5F9',
                        color: '#475569',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Fade>
  );

  const renderDateTimeSelection = () => (
    <Fade in timeout={500}>
      <Box>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', mb: 1.5 }}>
            Pick a Date & Time
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.125rem' }}>
            Select your preferred appointment slot
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Calendar */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2, md: 2 },
                borderRadius: '16px',
                bgcolor: '#FFF',
                border: '1px solid #E5E7EB',
                maxWidth: 400,
              }}
            >
              {/* Month Navigation Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: { xs: 2, md: 2.5 } }}>
                <IconButton
                  onClick={() => changeMonth(-1)}
                  size="small"
                  sx={{
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    bgcolor: '#F3F4F6',
                    '&:hover': {
                      bgcolor: '#E5E7EB',
                    }
                  }}
                >
                  <PrevIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </IconButton>

                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1F2937', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                  {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>

                <IconButton
                  size="small"
                  sx={{
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    bgcolor: '#0D9488',
                    color: '#FFF',
                    '&:hover': {
                      bgcolor: '#0F766E',
                    }
                  }}
                  onClick={() => changeMonth(1)}
                >
                  <NextIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </IconButton>
              </Stack>

              {/* Weekday Headers */}
              <Grid container spacing={0} sx={{ mb: { xs: 1, md: 1.5 } }}>
                {['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'].map((day) => (
                  <Grid item xs key={day}>
                    <Box sx={{ textAlign: 'center', py: { xs: 0.5, md: 0.75 } }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 500,
                          color: '#6B7280',
                          fontSize: { xs: '0.7rem', md: '0.75rem' },
                        }}
                      >
                        {day}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Calendar Days */}
              <Grid container spacing={0}>
                {getDaysInMonth(selectedMonth).map((day, index) => {
                  const isPast = day && day < new Date().setHours(0, 0, 0, 0);
                  const isSelected = day && isSameDay(day, selectedDate);
                  const isTodayDate = day && isToday(day);

                  return (
                    <Grid item xs key={index}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          py: { xs: 0.3, md: 0.4 },
                        }}
                      >
                        {day ? (
                          <Box
                            sx={{
                              position: 'relative',
                              display: 'inline-flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <Button
                              onClick={() => !isPast && handleDateSelect(day)}
                              disabled={isPast}
                              sx={{
                                minWidth: { xs: 32, sm: 34, md: 36 },
                                width: { xs: 32, sm: 34, md: 36 },
                                height: { xs: 32, sm: 34, md: 36 },
                                borderRadius: '50%',
                                p: 0,
                                bgcolor: isSelected ? '#0D9488' : 'transparent',
                                color: isSelected
                                  ? '#FFF'
                                  : isPast
                                  ? '#D1D5DB'
                                  : '#1F2937',
                                fontWeight: isSelected ? 700 : 400,
                                fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' },
                                border: 'none',
                                transition: 'all 0.2s ease',
                                '&:hover:not(:disabled)': {
                                  bgcolor: isSelected ? '#0D9488' : '#F3F4F6',
                                },
                                '&.Mui-disabled': {
                                  color: '#E5E7EB',
                                },
                              }}
                            >
                              {day.getDate()}
                            </Button>
                            {/* Today indicator - yellow dot underneath */}
                            {isTodayDate && (
                              <Box
                                sx={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: '50%',
                                  bgcolor: '#FCD34D',
                                  mt: 0.3,
                                }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Box sx={{ width: { xs: 32, sm: 34, md: 36 }, height: { xs: 32, sm: 34, md: 36 } }} />
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>

          {/* Time Slots and Appointment Type */}
          <Grid item xs={12} md={7}>
            <Stack spacing={2.5}>
              {/* Appointment Type Selection */}
              {appointmentTypes.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1F2937', mb: 1.5, fontSize: '0.875rem' }}>
                    Appointment Type
                  </Typography>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    {appointmentTypes.map((type) => (
                      <Chip
                        key={type._id}
                        label={type.name}
                        onClick={() => {
                          setSelectedType(type._id);
                          if (selectedDate && selectedDoctor) {
                            loadSlots(selectedDoctor._id, selectedDate, type._id);
                          }
                        }}
                        sx={{
                          borderRadius: '10px',
                          border: `2px solid ${selectedType === type._id ? '#0D9488' : '#E5E7EB'}`,
                          bgcolor: selectedType === type._id ? '#0D9488' : '#FFF',
                          color: selectedType === type._id ? '#FFF' : '#6B7280',
                          fontWeight: 600,
                          fontSize: '0.813rem',
                          px: 2.5,
                          py: 2,
                          height: 'auto',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#0D9488',
                            bgcolor: selectedType === type._id ? '#0D9488' : '#F9FAFB',
                            transform: 'translateY(-1px)',
                          },
                          '& .MuiChip-label': {
                            px: 0,
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Selected Date Display */}
              {selectedDate && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, fontSize: '0.85rem' }}>
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}, {selectedDate.getDate()}. {selectedDate.toLocaleDateString('en-US', { month: 'long' })}
                  </Typography>
                </Paper>
              )}

              {/* Time Slots Header */}
              {selectedDate && (
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1F2937', fontSize: '0.875rem' }}>
                  Available Time Slots
                </Typography>
              )}

              {/* Time Slot Buttons */}
              {selectedDate ? (
                loading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={32} sx={{ color: '#0D9488' }} />
                  </Box>
                ) : availableSlots.length > 0 ? (
                  <Box sx={{
                    maxWidth:650
                  }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1.2,
                        mb: 2,
                        maxHeight: 350,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        pr: 1,
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          bgcolor: '#F3F4F6',
                          borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          bgcolor: '#D1D5DB',
                          borderRadius: '10px',
                          '&:hover': {
                            bgcolor: '#9CA3AF',
                          },
                        },
                      }}
                    >
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot._id}
                          variant={selectedSlot?._id === slot._id ? 'contained' : 'outlined'}
                          onClick={() => handleSlotSelect(slot)}
                          sx={{
                            minWidth: 'auto',
                            width: 'auto',
                            px: 1.8,
                            py: 0.8,
                            borderRadius: '8px',
                            border: `2px solid ${selectedSlot?._id === slot._id ? '#0D9488' : '#E5E7EB'}`,
                            bgcolor: selectedSlot?._id === slot._id ? '#0D9488' : '#FFF',
                            color: selectedSlot?._id === slot._id ? '#FFF' : '#1F2937',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            flexShrink: 0,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#0D9488',
                              bgcolor: selectedSlot?._id === slot._id ? '#0D9488' : '#F9FAFB',
                              borderWidth: '2px',
                            },
                          }}
                        >
                          {new Date(slot.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Button>
                      ))}
                    </Box>

                    {/* Continue Button */}
                    {selectedSlot && (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleNextStep}
                        sx={{
                          mt: 1,
                          py: 1.5,
                          borderRadius: '10px',
                          bgcolor: '#0D9488',
                          color: '#FFF',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                          '&:hover': {
                            bgcolor: '#0F766E',
                            boxShadow: '0 6px 16px rgba(13, 148, 136, 0.35)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        Continue
                      </Button>
                    )}
                  </Box>
              ) : (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                  }}
                >
                  No available slots for this date
                </Alert>
              )
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CalendarIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Select a date to view times
                  </Typography>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  const renderInformationForm = () => (
    <Fade in timeout={500}>
      <Box>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', mb: 1.5 }}>
            Your Information
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.125rem' }}>
            Please provide your contact details
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: '24px',
            border: '1px solid #F1F5F9',
            bgcolor: '#FFF',
            maxWidth: 600,
            margin: '0 auto',
          }}
        >
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              InputProps={{
                startAdornment: <PersonIcon sx={{ color: '#94A3B8', mr: 1.5, fontSize: 22 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  bgcolor: '#FAFBFC',
                  '& fieldset': {
                    borderColor: '#E2E8F0',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#CBD5E1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: primaryColor,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: primaryColor,
                },
              }}
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              InputProps={{
                startAdornment: <EmailIcon sx={{ color: '#94A3B8', mr: 1.5, fontSize: 22 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  bgcolor: '#FAFBFC',
                  '& fieldset': {
                    borderColor: '#E2E8F0',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#CBD5E1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: primaryColor,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: primaryColor,
                },
              }}
            />

            <TextField
              fullWidth
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              InputProps={{
                startAdornment: <PhoneIcon sx={{ color: '#94A3B8', mr: 1.5, fontSize: 22 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  bgcolor: '#FAFBFC',
                  '& fieldset': {
                    borderColor: '#E2E8F0',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#CBD5E1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: primaryColor,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: primaryColor,
                },
              }}
            />

            <TextField
              fullWidth
              label="Reason for Visit"
              placeholder="Briefly describe your symptoms or reason for visit"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              multiline
              rows={4}
              InputProps={{
                startAdornment: (
                  <DescriptionIcon
                    sx={{
                      color: '#94A3B8',
                      mr: 1.5,
                      fontSize: 22,
                      alignSelf: 'flex-start',
                      mt: 1.5,
                    }}
                  />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  bgcolor: '#FAFBFC',
                  '& fieldset': {
                    borderColor: '#E2E8F0',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#CBD5E1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: primaryColor,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: primaryColor,
                },
              }}
            />

            <TextField
              fullWidth
              label="Additional Notes (Optional)"
              placeholder="Any other information you'd like to share"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  bgcolor: '#FAFBFC',
                  '& fieldset': {
                    borderColor: '#E2E8F0',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#CBD5E1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: primaryColor,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: primaryColor,
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleBookAppointment}
              disabled={!canProceedToNext() || loading}
              endIcon={loading ? null : <CheckIcon />}
              sx={{
                py: 2,
                borderRadius: '16px',
                bgcolor: primaryColor,
                fontWeight: 600,
                fontSize: '1.125rem',
                textTransform: 'none',
                boxShadow: `0 8px 16px ${primaryColor}30`,
                '&:hover': {
                  bgcolor: primaryColor,
                  opacity: 0.9,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 24px ${primaryColor}40`,
                },
                '&.Mui-disabled': {
                  bgcolor: '#E2E8F0',
                  color: '#94A3B8',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Appointment'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Fade>
  );

  const renderConfirmation = () => (
    <Fade in timeout={800}>
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: `${accentColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'scaleIn 0.5s ease-out',
            '@keyframes scaleIn': {
              from: { transform: 'scale(0)', opacity: 0 },
              to: { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <CheckIcon sx={{ fontSize: 72, color: accentColor }} />
        </Box>

        <Typography variant="h2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
          All Set!
        </Typography>
        <Typography variant="h6" sx={{ color: '#64748B', mb: 5, fontWeight: 400 }}>
          Your appointment has been confirmed
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: '24px',
            border: `2px solid ${accentColor}40`,
            bgcolor: `${accentColor}05`,
            maxWidth: 550,
            margin: '0 auto 40px',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>
            Booking Reference
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: '#0F172A', letterSpacing: 1 }}>
            #{confirmationData?.appointmentId?.substring(0, 8).toUpperCase()}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={3} sx={{ textAlign: 'left' }}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <PersonIcon sx={{ color: primaryColor, fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  Doctor
                </Typography>
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', pl: 4 }}>
                Dr. {confirmationData?.doctor.name}
              </Typography>
            </Box>

            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <CalendarIcon sx={{ color: primaryColor, fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  Date & Time
                </Typography>
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', pl: 4 }}>
                {new Date(confirmationData?.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: primaryColor, pl: 4, mt: 0.5 }}>
                {confirmationData?.time}
              </Typography>
            </Box>

            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <EmailIcon sx={{ color: primaryColor, fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  Contact
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: '#475569', pl: 4 }}>
                {confirmationData?.patient.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', pl: 4 }}>
                {confirmationData?.patient.email}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Stack direction="row" spacing={3} justifyContent="center">
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{
              borderRadius: '16px',
              px: 4,
              py: 1.5,
              borderColor: '#E2E8F0',
              color: '#475569',
              fontWeight: 600,
              borderWidth: 2,
              textTransform: 'none',
              '&:hover': {
                borderWidth: 2,
                borderColor: '#CBD5E1',
                bgcolor: '#F8FAFC',
              },
            }}
          >
            Book Another
          </Button>
          <Button
            variant="contained"
            sx={{
              borderRadius: '16px',
              px: 4,
              py: 1.5,
              bgcolor: primaryColor,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: `0 8px 16px ${primaryColor}30`,
              '&:hover': {
                bgcolor: primaryColor,
                opacity: 0.9,
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 24px ${primaryColor}40`,
              },
            }}
          >
            View Calendar
          </Button>
        </Stack>
      </Box>
    </Fade>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF', py: 6 }}>
      <Container maxWidth="lg">
        {/* Progress Indicator */}
        {!bookingConfirmed && renderProgressIndicator()}

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{
              mb: 4,
              borderRadius: '16px',
              border: '1px solid #FEE2E2',
              bgcolor: '#FEF2F2',
            }}
          >
            {error}
          </Alert>
        )}

        {/* Main Content */}
        <Box>
          {currentStep === 1 && renderDoctorSelection()}
          {currentStep === 2 && renderDateTimeSelection()}
          {currentStep === 3 && renderInformationForm()}
          {currentStep === 4 && renderConfirmation()}
        </Box>
      </Container>
    </Box>
  );
};

export default AppointmentBooking;
