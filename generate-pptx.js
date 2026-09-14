const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.defineLayout({ name: 'SIH', width: 13.33, height: 7.5 });
pptx.layout = 'SIH';

const NAVY = '1A5276';
const RED = 'C0392B';
const GREEN = '27AE60';
const ORANGE = 'F97316';
const PURPLE = '7C3AED';
const BLUE = '2563EB';
const GRAY = '6C757D';
const DARK = '2C3E50';
const LIGHT_BG = 'F8F9FA';

function addHeader(slide, title) {
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 0.6, fill: { color: 'ECF0F1' } });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0.6, w: 13.33, h: 0.02, fill: { color: 'E9ECEF' } });
  slide.addShape(pptx.shapes.OVAL, { x: 0.3, y: 0.08, w: 0.44, h: 0.44, fill: { color: 'FFFFFF' }, line: { color: RED, width: 1.5 } });
  slide.addText('Coffee\nInto\nCode', { x: 0.3, y: 0.08, w: 0.44, h: 0.44, fontSize: 6, fontFace: 'Arial', color: RED, bold: true, align: 'center', valign: 'middle' });
  slide.addText(title, { x: 1, y: 0.05, w: 11.33, h: 0.55, fontSize: 22, fontFace: 'Arial', color: NAVY, bold: true, align: 'center', valign: 'middle' });
  slide.addShape(pptx.shapes.OVAL, { x: 12.5, y: 0.08, w: 0.44, h: 0.44, fill: { color: 'FFFFFF' }, line: { color: RED, width: 1.5 } });
  slide.addText('SIH', { x: 12.5, y: 0.08, w: 0.44, h: 0.44, fontSize: 7, fontFace: 'Arial', color: RED, bold: true, align: 'center', valign: 'middle' });
  slide.addText('2025', { x: 12.5, y: 0.48, w: 0.44, h: 0.15, fontSize: 5, fontFace: 'Arial', color: GRAY, align: 'center' });
}

function addFooter(slide, num) {
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 7.38, w: 13.33, h: 0.07, fill: { color: NAVY } });
  slide.addText(String(num), { x: 12.5, y: 7.15, w: 0.5, h: 0.25, fontSize: 10, fontFace: 'Arial', color: RED, bold: true, align: 'right' });
}

function card(slide, x, y, w, h, opts) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: opts.fill || 'FFFFFF' }, line: { color: opts.border || 'E9ECEF', width: opts.borderWidth || 1 } });
  if (opts.text) {
    slide.addText(opts.text, { x, y, w, h, fontSize: opts.fontSize || 12, fontFace: 'Arial', color: opts.color || DARK, bold: opts.bold || false, align: 'center', valign: 'middle', lineSpacingMultiple: opts.lineSpacing || 1.2 });
  }
}

function statBox(slide, x, y, w, h, num, label, numColor, bgColor, borderColor) {
  card(slide, x, y, w, h, { fill: bgColor, border: borderColor, borderWidth: 1.5 });
  slide.addText(num, { x, y: y + 0.08, w, h: 0.5, fontSize: 26, fontFace: 'Arial', color: numColor, bold: true, align: 'center', valign: 'middle' });
  slide.addText(label, { x, y: y + 0.55, w, h: 0.35, fontSize: 9, fontFace: 'Arial', color: GRAY, align: 'center', valign: 'top' });
}

// Helper: checkmark shape
function addCheck(slide, x, y, color) {
  slide.addShape(pptx.shapes.OVAL, { x, y, w: 0.22, h: 0.22, fill: { color: color } });
  slide.addText('V', { x, y, w: 0.22, h: 0.22, fontSize: 8, fontFace: 'Arial', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });
}

// Helper: arrow shape
function addArrow(slide, x, y, color) {
  slide.addText('>>', { x, y, w: 0.25, h: 0.5, fontSize: 10, fontFace: 'Arial', color: color, bold: true, align: 'center', valign: 'middle' });
}


// ==================== SLIDE 1: TITLE ====================
let s1 = pptx.addSlide();
s1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: 'FFFFFF' } });
s1.addText('SMART INDIA HACKATHON 2025', { x: 0.5, y: 0.3, w: 5, h: 0.5, fontSize: 24, fontFace: 'Arial', color: NAVY, bold: true });
s1.addText('SMART INDIA\nHACKATHON\n2025', { x: 11.5, y: 0.15, w: 1.5, h: 0.7, fontSize: 8, fontFace: 'Arial', color: GRAY, align: 'right', lineSpacingMultiple: 1.1 });
s1.addText('TITLE PAGE', { x: 0.5, y: 1.5, w: 3, h: 0.3, fontSize: 14, fontFace: 'Arial', color: GRAY, charSpacing: 3 });
s1.addText('BusSahayak', { x: 0.5, y: 1.9, w: 6, h: 1, fontSize: 52, fontFace: 'Arial', color: NAVY, bold: true });
s1.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 2.95, w: 0.8, h: 0.05, fill: { color: RED } });
s1.addText('Bus Sahayak - Aawaz se bus book karein', { x: 0.5, y: 3.2, w: 6, h: 0.4, fontSize: 18, fontFace: 'Arial', color: GRAY, italic: true });

const fields = [
  ['Problem Statement ID -', '25039'],
  ['Problem Statement Title -', 'Accessible Public Transport Booking for Visually Impaired'],
  ['Theme -', 'Smart Vehicles / Accessible Transportation'],
  ['PS Category -', 'Software'],
  ['Team ID -', '12024'],
  ['Team Name -', 'Coffee Into Code'],
];
fields.forEach((f, i) => {
  s1.addText(f[0], { x: 0.5, y: 3.8 + i * 0.35, w: 2.8, h: 0.3, fontSize: 12, fontFace: 'Arial', color: RED, bold: true });
  s1.addText(f[1], { x: 3.5, y: 3.8 + i * 0.35, w: 3.7, h: 0.3, fontSize: 12, fontFace: 'Arial', color: DARK });
});

// Big SIH logo on right
s1.addShape(pptx.shapes.OVAL, { x: 9, y: 1.5, w: 3.5, h: 3.5, fill: { color: 'FFFFFF' }, line: { color: 'BDC3C7', width: 2 } });
s1.addText('SIH', { x: 9, y: 2.5, w: 3.5, h: 1, fontSize: 48, fontFace: 'Arial', color: '95A5A6', bold: true, align: 'center', valign: 'middle' });

// Footer team card
s1.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 6.5, w: 5, h: 0.7, rectRadius: 0.08, fill: { color: LIGHT_BG }, line: { color: 'E9ECEF', width: 1 } });
s1.addShape(pptx.shapes.OVAL, { x: 0.7, y: 6.6, w: 0.5, h: 0.5, fill: { color: 'FFFFFF' }, line: { color: RED, width: 1.5 } });
s1.addText('Coffee\nInto\nCode', { x: 0.7, y: 6.6, w: 0.5, h: 0.5, fontSize: 5, fontFace: 'Arial', color: RED, bold: true, align: 'center', valign: 'middle' });
s1.addText('Team Coffee Into Code', { x: 1.35, y: 6.5, w: 3, h: 0.35, fontSize: 12, fontFace: 'Arial', color: DARK, bold: true });
s1.addText('Nitin Doyal (Leader) | BCA G1 Semester 1 | +91 63504 24121', { x: 1.35, y: 6.85, w: 4, h: 0.3, fontSize: 8, fontFace: 'Arial', color: GRAY });
s1.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 10, y: 6.5, w: 2.8, h: 0.5, rectRadius: 0.06, fill: { color: NAVY } });
s1.addText('Software | Accessible Transportation', { x: 10, y: 6.5, w: 2.8, h: 0.5, fontSize: 10, fontFace: 'Arial', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });


// ==================== SLIDE 2: PROPOSED SOLUTION ====================
let s2 = pptx.addSlide();
s2.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: 'FFFFFF' } });
addHeader(s2, 'PROPOSED SOLUTION');
addFooter(s2, 2);

s2.addText('Proposed Solution - Describe your Idea/Solution/Prototype', { x: 0.5, y: 0.75, w: 12, h: 0.45, fontSize: 20, fontFace: 'Arial', color: NAVY, bold: true });

// 3 Modes
s2.addText('3 Operating Modes', { x: 0.5, y: 1.3, w: 6, h: 0.35, fontSize: 14, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });

const modes = [
  { title: 'Mode 1: Voice Only', sub: 'For Completely Blind Users', detail: 'Touch LOCKED, Hands-free AI\n24kHz Audio + Haptics', fill: 'FFF5F5', border: 'FECACA', circle: RED, label: 'MIC' },
  { title: 'Mode 2: Dynamic Switch', sub: 'For Low Vision Users', detail: 'Starts Locked -> Unlocks via Voice\nLarge Visual Picture Buttons', fill: 'FFF7ED', border: 'FED7AA', circle: ORANGE, label: 'SW' },
  { title: 'Mode 3: Dual Combined', sub: 'Voice + Touch Together', detail: 'Tap = TTS, Hold = Mic\nAlways Active Visuals', fill: 'F5F3FF', border: 'DDD6FE', circle: PURPLE, label: 'DUAL' },
];
modes.forEach((m, i) => {
  const x = 0.5 + i * 2.15;
  card(s2, x, 1.7, 2, 2.1, { fill: m.fill, border: m.border, borderWidth: 1.5 });
  s2.addShape(pptx.shapes.OVAL, { x: x + 0.75, y: 1.85, w: 0.5, h: 0.5, fill: { color: m.circle } });
  s2.addText(m.label, { x: x + 0.75, y: 1.85, w: 0.5, h: 0.5, fontSize: 8, fontFace: 'Arial', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });
  s2.addText(m.title, { x: x + 0.05, y: 2.45, w: 1.9, h: 0.3, fontSize: 11, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
  s2.addText(m.sub, { x: x + 0.05, y: 2.75, w: 1.9, h: 0.25, fontSize: 9, fontFace: 'Arial', color: GRAY, align: 'center' });
  s2.addText(m.detail, { x: x + 0.05, y: 3.05, w: 1.9, h: 0.6, fontSize: 8, fontFace: 'Arial', color: GRAY, align: 'center', lineSpacingMultiple: 1.3 });
});

// Stats row
statBox(s2, 0.5, 3.95, 2, 0.95, '12M+', 'Visually Impaired in India', RED, LIGHT_BG, 'E9ECEF');
statBox(s2, 2.7, 3.95, 2, 0.95, '280M+', 'Low-Literacy Adults', RED, LIGHT_BG, 'E9ECEF');
statBox(s2, 4.9, 3.95, 2, 0.95, '92%', 'Independent Completion', GREEN, LIGHT_BG, 'E9ECEF');

// Innovation box
card(s2, 0.5, 5.05, 6.2, 0.9, { fill: 'EFF6FF', border: 'BFDBFE' });
s2.addText('Key Innovation', { x: 0.65, y: 5.1, w: 6, h: 0.25, fontSize: 11, fontFace: 'Arial', color: NAVY, bold: true });
s2.addText('Conversational AI Engine: Extracts cities, dates, preferences from natural Hindi/English speech\nSmart Seat Algorithm + 60-Minute Tele-Confirmation with Driver\nF5-TTS Voice Cloning for natural Hinglish prompts | ZuelPay API: 2000+ bus operators', { x: 0.65, y: 5.35, w: 5.9, h: 0.55, fontSize: 8, fontFace: 'Arial', color: DARK, lineSpacingMultiple: 1.4 });

// Voice Demo
card(s2, 7, 1.3, 6, 2.6, { fill: LIGHT_BG, border: 'E9ECEF' });
s2.addText('Voice Demo - Jodhpur to Jaisalmer', { x: 7.15, y: 1.35, w: 5.7, h: 0.35, fontSize: 12, fontFace: 'Arial', color: NAVY, bold: true });
const demo = [
  { who: 'You:', text: '"I want to go Jodhpur to Jaisalmer today"', color: GRAY },
  { who: 'App:', text: '"Buses found! What time do you prefer?"', color: RED },
  { who: 'You:', text: '"8 AM, AC bus"', color: GRAY },
  { who: 'App:', text: '"3 AC buses. Option 1: Royal Travels Rs.450. Book?"', color: RED },
  { who: 'You:', text: '"Yes, book option 1"', color: GRAY },
  { who: 'App:', text: '"Seat W3 locked for 60 min. Driver will call."', color: RED },
];
demo.forEach((d, i) => {
  s2.addText(d.who, { x: 7.15, y: 1.75 + i * 0.33, w: 0.5, h: 0.28, fontSize: 9, fontFace: 'Arial', color: d.color, bold: true });
  s2.addText(d.text, { x: 7.65, y: 1.75 + i * 0.33, w: 5.2, h: 0.28, fontSize: 9, fontFace: 'Arial', color: DARK });
});

// Tele-Confirmation flow
s2.addText('60-Minute Tele-Confirmation Flow', { x: 7, y: 4.1, w: 6, h: 0.3, fontSize: 12, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
const flow = [
  { label: 'Blind User', sub: 'Voice Books Seat', fill: 'FFF5F5', border: RED },
  { label: '58:40', sub: 'Seat Locked', fill: 'FEF3C7', border: 'F59E0B' },
  { label: 'Driver App', sub: 'One-Tap Call', fill: 'EFF6FF', border: BLUE },
  { label: 'Confirmed', sub: 'Ticket Issued', fill: 'F0FDF4', border: GREEN },
];
flow.forEach((f, i) => {
  const x = 7.1 + i * 1.45;
  card(s2, x, 4.45, 1.3, 0.85, { fill: f.fill, border: f.border, borderWidth: 1.5 });
  s2.addText(f.label, { x, y: 4.5, w: 1.3, h: 0.4, fontSize: 11, fontFace: 'Arial', color: f.border, bold: true, align: 'center' });
  s2.addText(f.sub, { x, y: 4.9, w: 1.3, h: 0.3, fontSize: 8, fontFace: 'Arial', color: GRAY, align: 'center' });
  if (i < 3) s2.addText('>>', { x: x + 1.3, y: 4.6, w: 0.2, h: 0.5, fontSize: 12, fontFace: 'Arial', color: f.border, bold: true, align: 'center', valign: 'middle' });
});
s2.addText('Timeout -> Seat Released Automatically', { x: 8.5, y: 5.4, w: 3, h: 0.25, fontSize: 8, fontFace: 'Arial', color: 'DC2626', align: 'center' });


// ==================== SLIDE 3: TECHNICAL ====================
let s3 = pptx.addSlide();
s3.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: 'FFFFFF' } });
addHeader(s3, 'TECHNICAL APPROACH');
addFooter(s3, 3);

s3.addText('Technical Approach', { x: 0.5, y: 0.75, w: 12, h: 0.4, fontSize: 20, fontFace: 'Arial', color: NAVY, bold: true });

// Tech Stack
s3.addText('Technology Stack', { x: 0.5, y: 1.25, w: 12, h: 0.3, fontSize: 14, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
const stack = [
  { name: 'React Native', sub: 'Expo SDK 52 | Web + Mobile', fill: 'EFF6FF', border: 'BFDBFE' },
  { name: 'Conversational AI', sub: 'NLU Engine + Voice I/O', fill: 'F5F3FF', border: 'DDD6FE' },
  { name: 'Python Backend', sub: 'FastAPI + ZuelPay API', fill: 'F0FDF4', border: 'BBF7D0' },
  { name: 'AWS / Azure / GCP', sub: 'Cloud Database + Hosting', fill: 'FEF3C7', border: 'FDE68A' },
  { name: 'Google Gemini', sub: 'Voice AI | Real-time', fill: 'FFF5F5', border: 'FECACA' },
  { name: 'Cloud Deploy', sub: 'Live Prototype', fill: LIGHT_BG, border: 'E9ECEF' },
];
stack.forEach((s, i) => {
  const x = 0.5 + i * 2.1;
  card(s3, x, 1.6, 1.95, 0.8, { fill: s.fill, border: s.border, borderWidth: 1 });
  s3.addText(s.name, { x, y: 1.65, w: 1.95, h: 0.4, fontSize: 10, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
  s3.addText(s.sub, { x, y: 2.05, w: 1.95, h: 0.3, fontSize: 7, fontFace: 'Arial', color: GRAY, align: 'center' });
});

// System Flow
s3.addText('System Flow', { x: 0.5, y: 2.6, w: 12, h: 0.3, fontSize: 14, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
const sysFlow = [
  { num: '1', label: 'User Speaks', sub: '"Delhi to Jaipur"', fill: 'FFF5F5', border: RED },
  { num: '2', label: 'AI Extracts', sub: 'City, Date, Time, Type', fill: 'F5F3FF', border: PURPLE },
  { num: '3', label: 'Buses Found', sub: 'ZuelPay API | Read Options', fill: 'EFF6FF', border: BLUE },
  { num: '4', label: 'Seat Locked', sub: '60-min TTL', fill: 'F0FDF4', border: GREEN },
  { num: '5', label: 'Driver Calls', sub: 'Tele-Confirmation', fill: 'FFF7ED', border: ORANGE },
  { num: '6', label: 'Ticket Issued', sub: 'PDF + SMS', fill: 'F0FDF4', border: GREEN },
];
sysFlow.forEach((f, i) => {
  const x = 0.5 + i * 2.1;
  card(s3, x, 2.95, 1.95, 0.95, { fill: f.fill, border: f.border, borderWidth: 1.5 });
  s3.addShape(pptx.shapes.OVAL, { x: x + 0.72, y: 3.0, w: 0.4, h: 0.4, fill: { color: f.border } });
  s3.addText(f.num, { x: x + 0.72, y: 3.0, w: 0.4, h: 0.4, fontSize: 12, fontFace: 'Arial', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });
  s3.addText(f.label, { x, y: 3.45, w: 1.95, h: 0.22, fontSize: 10, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
  s3.addText(f.sub, { x, y: 3.68, w: 1.95, h: 0.18, fontSize: 7, fontFace: 'Arial', color: GRAY, align: 'center' });
  if (i < 5) s3.addText('>>', { x: x + 1.95, y: 3.1, w: 0.2, h: 0.7, fontSize: 10, fontFace: 'Arial', color: f.border, bold: true, align: 'center', valign: 'middle' });
});

// Bottom: Speed + Gestures + AI
s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.2, w: 4, h: 1.4, rectRadius: 0.08, fill: { color: LIGHT_BG }, line: { color: 'E9ECEF', width: 1 } });
s3.addText('Booking Speed Comparison', { x: 0.6, y: 4.25, w: 3.8, h: 0.3, fontSize: 11, fontFace: 'Arial', color: NAVY, bold: true });
card(s3, 0.65, 4.6, 1.8, 0.85, { fill: 'FEF2F2', border: 'FECACA' });
s3.addText('6.5 min', { x: 0.65, y: 4.65, w: 1.8, h: 0.45, fontSize: 20, fontFace: 'Arial', color: RED, bold: true, align: 'center' });
s3.addText('Screen Reader', { x: 0.65, y: 5.1, w: 1.8, h: 0.25, fontSize: 8, fontFace: 'Arial', color: GRAY, align: 'center' });
card(s3, 2.55, 4.6, 1.8, 0.85, { fill: 'F0FDF4', border: 'BBF7D0' });
s3.addText('1.2 min', { x: 2.55, y: 4.65, w: 1.8, h: 0.45, fontSize: 20, fontFace: 'Arial', color: GREEN, bold: true, align: 'center' });
s3.addText('BusSahayak', { x: 2.55, y: 5.1, w: 1.8, h: 0.25, fontSize: 8, fontFace: 'Arial', color: GRAY, align: 'center' });

s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 4.7, y: 4.2, w: 4, h: 1.4, rectRadius: 0.08, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 } });
s3.addText('Gesture System', { x: 4.8, y: 4.25, w: 3.8, h: 0.3, fontSize: 11, fontFace: 'Arial', color: NAVY, bold: true });
const gestures = [
  { label: 'Hold Screen', sub: 'Voice Input', fill: 'FFF5F5', border: 'FECACA', color: RED },
  { label: 'Double Tap', sub: 'Select Option', fill: 'FFF7ED', border: 'FED7AA', color: ORANGE },
  { label: 'Triple Tap', sub: 'Go Home', fill: 'F5F3FF', border: 'DDD6FE', color: PURPLE },
];
gestures.forEach((g, i) => {
  card(s3, 4.85 + i * 1.25, 4.6, 1.15, 0.85, { fill: g.fill, border: g.border });
  s3.addText(g.label, { x: 4.85 + i * 1.25, y: 4.7, w: 1.15, h: 0.35, fontSize: 9, fontFace: 'Arial', color: g.color, bold: true, align: 'center' });
  s3.addText(g.sub, { x: 4.85 + i * 1.25, y: 5.1, w: 1.15, h: 0.25, fontSize: 7, fontFace: 'Arial', color: GRAY, align: 'center' });
});

s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 8.9, y: 4.2, w: 4, h: 1.4, rectRadius: 0.08, fill: { color: 'F5F3FF' }, line: { color: 'DDD6FE', width: 1 } });
s3.addText('Conversational AI Engine', { x: 9, y: 4.25, w: 3.8, h: 0.3, fontSize: 11, fontFace: 'Arial', color: NAVY, bold: true });
s3.addText('40+ Indian cities recognized\nHindi + English mixed input\nDate/time extraction | Bus type preferences\nGuided: Search > Select > Seat > Confirm', { x: 9.1, y: 4.6, w: 3.7, h: 0.9, fontSize: 8, fontFace: 'Arial', color: DARK, lineSpacingMultiple: 1.5 });


// ==================== SLIDE 4: FEASIBILITY ====================
let s4 = pptx.addSlide();
s4.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: 'FFFFFF' } });
addHeader(s4, 'FEASIBILITY AND VIABILITY');
addFooter(s4, 4);

s4.addText('Feasibility and Viability', { x: 0.5, y: 0.75, w: 12, h: 0.4, fontSize: 20, fontFace: 'Arial', color: NAVY, bold: true });

// Left column
s4.addText('Feasibility Analysis', { x: 0.5, y: 1.3, w: 6, h: 0.3, fontSize: 13, fontFace: 'Arial', color: NAVY, bold: true });
const feasibility = [
  'High Technical Feasibility',
  'Zero Payment Friction (Tele-Confirm)',
  'Real APIs Ready (ZuelPay 2000+ Operators)',
  'Revenue: Rs.10-30 Per Booking Commission',
  'F5-TTS Voice Clone Already Working (Colab)',
];
feasibility.forEach((f, i) => {
  card(s4, 0.5, 1.7 + i * 0.42, 6, 0.36, { fill: 'F0FDF4', border: 'BBF7D0', borderWidth: 1 });
  addCheck(s4, 0.6, 1.77 + i * 0.42, GREEN);
  s4.addText(f, { x: 0.9, y: 1.7 + i * 0.42, w: 5.5, h: 0.36, fontSize: 10, fontFace: 'Arial', color: DARK, valign: 'middle' });
});

// Impact metrics
s4.addText('Impact Metrics', { x: 0.5, y: 3.9, w: 6, h: 0.3, fontSize: 13, fontFace: 'Arial', color: NAVY, bold: true });
card(s4, 0.5, 4.25, 2.9, 1.2, { fill: 'FFF5F5', border: RED, borderWidth: 1.5 });
s4.addText('Face Difficulty', { x: 0.5, y: 4.35, w: 2.9, h: 0.3, fontSize: 10, fontFace: 'Arial', color: GRAY, align: 'center' });
s4.addText('83%', { x: 0.5, y: 4.6, w: 2.9, h: 0.7, fontSize: 36, fontFace: 'Arial', color: RED, bold: true, align: 'center', valign: 'middle' });
card(s4, 3.6, 4.25, 2.9, 1.2, { fill: 'FEF3C7', border: 'F59E0B', borderWidth: 1.5 });
s4.addText('Need Help', { x: 3.6, y: 4.35, w: 2.9, h: 0.3, fontSize: 10, fontFace: 'Arial', color: GRAY, align: 'center' });
s4.addText('85%', { x: 3.6, y: 4.6, w: 2.9, h: 0.7, fontSize: 36, fontFace: 'Arial', color: 'D97706', bold: true, align: 'center', valign: 'middle' });

// Right column - Challenges table
s4.addText('Challenges & Strategies', { x: 7, y: 1.3, w: 6, h: 0.3, fontSize: 13, fontFace: 'Arial', color: NAVY, bold: true });
const challenges = [
  ['Voice Accuracy in Noisy Areas', 'Noise-cancel + Confirmations'],
  ['Driver Adoption for Tele-Confirm', 'Incentive Program + Easy App'],
  ['Offline Connectivity', 'Local TTS + Cache + Retry'],
  ['Seat Lock Expiry Race', 'Cloud DB TTL + SMS Alerts'],
  ['Hindi + Regional Languages', 'F5-TTS Multi-Voice + gTTS'],
];
s4.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7, y: 1.65, w: 6, h: 2.2, rectRadius: 0.06, fill: { color: LIGHT_BG }, line: { color: 'E9ECEF', width: 1 } });
s4.addShape(pptx.shapes.RECTANGLE, { x: 7, y: 1.65, w: 2.8, h: 0.35, fill: { color: NAVY } });
s4.addText('Challenge', { x: 7.1, y: 1.65, w: 2.6, h: 0.35, fontSize: 10, fontFace: 'Arial', color: 'FFFFFF', bold: true });
s4.addShape(pptx.shapes.RECTANGLE, { x: 9.8, y: 1.65, w: 3.2, h: 0.35, fill: { color: NAVY } });
s4.addText('Strategy', { x: 9.9, y: 1.65, w: 3, h: 0.35, fontSize: 10, fontFace: 'Arial', color: 'FFFFFF', bold: true });
challenges.forEach((c, i) => {
  const y = 2.05 + i * 0.34;
  const bg = i % 2 === 0 ? 'F8F9FA' : 'FFFFFF';
  s4.addShape(pptx.shapes.RECTANGLE, { x: 7, y, w: 6, h: 0.34, fill: { color: bg } });
  s4.addText(c[0], { x: 7.1, y, w: 2.6, h: 0.34, fontSize: 8, fontFace: 'Arial', color: DARK, valign: 'middle' });
  s4.addText(c[1], { x: 9.9, y, w: 3, h: 0.34, fontSize: 8, fontFace: 'Arial', color: GREEN, valign: 'middle' });
});

// Revenue Model
s4.addText('Revenue Model', { x: 7, y: 4.1, w: 6, h: 0.3, fontSize: 13, fontFace: 'Arial', color: NAVY, bold: true });
card(s4, 7, 4.45, 6, 1.5, { fill: 'EFF6FF', border: 'BFDBFE', borderWidth: 1 });
s4.addText('Commission: Rs.10-30/Ticket\n2000+ Bus Operators via ZuelPay\nScalable Across India\nGovernment CSR Funding Eligible\nADIP Scheme Subsidy Potential', { x: 7.15, y: 4.5, w: 5.7, h: 1.4, fontSize: 10, fontFace: 'Arial', color: DARK, lineSpacingMultiple: 1.6, valign: 'middle' });


// ==================== SLIDE 5: IMPACT ====================
let s5 = pptx.addSlide();
s5.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: 'FFFFFF' } });
addHeader(s5, 'IMPACT AND BENEFITS');
addFooter(s5, 5);

s5.addText('Impact and Benefits', { x: 0.5, y: 0.75, w: 12, h: 0.4, fontSize: 20, fontFace: 'Arial', color: NAVY, bold: true });

// Target Audience
s5.addText('Target Audience Impact', { x: 0.5, y: 1.3, w: 12, h: 0.3, fontSize: 14, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
const audience = [
  { num: '12-15M', sub: 'Visually Impaired\nFirst Time Book Buses\nIndependently', fill: 'FFF5F5', border: RED, numColor: RED },
  { num: '280M+', sub: 'Low-Literacy Adults\nVoice Replaces\nText Interfaces', fill: 'FFF7ED', border: ORANGE, numColor: ORANGE },
  { num: '92%', sub: 'Independent Task\nCompletion\nWithout Sighted Help', fill: 'F0FDF4', border: GREEN, numColor: GREEN },
];
audience.forEach((a, i) => {
  const x = 0.5 + i * 4.2;
  card(s5, x, 1.65, 3.9, 1.5, { fill: a.fill, border: a.border, borderWidth: 1.5 });
  s5.addText(a.num, { x, y: 1.7, w: 3.9, h: 0.65, fontSize: 32, fontFace: 'Arial', color: a.numColor, bold: true, align: 'center', valign: 'middle' });
  s5.addText(a.sub, { x, y: 2.4, w: 3.9, h: 0.65, fontSize: 9, fontFace: 'Arial', color: GRAY, align: 'center', lineSpacingMultiple: 1.3 });
});

// Broader Benefits
s5.addText('Broader Benefits', { x: 0.5, y: 3.35, w: 12, h: 0.3, fontSize: 14, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
const benefits = [
  { title: 'Social Inclusion', sub: 'Digital access for underserved', fill: LIGHT_BG, border: 'E9ECEF' },
  { title: 'Economic Value', sub: 'Zero seat loss for operators', fill: LIGHT_BG, border: 'E9ECEF' },
  { title: 'Environmental', sub: 'Public transport over private', fill: LIGHT_BG, border: 'E9ECEF' },
];
benefits.forEach((b, i) => {
  const x = 0.5 + i * 4.2;
  card(s5, x, 3.7, 3.9, 1, { fill: b.fill, border: b.border });
  s5.addText(b.title, { x, y: 3.8, w: 3.9, h: 0.4, fontSize: 12, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
  s5.addText(b.sub, { x, y: 4.2, w: 3.9, h: 0.3, fontSize: 9, fontFace: 'Arial', color: GRAY, align: 'center' });
});

// Inspirational + Government
s5.addText('Inspirational Stories', { x: 0.5, y: 4.95, w: 6, h: 0.3, fontSize: 13, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
const stories = [
  { name: 'Kanchanmala Pande', sub: 'First Indian blind swimmer\nto win World Gold Medal' },
  { name: 'Ravindra Jain', sub: 'Bollywood music legend\nnavigated public transport' },
  { name: 'Michael Hingson', sub: 'Survived 9/11 from 78th floor\nwith guide dog Roselle' },
];
stories.forEach((s, i) => {
  const x = 0.5 + i * 2.1;
  card(s5, x, 5.3, 1.95, 0.95, { fill: 'EFF6FF', border: 'BFDBFE' });
  s5.addText(s.name, { x, y: 5.35, w: 1.95, h: 0.35, fontSize: 10, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
  s5.addText(s.sub, { x, y: 5.7, w: 1.95, h: 0.45, fontSize: 8, fontFace: 'Arial', color: GRAY, align: 'center', lineSpacingMultiple: 1.3 });
});

s5.addText('Government Alignment', { x: 7, y: 4.95, w: 6, h: 0.3, fontSize: 13, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
const gov = [
  { name: 'ADIP Scheme', sub: 'Assistance to Disabled Persons\nMinistry of Social Justice' },
  { name: 'RPWD Act 2016', sub: 'Right to Accessible Transport\nMandatory Digital Accessibility' },
  { name: 'Sugamya Bharat', sub: 'Accessible India Campaign\nDigital Accessibility for All' },
];
gov.forEach((g, i) => {
  const x = 7 + i * 2.1;
  card(s5, x, 5.3, 1.95, 0.95, { fill: 'FEF3C7', border: 'FDE68A' });
  s5.addText(g.name, { x, y: 5.35, w: 1.95, h: 0.35, fontSize: 10, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
  s5.addText(g.sub, { x, y: 5.7, w: 1.95, h: 0.45, fontSize: 8, fontFace: 'Arial', color: GRAY, align: 'center', lineSpacingMultiple: 1.3 });
});


// ==================== SLIDE 6: RESEARCH ====================
let s6 = pptx.addSlide();
s6.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: 'FFFFFF' } });
addHeader(s6, 'RESEARCH AND REFERENCES');
addFooter(s6, 6);

s6.addText('Research and References', { x: 0.5, y: 0.75, w: 12, h: 0.4, fontSize: 20, fontFace: 'Arial', color: NAVY, bold: true });

// Left column
s6.addText('Market & Demographic Data', { x: 0.5, y: 1.3, w: 6, h: 0.3, fontSize: 12, fontFace: 'Arial', color: RED, bold: true });
s6.addText([
  { text: '- WHO (2023): 2.2B vision impaired globally', options: { fontSize: 9, fontFace: 'Arial', color: DARK, hyperlink: { url: 'https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment', color: '1A5276' } } },
  { text: '\n- India Census 2011: 26.8M disabled (2.21%)', options: { fontSize: 9, fontFace: 'Arial', color: DARK, hyperlink: { url: 'https://ndfdc.nic.in/upload/nhfdc/Persons_Disabilities_31mar21.pdf', color: '1A5276' } } },
  { text: '\n- 83% face difficulty navigating transport independently', options: { fontSize: 9, fontFace: 'Arial', color: DARK } },
  { text: '\n- 85% cannot complete online ticketing without help', options: { fontSize: 9, fontFace: 'Arial', color: DARK } },
  { text: '\n- Screen reader: 6.5 min | BusSahayak: 1.2 min (82% faster)', options: { fontSize: 9, fontFace: 'Arial', color: DARK } },
], { x: 0.5, y: 1.6, w: 6, h: 1.5, lineSpacingMultiple: 1.6 });

s6.addText('Technical Documentation', { x: 0.5, y: 3.2, w: 6, h: 0.3, fontSize: 12, fontFace: 'Arial', color: RED, bold: true });
s6.addText([
  { text: '- Google Gemini Live API: Real-time voice', options: { fontSize: 9, fontFace: 'Arial', color: DARK, hyperlink: { url: 'https://ai.google.dev/gemini-api/docs/live-api', color: '1A5276' } } },
  { text: '\n- React Native + Expo SDK 52: Cross-platform', options: { fontSize: 9, fontFace: 'Arial', color: DARK } },
  { text: '\n- Conversational AI: NLU (40+ Indian cities)', options: { fontSize: 9, fontFace: 'Arial', color: DARK } },
  { text: '\n- ZuelPay API: 2000+ bus operators', options: { fontSize: 9, fontFace: 'Arial', color: DARK } },
  { text: '\n- AWS / Azure / GCP: Cloud database + hosting', options: { fontSize: 9, fontFace: 'Arial', color: DARK } },
], { x: 0.5, y: 3.5, w: 6, h: 1.5, lineSpacingMultiple: 1.6 });

s6.addText('Dataset & Voice Engine', { x: 0.5, y: 5.1, w: 6, h: 0.3, fontSize: 12, fontFace: 'Arial', color: RED, bold: true });
s6.addText('- 28 M4A recordings converted to WAV (22050 Hz, Mono)\n- 30-line metadata.csv mapping audio to Hinglish text\n- Google Gemini: 70+ languages, sub-500ms latency', { x: 0.5, y: 5.4, w: 6, h: 0.8, fontSize: 9, fontFace: 'Arial', color: DARK, lineSpacingMultiple: 1.6 });

// Right column
s6.addText('Academic Research', { x: 7, y: 1.3, w: 6, h: 0.3, fontSize: 12, fontFace: 'Arial', color: RED, bold: true });
s6.addText([
  { text: '- WHO: 2.2B vision impaired globally', options: { fontSize: 9, fontFace: 'Arial', color: DARK, hyperlink: { url: 'https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment', color: '1A5276' } } },
  { text: '\n- NCBI (2025): AI assistive tech high satisfaction', options: { fontSize: 9, fontFace: 'Arial', color: DARK, hyperlink: { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11721483/', color: '1A5276' } } },
  { text: '\n- Microsoft Inclusive Design Toolkit', options: { fontSize: 9, fontFace: 'Arial', color: DARK, hyperlink: { url: 'https://inclusive.microsoft.design/', color: '1A5276' } } },
  { text: '\n- ACM: Voice UI for blind/visually impaired', options: { fontSize: 9, fontFace: 'Arial', color: DARK, hyperlink: { url: 'https://doi.org/10.1145/3529190.3529197', color: '1A5276' } } },
], { x: 7, y: 1.6, w: 6, h: 1.3, lineSpacingMultiple: 1.6 });

s6.addText('Industry References', { x: 7, y: 3.0, w: 6, h: 0.3, fontSize: 12, fontFace: 'Arial', color: RED, bold: true });
s6.addText([
  { text: '- Google Gemini Live API: 70+ languages', options: { fontSize: 9, fontFace: 'Arial', color: DARK, hyperlink: { url: 'https://ai.google.dev/gemini-api/docs/live-api', color: '1A5276' } } },
  { text: '\n- ZuelPay API: 2000+ operators, real-time data', options: { fontSize: 9, fontFace: 'Arial', color: DARK } },
  { text: '\n- RedBus: 100M+ users, market leader', options: { fontSize: 9, fontFace: 'Arial', color: DARK } },
  { text: '\n- NPCI UPI: Voice-based payment infrastructure', options: { fontSize: 9, fontFace: 'Arial', color: DARK } },
], { x: 7, y: 3.3, w: 6, h: 1.3, lineSpacingMultiple: 1.6 });

s6.addText('Government Policy', { x: 7, y: 4.7, w: 6, h: 0.3, fontSize: 12, fontFace: 'Arial', color: RED, bold: true });
s6.addText([
  { text: '- ADIP Scheme: Assistive devices for PwDs', options: { fontSize: 9, fontFace: 'Arial', color: DARK, hyperlink: { url: 'https://depwd.gov.in/en/adip/', color: '1A5276' } } },
  { text: '\n- RPWD Act 2016: Right to Accessible Transport', options: { fontSize: 9, fontFace: 'Arial', color: DARK, hyperlink: { url: 'https://indiankanoon.org/doc/97660308/', color: '1A5276' } } },
  { text: '\n- Sugamya Bharat: Accessible India Campaign', options: { fontSize: 9, fontFace: 'Arial', color: DARK, hyperlink: { url: 'https://sugamyabharat.gov.in/', color: '1A5276' } } },
], { x: 7, y: 5.0, w: 6, h: 0.9, lineSpacingMultiple: 1.6 });

s6.addText('Project Prototype', { x: 7, y: 6.0, w: 6, h: 0.3, fontSize: 12, fontFace: 'Arial', color: RED, bold: true });
s6.addText('- 28 source files, zero TypeScript errors\n- 7 screens: Home, Search, Results, Seat, Passenger, Confirm, Ticket\n- 5 hooks: Gestures, Conversational AI, Voice I/O, Haptics\n- Zustand state management + 40-city database\n- Cloud deployment ready (AWS / Azure / GCP)', { x: 7, y: 6.3, w: 6, h: 0.9, fontSize: 9, fontFace: 'Arial', color: DARK, lineSpacingMultiple: 1.5 });


// ==================== SLIDE 7: INSTRUCTIONS ====================
let s7 = pptx.addSlide();
s7.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: 'FFFFFF' } });
addHeader(s7, 'IMPORTANT INSTRUCTIONS');
addFooter(s7, 7);

s7.addText('Important Instructions', { x: 0.5, y: 0.75, w: 12, h: 0.4, fontSize: 20, fontFace: 'Arial', color: NAVY, bold: true });

// Team Details
s7.addText('Team Details', { x: 0.5, y: 1.3, w: 6, h: 0.3, fontSize: 14, fontFace: 'Arial', color: NAVY, bold: true });
card(s7, 0.5, 1.65, 6, 3, { fill: LIGHT_BG, border: 'E9ECEF' });
const teamInfo = [
  ['Team Name:', 'Coffee Into Code'],
  ['Leader:', 'Nitin Doyal'],
  ['Institution:', 'BCA G1 Semester 1'],
  ['Contact:', '+91 63504 24121'],
  ['Email:', 'nitindoyal00@gmail.com'],
  ['Stack:', 'React Native + Python + F5-TTS + Cloud DB'],
];
teamInfo.forEach((t, i) => {
  s7.addText(t[0], { x: 0.7, y: 1.8 + i * 0.4, w: 1.8, h: 0.35, fontSize: 11, fontFace: 'Arial', color: NAVY, bold: true, valign: 'middle' });
  s7.addText(t[1], { x: 2.6, y: 1.8 + i * 0.4, w: 3.7, h: 0.35, fontSize: 11, fontFace: 'Arial', color: DARK, valign: 'middle' });
});

// Upload Notes
s7.addText('Upload Notes', { x: 7, y: 1.3, w: 6, h: 0.3, fontSize: 14, fontFace: 'Arial', color: NAVY, bold: true });
card(s7, 7, 1.65, 6, 3, { fill: 'FFF3CD', border: 'FFC107', borderWidth: 1 });
const uploadNotes = [
  'Copy content into PowerPoint slides',
  'Insert UI screenshots into Slides 2, 3, 4',
  'Add infographics (3 Modes, Tele-Confirmation)',
  'Save as PDF before uploading to SIH portal',
  'Problem Statement ID: 25039',
  'Team ID: 12024',
];
uploadNotes.forEach((n, i) => {
  s7.addText('>>  ' + n, { x: 7.2, y: 1.8 + i * 0.4, w: 5.6, h: 0.35, fontSize: 10, fontFace: 'Arial', color: '856404', valign: 'middle' });
});

// Key Deliverables
s7.addText('Key Deliverables', { x: 0.5, y: 4.9, w: 12, h: 0.3, fontSize: 14, fontFace: 'Arial', color: NAVY, bold: true, align: 'center' });
const deliverables = [
  { title: 'Mobile + Web App', sub: 'React Native Expo | 7 Screens\nZero TS Errors | Cloud Deploy', fill: 'F0FDF4', border: 'BBF7D0', color: GREEN },
  { title: 'Voice Engine', sub: 'F5-TTS Voice Clone from 28 Recordings\ngTTS Hinglish | 140+ Sentences', fill: 'EFF6FF', border: 'BFDBFE', color: BLUE },
  { title: 'Conversational AI', sub: 'NLU Engine | 40+ Cities | Hindi/English\nGuided Booking Flow', fill: 'F5F3FF', border: 'DDD6FE', color: PURPLE },
  { title: 'Cloud Backend', sub: 'AWS / Azure / GCP Database\nScalable Hosting', fill: 'FFF5F5', border: 'FECACA', color: RED },
];
deliverables.forEach((d, i) => {
  const x = 0.5 + i * 3.2;
  card(s7, x, 5.25, 3, 1.1, { fill: d.fill, border: d.border, borderWidth: 1 });
  s7.addText(d.title, { x, y: 5.3, w: 3, h: 0.4, fontSize: 12, fontFace: 'Arial', color: d.color, bold: true, align: 'center' });
  s7.addText(d.sub, { x, y: 5.7, w: 3, h: 0.55, fontSize: 8, fontFace: 'Arial', color: GRAY, align: 'center', lineSpacingMultiple: 1.4 });
});

// Why BusSahayak Wins
card(s7, 0.5, 6.5, 12.33, 0.7, { fill: 'EFF6FF', border: 'BFDBFE' });
s7.addText('Why BusSahayak Wins', { x: 0.5, y: 6.5, w: 12.33, h: 0.7, fontSize: 13, fontFace: 'Arial', color: NAVY, bold: true, align: 'center', valign: 'middle' });
const wins = [
  { text: 'Voice First\nBuilt for blind', color: RED },
  { text: '3 Modes\nVoice, Touch, or Both', color: ORANGE },
  { text: 'Tele-Confirm\nDriver calls user', color: PURPLE },
  { text: '82% Faster\n1.2 min vs 6.5 min', color: GREEN },
  { text: 'Made in India\nHinglish + 40 cities', color: NAVY },
];
wins.forEach((w, i) => {
  const x = 0.7 + i * 2.45;
  s7.addText(w.text, { x, y: 6.55, w: 2.3, h: 0.6, fontSize: 9, fontFace: 'Arial', color: w.color, bold: true, align: 'center', valign: 'middle', lineSpacingMultiple: 1.3 });
});


// Generate
pptx.writeFile({ fileName: '/Users/nitindoyal.design/Documents/Codex/2026-05-08/bus-sahayak/SIH2025-BusSahayak-Presentation.pptx' })
  .then(() => console.log('PPTX generated!'))
  .catch(err => console.error('Error:', err));
