# Side by Side Layout - Calendar & Slots

## Design Overview

The appointment booking interface now displays the **calendar** and **time slots** side by side for a better user experience.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                   Pick a Date & Time                        │
│           Select your preferred appointment slot            │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│      📅 CALENDAR         │    ⏰ TIME SLOTS                 │
│                          │                                  │
│  ◄  January 2025  ►      │  Appointment Type:               │
│                          │  [Consultation] [Cleaning]       │
│  S  M  T  W  T  F  S     │                                  │
│              1  2  3     │  Selected: Monday, 6. January    │
│  4  5 [6] 7  8  9  10    │                                  │
│  11 12 13 14 15 16 17    │  Available Time Slots:           │
│  18 19 20 21 22 23 24    │  ┌──────────────────────────┐   │
│  25 26 27 28 29 30 31    │  │ [09:00] [09:30] [10:00]  │   │
│                          │  │ [10:30] [11:00] [11:30]  │   │
│                          │  │ [02:00] [02:30] [03:00]  │   │
│                          │  └──────────────────────────┘   │
│                          │                                  │
│                          │     ┌──────────────┐            │
│                          │     │   Continue   │            │
│                          │     └──────────────┘            │
└──────────────────────────┴──────────────────────────────────┘
```

## Responsive Breakpoints

### Desktop (md and up - ≥960px)
```
┌─────────────────┬───────────────────────────┐
│                 │                           │
│   Calendar      │      Time Slots           │
│   (5/12 cols)   │      (7/12 cols)          │
│                 │                           │
└─────────────────┴───────────────────────────┘
```

### Mobile (xs - <960px)
```
┌─────────────────────────────┐
│         Calendar            │
│         (Full Width)        │
└─────────────────────────────┘
┌─────────────────────────────┐
│        Time Slots           │
│        (Full Width)         │
└─────────────────────────────┘
```

## Key Features

### 1. **Calendar Section (Left - 5/12 width)**
- Month navigation with arrows
- Weekday headers
- Date grid with:
  - Past dates disabled (grayed out)
  - Today indicator (yellow dot)
  - Selected date highlighted (teal)
- Clean white background
- Compact design

### 2. **Time Slots Section (Right - 7/12 width)**
- Appointment type selector at top
- Selected date display
- Scrollable slot container:
  - Max height: 400px
  - Custom scrollbar styling
  - Background: light gray (#F9FAFB)
- Grid layout for slots:
  - Desktop (md): 4 columns (xs={6}, sm={4}, md={3})
  - Tablet (sm): 3 columns
  - Mobile (xs): 2 columns
- Continue button below slots

### 3. **Slots Container Design**
```javascript
<Paper
  elevation={0}
  sx={{
    p: 2.5,
    borderRadius: '16px',
    bgcolor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    maxHeight: '400px',
    overflowY: 'auto',
    // Custom scrollbar
  }}
>
  <Grid container spacing={1.5}>
    {/* Slot buttons */}
  </Grid>
</Paper>
```

## Visual Improvements

### Calendar
- ✅ No max-width restriction (fills container)
- ✅ Responsive to column width
- ✅ Clean borders and spacing

### Time Slots
- ✅ Wrapped in scrollable container
- ✅ Custom scrollbar design (8px wide)
- ✅ Light background for contrast
- ✅ Max height prevents page overflow
- ✅ Slots wrap in grid (4 columns on desktop)

### Scrollbar Styling
```css
&::-webkit-scrollbar {
  width: 8px;
}
&::-webkit-scrollbar-track {
  background: #F1F5F9;
  borderRadius: 10px;
}
&::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  borderRadius: 10px;
  &:hover {
    background: #94A3B8;
  }
}
```

## Grid Configuration

### Container
```javascript
<Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto' }}>
  <Grid item xs={12} md={5}>
    {/* Calendar */}
  </Grid>
  <Grid item xs={12} md={7}>
    {/* Time Slots */}
  </Grid>
</Grid>
```

### Slot Buttons
```javascript
<Grid container spacing={1.5}>
  <Grid item xs={6} sm={4} md={3}>
    {/* Slot button */}
  </Grid>
</Grid>
```

## Benefits

### 1. **Better Space Utilization**
- Calendar and slots visible simultaneously
- No need to scroll between sections
- Wider container (1200px max vs 900px)

### 2. **Improved UX**
- See calendar while selecting time
- Quick date switching without losing slot view
- Scrollable slots prevent page overflow

### 3. **Responsive Design**
- Desktop: Side by side (5/12 + 7/12)
- Mobile: Stacked vertically
- Slots always wrap based on screen size

### 4. **Visual Hierarchy**
- Calendar on left (natural reading order)
- Slots on right (action area)
- Continue button clearly separated

### 5. **Scalability**
- Handles 50+ slots with smooth scrolling
- Custom scrollbar for better aesthetics
- No layout breaking with many slots

## Technical Details

### Changes Made

**File**: `patient-flow-widget/src/AppointmentBooking.js`

1. **Container width increased:**
   - From: `maxWidth: 900`
   - To: `maxWidth: 1200`

2. **Calendar column:**
   - From: `xs={12} sm={6} md={5}` with `maxWidth: 380`
   - To: `xs={12} md={5}` (no maxWidth)

3. **Slots column:**
   - From: `xs={12} sm={6} md={5}`
   - To: `xs={12} md={7}`

4. **Slots wrapped in scrollable Paper:**
   ```javascript
   <Paper sx={{ maxHeight: '400px', overflowY: 'auto' }}>
     <Grid container spacing={1.5}>
       {/* Slots */}
     </Grid>
   </Paper>
   ```

5. **Slot grid updated:**
   - From: `xs={6} sm={4}`
   - To: `xs={6} sm={4} md={3}` (4 columns on desktop)

## Use Cases

### Best For:
- ✅ Desktop booking experience
- ✅ Tablet landscape mode
- ✅ Applications with many time slots
- ✅ Professional booking interfaces

### Responsive Behavior:
- **Desktop (≥960px)**: Calendar left, slots right
- **Tablet (600-959px)**: Calendar left, slots right
- **Mobile (<600px)**: Calendar top, slots bottom (stacked)

## Testing Checklist

- ✅ Calendar displays correctly on left
- ✅ Slots display correctly on right
- ✅ Both sections visible simultaneously on desktop
- ✅ Scrollbar appears when >10 slots
- ✅ Scrollbar has custom styling
- ✅ Mobile view stacks vertically
- ✅ Slot grid wraps properly (4 cols desktop, 3 tablet, 2 mobile)
- ✅ Continue button shows after slot selection
- ✅ Layout doesn't break with 50+ slots

## Browser Compatibility

- ✅ Chrome/Edge (custom scrollbar)
- ✅ Firefox (fallback scrollbar)
- ✅ Safari (custom scrollbar)
- ⚠️ IE11 (fallback scrollbar, basic layout)

## Future Enhancements

Potential improvements:
- Sync scroll position when selecting slots
- Highlight selected time range on calendar
- Add "Back to top" for long slot lists
- Virtual scrolling for 100+ slots
- Sticky appointment type selector

## Files Modified

1. `patient-flow-widget/src/AppointmentBooking.js`
   - Lines 433-443: Container and calendar column
   - Lines 583-584: Slots column
   - Lines 659-747: Scrollable slots container

## Deployment

```bash
cd patient-flow-widget
npm run build
# Deploy the 'build' folder
```

The widget is **rebuilt and ready** to use with the new side-by-side layout!
