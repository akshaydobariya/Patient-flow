# Patient Flow Widget - Quick Start Guide

## ✅ Setup Complete!

Your standalone patient flow widget app has been created and is running!

---

## 🚀 Quick Start

### 1. Access the Widget

The widget is now running at: **http://localhost:3000**

Open your browser and navigate to this URL to see the widget in action.

### 2. Backend Connection

The widget connects to your backend API at: **http://localhost:5000/api**

**Make sure your backend server is running!**

```bash
# In the doctor/backend folder
cd "c:\Users\158648\OneDrive - Arrow Electronics, Inc\Desktop\SOl\doctor\backend"
npm start
```

---

## 📁 Project Structure

```
patient-flow-widget/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── PatientFlowWidget.js  # Main widget component
│   ├── App.js                # App wrapper
│   ├── index.js              # Entry point
│   └── index.css             # Global styles
├── .env                      # Environment variables
├── package.json              # Dependencies
└── README.md                 # Full documentation
```

---

## 🎨 Widget Features

1. **Doctor Selection** - Browse and select available doctors
2. **Date & Time Picker** - Choose appointment type, date, and time slot
3. **Patient Information** - Enter contact details and reason for visit
4. **Booking Confirmation** - Instant confirmation with booking ID

---

## ⚙️ Configuration

### Change API URL

Edit `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production:
```env
REACT_APP_API_URL=https://your-production-api.com/api
```

### Customize Appearance

Edit `src/App.js`:

```jsx
<PatientFlowWidget
  apiUrl={process.env.REACT_APP_API_URL}
  theme="light"              // Change to "dark"
  primaryColor="#0EA5E9"     // Change to your brand color
  compact={false}            // Set true for compact version
  showHeader={true}          // Hide section headers
/>
```

---

## 🌐 Embedding the Widget

### Option 1: As an iframe

```html
<iframe
  src="http://localhost:3000"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

### Option 2: Copy Component

Copy `src/PatientFlowWidget.js` to any React project and use it:

```jsx
import PatientFlowWidget from './PatientFlowWidget';

function MyApp() {
  return (
    <PatientFlowWidget
      apiUrl="https://your-api.com/api"
      theme="light"
      primaryColor="#0EA5E9"
    />
  );
}
```

---

## 🛠️ Development Commands

```bash
# Start development server (already running)
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## 📦 Production Build

### Build the App

```bash
npm run build
```

This creates an optimized build in the `build/` folder.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy to Netlify

1. Build: `npm run build`
2. Upload the `build/` folder to Netlify
3. Configure environment variables in Netlify dashboard

---

## 🔧 Troubleshooting

### Widget shows "Failed to load doctors"

**Solution:**
1. Make sure backend is running on port 5000
2. Check `.env` file has correct API URL
3. Verify backend CORS settings allow localhost:3000

### CORS Error

**Solution:** Add to backend `app.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

### Port 3000 already in use

**Solution:** Kill the process or use a different port:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or set custom port
set PORT=3001 && npm start
```

---

## 📝 Next Steps

1. **Customize the theme** - Change colors and branding
2. **Test booking flow** - Try booking an appointment
3. **Deploy to production** - Build and deploy the widget
4. **Embed in your website** - Use iframe or copy component

---

## 🎯 Current Status

- ✅ React app created
- ✅ Dependencies installed
- ✅ Widget component implemented
- ✅ Development server running on http://localhost:3000
- ✅ Backend connection configured
- ✅ Ready to use!

---

## 📞 Support

For detailed documentation, see [README.md](README.md)

Enjoy your Patient Flow Widget! 🎉
