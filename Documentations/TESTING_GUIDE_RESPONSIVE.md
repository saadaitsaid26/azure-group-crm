# Testing Guide - Lead Pipeline Responsive Fix

## 🧪 Manual Testing Checklist

### 1. Mobile Testing (< 640px)

#### Device/Browser DevTools Setup
- Chrome DevTools: `F12` → Toggle device toolbar (iPhone SE, iPhone 12 Pro)
- Firefox DevTools: `F12` → Responsive Design Mode (320px, 375px, 414px)
- Safari DevTools: Develop → Enter Responsive Design Mode

#### Test Cases
- [ ] **Layout**: All 6 stages stack vertically (1 column)
- [ ] **No Horizontal Scroll**: Page fits within viewport width
- [ ] **Header**: "Add New Lead" button is full-width
- [ ] **Stage Cards**: Readable headers with wrapped badges
- [ ] **Lead Cards**: Content stacks vertically within cards
- [ ] **Touch Targets**: Edit/Delete buttons are easily tappable (32×32px)
- [ ] **Text**: No overflow, long titles break properly
- [ ] **Pagination**: Pagination info and controls stack vertically
- [ ] **Drag & Drop**: Still functional on touch devices

#### How to Test
```bash
# Start the dev server
npm run dev

# Open in browser at different widths:
# - 320px (iPhone SE)
# - 375px (iPhone X/11/12/13)
# - 414px (iPhone Plus models)
```

---

### 2. Tablet Testing (640px - 1024px)

#### Device/Browser DevTools Setup
- Chrome DevTools: iPad, iPad Pro
- Firefox DevTools: 768px, 820px
- Safari DevTools: iPad Air, iPad Pro

#### Test Cases
- [ ] **Layout**: Stages display in 2 columns
- [ ] **Spacing**: Adequate gaps between columns
- [ ] **Lead Cards**: Side-by-side layout for content
- [ ] **Touch Targets**: Still easily tappable
- [ ] **Header**: Button returns to auto-width
- [ ] **Filters**: Display properly across width
- [ ] **Drag & Drop**: Smooth between columns

#### Test Widths
- 640px (breakpoint)
- 768px (iPad portrait)
- 820px (iPad Air)
- 1024px (iPad landscape)

---

### 3. Desktop Testing (1024px - 1280px)

#### Test Cases
- [ ] **Layout**: Stages display in 3 columns
- [ ] **Hover States**: Edit/Delete buttons highlight on hover
- [ ] **Drag & Drop**: Visual feedback during drag
- [ ] **Spacing**: Comfortable gaps and padding
- [ ] **Typography**: Proper font sizes
- [ ] **Header**: Full horizontal layout

#### Test Widths
- 1024px (breakpoint)
- 1200px (standard laptop)
- 1280px (large laptop)

---

### 4. Large Desktop Testing (> 1280px)

#### Test Cases
- [ ] **Layout**: All 6 stages display horizontally
- [ ] **Original Functionality**: Matches previous desktop view
- [ ] **Spacing**: No wasted space
- [ ] **All Features**: Everything works as expected

#### Test Widths
- 1366px (HD laptop)
- 1440px (standard monitor)
- 1920px (Full HD)
- 2560px (2K/QHD)

---

## 🎯 Feature Testing

### Drag & Drop
1. Create a test lead
2. Drag lead card to different stage
3. Verify:
   - [ ] Visual feedback during drag (opacity change)
   - [ ] Drop zone highlights
   - [ ] Lead updates stage successfully
   - [ ] Toast notification appears
   - [ ] No console errors

### Add Lead
1. Click "Add New Lead" button
2. Verify:
   - [ ] Button is easily clickable on all sizes
   - [ ] Dialog opens properly
   - [ ] Form is usable on mobile

### Edit/Delete
1. Click edit icon on a lead card
2. Verify:
   - [ ] Button is large enough (32×32px minimum)
   - [ ] Edit dialog opens
   - [ ] All fields are editable
3. Click delete icon
4. Verify:
   - [ ] Confirmation appears
   - [ ] Lead deletes successfully

### Search & Filters
1. Type in search box
2. Apply stage filter
3. Apply priority filter
4. Verify:
   - [ ] Filters work on all screen sizes
   - [ ] Results update correctly
   - [ ] UI remains responsive

### Pagination
1. Navigate between pages
2. Verify:
   - [ ] Buttons are easily clickable
   - [ ] Page info displays properly
   - [ ] Layout adjusts on mobile

---

## 📱 Browser Testing Matrix

| Browser | Mobile | Tablet | Desktop | Status |
|---------|--------|--------|---------|--------|
| Chrome | ☐ | ☐ | ☐ | |
| Firefox | ☐ | ☐ | ☐ | |
| Safari | ☐ | ☐ | ☐ | |
| Edge | ☐ | ☐ | ☐ | |

---

## 🔍 Visual Regression Testing

### Screenshots to Take
1. **Mobile (375px)**
   - Empty state
   - With 1 lead
   - With multiple leads
   - Filters expanded

2. **Tablet (768px)**
   - 2-column layout
   - Drag in progress
   - Hover state

3. **Desktop (1280px)**
   - 3-column layout
   - All 6 stages visible

4. **Large (1920px)**
   - 6-column layout
   - Full pipeline view

---

## 🐛 Bug Checklist

Check for these common issues:

### Layout Issues
- [ ] No horizontal scrolling on any size
- [ ] No text overflow
- [ ] No overlapping elements
- [ ] Consistent spacing

### Touch Issues
- [ ] All buttons are tappable (min 44×44px)
- [ ] No accidental clicks
- [ ] Smooth drag & drop
- [ ] Proper hover states on desktop

### Content Issues
- [ ] Text is readable at all sizes
- [ ] Icons are visible
- [ ] Colors meet contrast requirements
- [ ] No broken layouts

### Performance Issues
- [ ] Smooth scrolling
- [ ] No layout shifts
- [ ] Fast interactions
- [ ] No lag during drag

---

## ⚡ Performance Testing

### Lighthouse Audit
```bash
# Run Lighthouse in Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Select Mobile device
# 4. Run audit
# 5. Check scores for:
#    - Performance
#    - Accessibility
#    - Best Practices
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90

### Touch Delay Testing
```javascript
// Test touch-manipulation effectiveness
// Add to browser console:
const buttons = document.querySelectorAll('.touch-manipulation');
buttons.forEach(btn => {
  const start = performance.now();
  btn.addEventListener('touchend', () => {
    const delay = performance.now() - start;
    console.log(`Touch delay: ${delay}ms`); // Should be < 100ms
  });
});
```

---

## 🎨 Accessibility Testing

### Keyboard Navigation
1. Tab through all interactive elements
2. Verify:
   - [ ] Logical tab order
   - [ ] Visible focus indicators
   - [ ] All actions accessible via keyboard
   - [ ] No keyboard traps

### Screen Reader Testing
1. Test with:
   - NVDA (Windows)
   - JAWS (Windows)
   - VoiceOver (Mac/iOS)
   - TalkBack (Android)

2. Verify:
   - [ ] All content is announced
   - [ ] ARIA labels are correct
   - [ ] Landmarks are properly set
   - [ ] Dynamic updates are announced

### Color Contrast
```bash
# Use browser extensions:
# - WAVE (Chrome/Firefox)
# - axe DevTools (Chrome/Firefox)
# - Lighthouse (Chrome DevTools)
```

Check:
- [ ] Text contrast ratio ≥ 4.5:1
- [ ] Interactive elements contrast ≥ 3:1
- [ ] Focus indicators are visible

---

## 📊 Breakpoint Testing

Test these specific widths:

| Width | Expected Layout | Test |
|-------|----------------|------|
| 320px | 1 column | ☐ |
| 375px | 1 column | ☐ |
| 414px | 1 column | ☐ |
| 640px | 2 columns (breakpoint) | ☐ |
| 768px | 2 columns | ☐ |
| 1024px | 3 columns (breakpoint) | ☐ |
| 1280px | 6 columns (breakpoint) | ☐ |
| 1920px | 6 columns | ☐ |

---

## 🚀 Quick Test Commands

```bash
# Start dev server
npm run dev

# Type check
npm run typecheck

# Run any existing tests
npm test

# Build for production (test build works)
npm run build

# Preview production build
npm run preview
```

---

## ✅ Sign-Off Checklist

Before marking as complete:

### Functionality
- [ ] All features work on mobile
- [ ] All features work on tablet
- [ ] All features work on desktop
- [ ] Drag & drop functional everywhere
- [ ] No console errors

### Design
- [ ] Matches design requirements
- [ ] No horizontal scrolling
- [ ] Proper spacing at all sizes
- [ ] Typography is readable
- [ ] Colors/branding consistent

### Performance
- [ ] Page loads quickly
- [ ] Interactions are smooth
- [ ] No layout shifts
- [ ] Touch responses < 100ms

### Accessibility
- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] WCAG 2.1 AA compliant
- [ ] Touch targets ≥ 44×44px

### Cross-Browser
- [ ] Chrome ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] Edge ✓

---

## 📝 Test Results Template

```markdown
## Test Results - [Date]

### Tester: [Name]
### Browser: [Browser/Version]
### Device: [Physical device or DevTools simulation]

#### Mobile (375px)
- Layout: ✅/❌
- Touch targets: ✅/❌
- No horizontal scroll: ✅/❌
- Drag & drop: ✅/❌
- Issues found: [List any issues]

#### Tablet (768px)
- 2-column layout: ✅/❌
- Spacing: ✅/❌
- Touch targets: ✅/❌
- Issues found: [List any issues]

#### Desktop (1280px)
- 6-column layout: ✅/❌
- Hover states: ✅/❌
- All features: ✅/❌
- Issues found: [List any issues]

#### Overall
- Passed: ✅/❌
- Notes: [Any additional notes]
```

---

## 🎯 Success Criteria

The fix is successful when:

✅ **No horizontal scrolling** on any device size
✅ **Responsive layout** adapts to screen width
✅ **Touch targets** are minimum 44×44px
✅ **All features** work on mobile/tablet/desktop
✅ **Performance** is maintained or improved
✅ **Accessibility** meets WCAG 2.1 AA
✅ **No regressions** in existing functionality

---

## 📞 Support

If you find issues:
1. Document the issue (screenshot + browser/device info)
2. Check if it reproduces in multiple browsers
3. Verify it's related to the responsive changes
4. Report with steps to reproduce
