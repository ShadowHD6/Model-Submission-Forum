# Model Submission Forum - Design Guidelines

## Design Approach
User-provided specifications for a professional, minimalistic model submission form with dark theme and automated PDF generation.

## Color Palette
- **Primary Accent**: #C0C0C0 (silver/light gray)
- **Background**: #0A0A0A (near black)
- **Text**: #C0C0C0
- **Button Background**: #1A1A1A (dark gray)

## Typography
- **Font Family**: Poppins (all weights via Google Fonts)
- Clean, modern sans-serif for professional appearance across all form elements

## Layout System
- **Spacing Units**: 32px between sections, 16px internal padding
- **Form Container**: Centered single column, max-width 650px
- **Layout Method**: Flexbox/Grid for centered, smooth responsive layout
- **Mobile-First**: Professional, airy, easy-to-complete forms on all devices

## Component Structure

### Header (Fixed)
- Full-width fixed positioning
- Centered SVG logo placeholder (color: #C0C0C0)
- Small subtitle below logo: "Model Submission Forum"

### Form Sections (32px spacing between)

**1. Personal Information**
- Text inputs: Full Name, Email, Phone Number
- Textarea: Physical Address
- File upload: Picture upload

**2. Body Measurements** (2-column grid)
- 8 numeric-only inputs in neat rows
- Fields: Height, Chest/Bust, Waist, Hips, Shoulders, Inseam, Sleeve Length, Neck Circumference
- All measurements in centimeters

**3. Gender Selection**
- Required radio button toggle styled as pill selectors
- Options: Male / Female

**4. Body Morphology**
- Dynamic grid of selectable cards based on gender
- Click to select with #C0C0C0 border highlight
- Male options: Slim, Fit, Athletic, Muscular, Broad, Triangle, Rectangle
- Female options: Slim, Fit, Pear, Hourglass, Rectangle, Inverted Triangle, Curvy

**5. Clothing Sizes**
- Dual dropdown system: Real Worn Size | Preferred Comfortable Size
- Size options: XS, S, M, L, XL, XXL, XXXL
- Male items: T-Shirt, Hoodie, Oversized Hoodie, Jacket, Sleeveless Jacket, Pants, Jeans
- Female items: All male items plus Skirt
- Two fields displayed side-by-side for each item

**6. Notes Section**
- Large textarea with placeholder: "Write anything you want to add…"

**7. Submit Button**
- Centered, max-width 150px
- Text: "Submit Model Form"
- #C0C0C0 text on #1A1A1A background
- Subtle shadow with hover lighten effect

### Footer (Fixed)
- Fixed positioning at bottom
- SVG logo (same as header, #C0C0C0)
- Contact information: +216 52 287 812
- Email: sfarwajdi@outlook.fr
- Instagram icon (monochrome #C0C0C0) linking to https://www.instagram.com/be_theos (opens new tab)

## Input Styling
- Rounded corners on all inputs
- Clean spacing throughout
- Professional appearance with consistent styling across all form elements

## Interaction States
- Form validation for all required fields before submission
- Visual feedback on morphology card selection (border highlight)
- Hover effects on submit button (lighten)

## Functionality Requirements
- PDF generation containing all form data and uploaded image
- Automated email delivery to sfarwajdi@outlook.fr
- WhatsApp notification to +216 52 287 812
- Implementation using EmailJS/FormSubmit or similar service

## Images
No hero images required. This is a form-focused application with SVG logo placeholders only.