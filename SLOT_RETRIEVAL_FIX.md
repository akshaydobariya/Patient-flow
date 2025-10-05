# Slot Retrieval Fix for Patient Flow Widget

## Issue
The patient-flow-widget was unable to retrieve available slots for today's date, even when slots existed in the database.

## Root Causes Identified

### 1. **Date Handling in Frontend**
The widget was creating dates with timezone issues:
```javascript
// OLD - Problematic
const startDate = new Date(dateStr + 'T00:00:00.000Z');
const endDate = new Date(dateStr + 'T23:59:59.999Z');
```

### 2. **Backend Lead Time Filter**
The backend's `getAvailableSlots` function was applying `minLeadTime` rules incorrectly:
- It was adding lead time to the current moment for ALL queries
- This caused same-day slot queries to skip slots that were in the past few hours
- Example: If minLeadTime = 1 hour and current time is 2 PM, it would only show slots after 3 PM, even if you're querying for the entire day

## Solutions Implemented

### Frontend Changes (Both AppointmentBooking.js and PatientFlowWidget.js)

**File:** `src/AppointmentBooking.js` and `src/PatientFlowWidget.js`

```javascript
const loadSlots = async (doctorId, date, typeId) => {
  // Create proper date range for the selected date
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  const startDate = new Date(selectedDate);
  const endDate = new Date(selectedDate);
  endDate.setHours(23, 59, 59, 999);

  // Enhanced logging for debugging
  console.log('Loading slots:', {
    date,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    typeName,
    url
  });

  // Filter slots - backend already applies rules
  const filtered = data.slots?.filter(slot => slot.isAvailable) || [];
}
```

**Benefits:**
- Proper date object creation avoiding timezone issues
- Better debugging with enhanced logging
- Simplified filtering (removed redundant type filter)

### Backend Changes

**File:** `backend/src/controllers/calendarController.js`

```javascript
// For same-day bookings, use the max of query start or min booking time
// For future dates, use the query start date as-is
const isToday = queryStartDate.toDateString() === now.toDateString();
const actualStartTime = isToday
  ? new Date(Math.max(queryStartDate.getTime(), minBookingTime.getTime()))
  : queryStartDate;
const actualEndTime = new Date(Math.min(queryEndDate.getTime(), maxBookingTime.getTime()));
```

**Benefits:**
- Only applies `minLeadTime` filter for same-day bookings
- Future dates are queried without lead time restrictions
- Better logging shows "Is Today" flag for debugging

## How It Works Now

1. **Patient selects today's date:**
   - Frontend sends: `startDate = 2025-01-05T00:00:00.000Z`, `endDate = 2025-01-05T23:59:59.999Z`
   - Backend detects it's today: `isToday = true`
   - Backend applies minLeadTime: If current time is 2 PM and minLeadTime = 1 hour, shows slots from 3 PM onwards
   - Returns available slots respecting lead time

2. **Patient selects future date (e.g., tomorrow):**
   - Frontend sends: `startDate = 2025-01-06T00:00:00.000Z`, `endDate = 2025-01-06T23:59:59.999Z`
   - Backend detects it's NOT today: `isToday = false`
   - Backend uses the full day range without applying current time filter
   - Returns all available slots for that day

## Testing

To verify the fix:

1. **Check browser console logs:**
   ```
   Loading slots: { date, startDate, endDate, typeName, url }
   API Response: { slotsReceived, rules, count }
   Filtered slots: X
   Sample slots: [...]
   ```

2. **Check backend logs:**
   ```
   Booking time constraints:
     Now: 2025-01-05T14:30:00.000Z
     Min Lead Time (hours): 1
     Min booking time: 2025-01-05T15:30:00.000Z

   Actual query range after applying rules:
     Is Today: true
     Actual Start: 2025-01-05T15:30:00.000Z (adjusted for lead time)
     Actual End: 2025-01-05T23:59:59.999Z
   ```

3. **Verify slots appear:**
   - Select today's date → Should show slots after current time + lead time
   - Select tomorrow → Should show all available slots for that day
   - Select different appointment type → Should filter correctly

## Configuration

Adjust lead time in doctor's availability settings:
- `minLeadTime: 0` = Allow immediate bookings (same minute)
- `minLeadTime: 1` = Require 1 hour notice
- `minLeadTime: 24` = Require 24 hours notice

## Files Modified

1. `patient-flow-widget/src/AppointmentBooking.js` - Lines 107-164
2. `patient-flow-widget/src/PatientFlowWidget.js` - Lines 117-174
3. `backend/src/controllers/calendarController.js` - Lines 540-572

## Next Steps

If slots still don't appear:

1. **Check if slots exist:**
   ```bash
   # In backend
   node test-patient-slots.js
   ```

2. **Verify minLeadTime setting:**
   - Check doctor's availability rules in Settings
   - Temporarily set `minLeadTime: 0` for testing

3. **Check appointment type match:**
   - Ensure slot.type matches exactly with appointment type name
   - Case-sensitive comparison

4. **Rebuild patient-flow-widget:**
   ```bash
   cd patient-flow-widget
   npm run build
   ```
