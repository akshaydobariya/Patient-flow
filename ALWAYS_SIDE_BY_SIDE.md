# Always Side by Side Layout - Calendar & Slots

## Overview

The calendar and time slots are now **ALWAYS displayed side by side** on all screen sizes, from mobile to desktop.

## Layout Structure

### All Screen Sizes (Mobile, Tablet, Desktop)
```
┌─────────────────┬───────────────────────────┐
│                 │                           │
│   📅 Calendar   │   ⏰ Time Slots          │
│   (5/12 = 42%)  │   (7/12 = 58%)           │
│                 │                           │
│                 │   - Appointment types    │
│                 │   - Scrollable slots     │
│                 │   - Continue button      │
│                 │                           │
└─────────────────┴───────────────────────────┘
```

## Grid Configuration

### Calendar (Left Side - 42% width)
```javascript
<Grid item xs={5} sm={5} md={5}>
  {/* Always 5 out of 12 columns */}
</Grid>
```

### Time Slots (Right Side - 58% width)
```javascript
<Grid item xs={7} sm={7} md={7}>
  {/* Always 7 out of 12 columns */}
</Grid>
```

## Responsive Adjustments

### Mobile (xs - <600px)
**Calendar:**
- Padding: `1.5` (12px)
- Month header font: `0.85rem`
- Navigation buttons: `28x28px`
- Compact spacing

**Time Slots:**
- Padding: `1.5` (12px)
- Max height: `350px`
- Slot grid: 2 columns (`xs={6}`)
- Smaller spacing: `1`

### Tablet/Desktop (sm+ - ≥600px)
**Calendar:**
- Padding: `2.5` (20px)
- Month header font: `1rem`
- Navigation buttons: `32x32px`
- Standard spacing

**Time Slots:**
- Padding: `2.5` (20px)
- Max height: `400px`
- Slot grid:
  - Tablet (sm): 2 columns (`xs={6}`)
  - Desktop (md): 3 columns (`md={4}`)
- Standard spacing: `1.5`

## Key Features

### 1. **Consistent Side-by-Side Layout**
- ✅ Mobile: Calendar (42%) + Slots (58%)
- ✅ Tablet: Calendar (42%) + Slots (58%)
- ✅ Desktop: Calendar (42%) + Slots (58%)
- ✅ Never stacks vertically

### 2. **Responsive Spacing**
```javascript
// Container spacing
<Grid container spacing={2}>

// Calendar padding
sx={{ p: { xs: 1.5, sm: 2.5 } }}

// Slots padding
sx={{ p: { xs: 1.5, sm: 2.5 } }}

// Slot grid spacing
spacing={{ xs: 1, sm: 1.5 }}
```

### 3. **Adaptive Slot Grid**
- **Mobile (xs)**: 2 columns per row
- **Tablet (sm)**: 2 columns per row
- **Desktop (md+)**: 3 columns per row

### 4. **Scrollable Slots Container**
- Mobile max height: `350px`
- Desktop max height: `400px`
- Custom scrollbar (8px wide)
- Smooth scrolling

### 5. **Compact Mobile Design**
- Smaller buttons (28x28px vs 32x32px)
- Reduced font sizes (0.85rem vs 1rem)
- Tighter spacing (1 vs 1.5)
- Less padding (1.5 vs 2.5)

## Visual Comparison

### Mobile View (375px width)
```
┌───────────┬─────────────────┐
│  📅       │  ⏰             │
│           │                 │
│ [<] Jan [>│  [Type 1]      │
│           │                 │
│ S M T W   │  Mon, 6. Jan   │
│   1 2 3 4 │                 │
│ 5 [6] 7 8 │ ┌─────────────┐│
│ 9 10 11   │ │[09:00][09:30││
│           │ │[10:00][10:30││
│           │ │[11:00][11:30││
│           │ └─────────────┘│
│           │                 │
│           │  [Continue]     │
└───────────┴─────────────────┘
```

### Desktop View (1200px width)
```
┌──────────────────┬─────────────────────────────────┐
│      📅          │         ⏰                      │
│                  │                                 │
│  ◄  January 2025 │  [Consultation] [Cleaning]     │
│                  │                                 │
│  S  M  T  W  T   │  Monday, 6. January            │
│        1  2  3   │                                 │
│  4  5 [6] 7  8   │ ┌──────────────────────────┐   │
│  9 10 11 12 13   │ │[09:00][09:30][10:00]     │   │
│ 14 15 16 17 18   │ │[10:30][11:00][11:30]     │   │
│                  │ │[02:00][02:30][03:00]     │   │
│                  │ └──────────────────────────┘   │
│                  │                                 │
│                  │        [Continue]               │
└──────────────────┴─────────────────────────────────┘
```

## Technical Implementation

### Container Configuration
```javascript
<Grid
  container
  spacing={2}  // Reduced from 3 for tighter layout
  sx={{ maxWidth: 1200, mx: 'auto' }}
>
  <Grid item xs={5} sm={5} md={5}>
    {/* Calendar - Always 5/12 */}
  </Grid>
  <Grid item xs={7} sm={7} md={7}>
    {/* Slots - Always 7/12 */}
  </Grid>
</Grid>
```

### Calendar Responsive Padding
```javascript
<Paper sx={{ p: { xs: 1.5, sm: 2.5 } }}>
  {/* xs: 12px padding */}
  {/* sm+: 20px padding */}
</Paper>
```

### Month Header Responsive
```javascript
<Typography
  sx={{
    fontWeight: 600,
    fontSize: { xs: '0.85rem', sm: '1rem' }
  }}
>
  {/* Smaller text on mobile */}
</Typography>
```

### Navigation Buttons Responsive
```javascript
<IconButton
  sx={{
    width: { xs: 28, sm: 32 },
    height: { xs: 28, sm: 32 }
  }}
>
  <Icon sx={{ fontSize: { xs: 16, sm: 18 } }} />
</IconButton>
```

### Slot Grid Configuration
```javascript
<Grid container spacing={{ xs: 1, sm: 1.5 }}>
  <Grid item xs={6} sm={6} md={4}>
    {/* Mobile: 2 cols, Desktop: 3 cols */}
  </Grid>
</Grid>
```

## Benefits

### 1. **Consistent UX**
- Same layout on all devices
- No layout shift between screen sizes
- Predictable user experience

### 2. **Better Mobile Usability**
- Calendar visible while selecting slots
- No need to scroll back to calendar
- Compact but readable

### 3. **Space Efficiency**
- Utilizes full width on all screens
- 42/58 split optimizes for both sections
- Scrollable slots prevent overflow

### 4. **Visual Hierarchy**
- Calendar is primary action (left)
- Slots are secondary (right)
- Natural left-to-right flow

## Files Modified

**File:** `patient-flow-widget/src/AppointmentBooking.js`

**Changes:**
1. Grid columns: `xs={12}` → `xs={5}` (calendar), `xs={12}` → `xs={7}` (slots)
2. Spacing: `spacing={3}` → `spacing={2}`
3. Responsive padding: `p: 2.5` → `p: { xs: 1.5, sm: 2.5 }`
4. Month header: Added `fontSize: { xs: '0.85rem', sm: '1rem' }`
5. Buttons: Added responsive sizing `{ xs: 28, sm: 32 }`
6. Slot grid: `xs={6}, sm={4}, md={3}` → `xs={6}, sm={6}, md={4}`
7. Max height: `400px` → `{ xs: '350px', sm: '400px' }`

## Testing

### Viewport Sizes to Test
- ✅ Mobile: 375px width
- ✅ Mobile Large: 414px width
- ✅ Tablet: 768px width
- ✅ Desktop: 1024px width
- ✅ Desktop Large: 1440px width

### Checklist
- ✅ Calendar always on left (5/12 width)
- ✅ Slots always on right (7/12 width)
- ✅ Never stacks vertically
- ✅ Calendar is readable on mobile
- ✅ Slots are clickable on mobile
- ✅ Scrollbar appears when needed
- ✅ Responsive padding/spacing works
- ✅ No horizontal overflow

## Known Limitations

### Very Small Screens (<350px)
- Calendar may be tight
- Consider min-width or horizontal scroll

### Slot Text
- On very small screens, time text may wrap
- Font size is maintained for readability

## Future Enhancements

Possible improvements:
- Horizontal swipe for month navigation on mobile
- Collapsible calendar for more slot space
- Portrait/landscape mode switching
- Font size optimization for smallest screens

## Deployment

```bash
cd patient-flow-widget
npm run build
# Widget is built and ready!
```

The widget now maintains the **side-by-side layout on ALL screen sizes**! 🎉
