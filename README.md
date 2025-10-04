# Patient Flow Widget

A standalone React application for embedding the patient appointment booking widget.

## Features

- **Select Doctor**: Browse and select from available doctors
- **Choose Date & Time**: Pick appointment type, date, and available time slots
- **Patient Information**: Enter patient contact details
- **Booking Confirmation**: Receive instant booking confirmation

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production, update to your deployed backend URL:

```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

### 3. Start Development Server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Backend Requirements

This widget requires the backend API to be running. Make sure your backend has the following endpoints:

- `GET /api/availability/doctors` - Get list of doctors
- `GET /api/availability/:doctorId` - Get doctor availability and appointment types
- `GET /api/calendar/slots` - Get available slots for a doctor
- `POST /api/calendar/book-slot` - Book an appointment

## Widget Configuration

The `PatientFlowWidget` component accepts the following props:

```jsx
<PatientFlowWidget
  apiUrl="http://localhost:5000/api"  // Backend API URL (required)
  theme="light"                        // 'light' | 'dark'
  primaryColor="#0EA5E9"               // Custom primary color
  compact={false}                      // Compact version
  onBookingComplete={(appointment) => {}} // Callback on booking
  showHeader={true}                    // Show section headers
  defaultDoctorId={null}               // Pre-select a doctor
/>
```

## Embedding in Other Applications

### As an iframe

```html
<iframe
  src="http://localhost:3000"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

### As a React Component

Copy `src/PatientFlowWidget.js` to your project and use it:

```jsx
import PatientFlowWidget from './PatientFlowWidget';

function App() {
  return (
    <PatientFlowWidget
      apiUrl="https://your-api.com/api"
      theme="light"
      primaryColor="#0EA5E9"
    />
  );
}
```

### As an npm Package

You can also build and publish this as an npm package for easy reuse.

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `build/` folder to Netlify

## Customization

### Theme

Change the theme in `src/App.js`:

```jsx
<PatientFlowWidget
  theme="dark"  // or "light"
  primaryColor="#10B981"  // Custom color
/>
```

### Compact Mode

Enable compact mode for smaller spaces:

```jsx
<PatientFlowWidget
  compact={true}
/>
```

## Troubleshooting

### CORS Errors

Make sure your backend has CORS enabled for the widget domain:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-widget-domain.com'],
  credentials: true
}));
```

### API Connection Issues

1. Check that `REACT_APP_API_URL` in `.env` is correct
2. Ensure backend is running
3. Check browser console for errors
4. Verify API endpoints are accessible

## Support

For issues or questions, please contact the development team.
