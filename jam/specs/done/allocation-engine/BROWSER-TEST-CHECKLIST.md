# Browser Testing Quick Reference Checklist
## Territory Allocation Engine

**Test Date:** ________________  
**Tester:** ________________  
**App URL:** http://localhost:5178/

---

## Pre-Test Setup

- [ ] Clear browser cache
- [ ] Open DevTools Console (F12)
- [ ] Prepare sample XLSX files (small, medium, large)
- [ ] Note browser version: ________________
- [ ] Note OS version: ________________
- [ ] Note screen resolution: ________________

---

## Chrome Testing

**Browser:** Chrome _____ | **OS:** _____ | **Date:** _____

### Core Features
- [ ] ✅ Page loads without errors
- [ ] ✅ File upload works (click to browse)
- [ ] ✅ File upload works (drag and drop)
- [ ] ✅ Sliders adjust smoothly
- [ ] ✅ Charts render correctly
- [ ] ✅ Chart tooltips appear on hover
- [ ] ✅ CSV export downloads successfully
- [ ] ✅ Navigation between pages works
- [ ] ✅ Back/forward buttons work
- [ ] ✅ No console errors

### Visual/CSS
- [ ] ✅ Colors look correct (oklch test)
- [ ] ✅ Layout is not broken
- [ ] ✅ Text is readable
- [ ] ✅ Buttons are styled correctly

### Responsive (resize window)
- [ ] ✅ Mobile view (375px) - cards stack
- [ ] ✅ Tablet view (768px) - 2 columns
- [ ] ✅ Desktop view (1440px) - 3 columns

### Performance
- [ ] ✅ Slider response < 100ms
- [ ] ✅ Page navigation < 500ms
- [ ] ✅ CSV export < 2s

**Chrome Status:** ⬜ Pass / ⬜ Fail

**Issues:**
```



```

---

## Firefox Testing

**Browser:** Firefox _____ | **OS:** _____ | **Date:** _____

### Core Features
- [ ] ✅ Page loads without errors
- [ ] ✅ File upload works (click to browse)
- [ ] ✅ File upload works (drag and drop)
- [ ] ✅ Sliders adjust smoothly
- [ ] ✅ Charts render correctly
- [ ] ✅ Chart tooltips appear on hover
- [ ] ✅ CSV export downloads successfully
- [ ] ✅ Navigation between pages works
- [ ] ✅ Back/forward buttons work
- [ ] ✅ No console errors

### Visual/CSS
- [ ] ✅ Colors look correct (oklch test)
- [ ] ✅ Layout is not broken
- [ ] ✅ Text is readable
- [ ] ✅ Buttons are styled correctly

### Responsive (resize window)
- [ ] ✅ Mobile view (375px) - cards stack
- [ ] ✅ Tablet view (768px) - 2 columns
- [ ] ✅ Desktop view (1440px) - 3 columns

### Performance
- [ ] ✅ Slider response < 100ms
- [ ] ✅ Page navigation < 500ms
- [ ] ✅ CSV export < 2s

**Firefox Status:** ⬜ Pass / ⬜ Fail

**Issues:**
```



```

---

## Safari Testing

**Browser:** Safari _____ | **OS:** _____ | **Date:** _____

### Core Features
- [ ] ✅ Page loads without errors
- [ ] ✅ File upload works (click to browse)
- [ ] ✅ File upload works (drag and drop)
- [ ] ✅ Sliders adjust smoothly
- [ ] ✅ Charts render correctly
- [ ] ✅ Chart tooltips appear on hover
- [ ] ✅ CSV export downloads successfully
- [ ] ✅ Navigation between pages works
- [ ] ✅ Back/forward buttons work
- [ ] ✅ Swipe gestures work (if on trackpad/mobile)
- [ ] ✅ No console errors

### Visual/CSS (CRITICAL FOR SAFARI)
- [ ] ⚠️  **Colors look correct (oklch test - CHECK CAREFULLY)**
- [ ] ✅ Layout is not broken
- [ ] ✅ Text is readable
- [ ] ✅ Buttons are styled correctly

### Responsive (resize window)
- [ ] ✅ Mobile view (375px) - cards stack
- [ ] ✅ Tablet view (768px) - 2 columns
- [ ] ✅ Desktop view (1440px) - 3 columns

### Performance
- [ ] ✅ Slider response < 100ms
- [ ] ✅ Page navigation < 500ms
- [ ] ✅ CSV export < 2s

### iOS Safari (if testing on device)
- [ ] ✅ Touch targets are easy to tap (44px min)
- [ ] ✅ Sliders work with touch
- [ ] ✅ Smooth scrolling works
- [ ] ✅ No horizontal scroll

**Safari Status:** ⬜ Pass / ⬜ Fail

**Issues:**
```



```

---

## Edge Testing

**Browser:** Edge _____ | **OS:** _____ | **Date:** _____

### Core Features
- [ ] ✅ Page loads without errors
- [ ] ✅ File upload works (click to browse)
- [ ] ✅ File upload works (drag and drop from Explorer)
- [ ] ✅ Sliders adjust smoothly
- [ ] ✅ Charts render correctly
- [ ] ✅ Chart tooltips appear on hover
- [ ] ✅ CSV export downloads successfully
- [ ] ✅ Navigation between pages works
- [ ] ✅ Back/forward buttons work
- [ ] ✅ No console errors

### Visual/CSS
- [ ] ✅ Colors look correct (oklch test)
- [ ] ✅ Layout is not broken
- [ ] ✅ Text is readable
- [ ] ✅ Buttons are styled correctly

### Responsive (resize window)
- [ ] ✅ Mobile view (375px) - cards stack
- [ ] ✅ Tablet view (768px) - 2 columns
- [ ] ✅ Desktop view (1440px) - 3 columns

### Performance
- [ ] ✅ Slider response < 100ms
- [ ] ✅ Page navigation < 500ms
- [ ] ✅ CSV export < 2s

**Edge Status:** ⬜ Pass / ⬜ Fail

**Issues:**
```



```

---

## Detailed Test Scenarios

### Scenario 1: File Upload - Click
1. Open application
2. Click "Upload" button or drop zone
3. Select sample XLSX file
4. Verify green checkmark appears
5. Verify data loads in UI

**Result:** ⬜ Pass / ⬜ Fail per browser

---

### Scenario 2: File Upload - Drag & Drop
1. Open file explorer/Finder
2. Drag XLSX file to browser window
3. Hover over drop zone (should highlight)
4. Release mouse to drop file
5. Verify file is accepted

**Result:** ⬜ Pass / ⬜ Fail per browser

---

### Scenario 3: Slider Interaction
1. Upload sample data
2. Find "Threshold" slider
3. Click and drag slider left/right
4. Verify value updates in real-time
5. Use arrow keys to adjust (keyboard test)
6. Verify calculations update

**Result:** ⬜ Pass / ⬜ Fail per browser

---

### Scenario 4: Chart Visualization
1. Ensure data is loaded
2. Locate "Threshold Sensitivity Chart"
3. Verify chart displays (line chart)
4. Hover over chart elements
5. Verify tooltip appears with data
6. Locate "Rep Distribution Charts"
7. Verify bar charts display

**Result:** ⬜ Pass / ⬜ Fail per browser

---

### Scenario 5: CSV Export
1. Complete allocation
2. Click "Export CSV" button
3. Verify download starts
4. Locate downloaded file
5. Open in Excel/Numbers/LibreOffice
6. Verify data is correct
7. Check for special characters

**Result:** ⬜ Pass / ⬜ Fail per browser

---

### Scenario 6: Page Navigation
1. Start on "Analyze" page
2. Click "Compare" tab
3. Verify navigation to Compare page
4. Click "Audit" tab
5. Verify navigation to Audit page
6. Click browser back button
7. Verify returns to Compare
8. Click browser forward button
9. Verify returns to Audit

**Result:** ⬜ Pass / ⬜ Fail per browser

---

### Scenario 7: Responsive Design

**Mobile (375px):**
1. Resize browser to 375px wide
2. Verify sidebar collapses or is full-width
3. Verify cards stack vertically (1 column)
4. Verify tables scroll horizontally
5. Verify no content is cut off

**Tablet (768px):**
1. Resize browser to 768px wide
2. Verify 2-column grid layout
3. Verify sidebar is fixed width (320px)

**Desktop (1440px):**
1. Resize browser to 1440px wide
2. Verify 3-column grid layout
3. Verify optimal spacing

**Result:** ⬜ Pass / ⬜ Fail per browser

---

### Scenario 8: Error Handling

**Test 1: Invalid File Type**
1. Try to upload .txt or .pdf file
2. Verify error message displays
3. Verify UI doesn't crash

**Test 2: Empty File**
1. Upload XLSX with no data
2. Verify appropriate error
3. Verify user can recover

**Test 3: Invalid Data**
1. Upload XLSX with missing required columns
2. Verify validation error displays
3. Verify error message is helpful

**Result:** ⬜ Pass / ⬜ Fail per browser

---

## Critical Issues Found

### Blocking Issues (Must Fix)
```
[List any issues that prevent app from functioning]



```

### High Priority Issues (Should Fix)
```
[List issues that significantly impact UX]



```

### Medium Priority Issues (Nice to Fix)
```
[List minor issues or inconsistencies]



```

### Low Priority Issues (Cosmetic)
```
[List visual inconsistencies that don't affect functionality]



```

---

## Performance Notes

| Metric | Chrome | Firefox | Safari | Edge | Target |
|--------|--------|---------|--------|------|--------|
| Page load time | ___s | ___s | ___s | ___s | < 2s |
| Slider response | ___ms | ___ms | ___ms | ___ms | < 100ms |
| CSV export | ___s | ___s | ___s | ___s | < 2s |
| Memory (10 min) | ___MB | ___MB | ___MB | ___MB | < 150MB |

---

## Color Rendering Check (oklch)

**CRITICAL:** Verify colors match across browsers

Compare these color areas:
- [ ] Background color (should be white/near-white)
- [ ] Primary button color (should be dark gray)
- [ ] Destructive/error color (should be red/orange)
- [ ] Chart colors (5 distinct colors)
- [ ] Hover states on buttons
- [ ] Border colors

**Do colors look consistent across all browsers?**
⬜ Yes - All consistent  
⬜ No - Safari differs (describe below)  
⬜ No - Other browser differs (describe below)

**Details:**
```



```

---

## Console Errors Summary

### Chrome Console
```
[Paste any errors here]



```

### Firefox Console
```
[Paste any errors here]



```

### Safari Console
```
[Paste any errors here]



```

### Edge Console
```
[Paste any errors here]



```

---

## Overall Assessment

**Overall Compatibility Rating:**

⬜ **Excellent** - No issues found, works perfectly in all browsers  
⬜ **Good** - Minor issues only, fully functional  
⬜ **Fair** - Some issues impact UX, workarounds needed  
⬜ **Poor** - Major issues, not ready for production

---

## Recommendations

### Immediate Actions Required
```
[List actions that must be taken before production]



```

### Nice to Have Improvements
```
[List optional improvements]



```

---

## Sign-Off

**Tested By:** ______________________  
**Date:** ______________________  
**Signature:** ______________________

**Ready for Production:** ⬜ Yes / ⬜ No (pending fixes)

---

## Notes

```
[Additional observations, comments, or context]





```

---

**END OF CHECKLIST**
