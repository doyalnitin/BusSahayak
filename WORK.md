# BusSahayak — Complete Implementation Guide

## Interaction Model

### How the Blind User Navigates

| Gesture | Action | Description |
|---------|--------|-------------|
| **Single Tap** | Select element | Focus on button, read label |
| **Double Tap** | Activate | Tap any button, confirm selection |
| **Triple Tap** | Go Home | Return to home screen from anywhere |
| **Hold Screen (1s)** | Voice Input | Start listening for voice command |
| **Release Hold** | Stop Listening | Process the spoken command |
| **Swipe Right** | Next element | Move to next focusable element |
| **Swipe Left** | Previous element | Move to previous element |
| **Say Number** | Select option | "1" to select first bus, "2" for second |
| **Say "Home"** | Go Home | Voice command to return home |
| **Say "Back"** | Go Back | Voice command to go to previous screen |

### Number Telling System

When bus options are read aloud, user speaks a number to select:

```
App:  "Bus 1: VRL Travels, 800 rupees. Bus 2: Neeta, 650 rupees. 
       Bus 3: Shivneri, 450 rupees. Say a number to select."
User: "2"
App:  "Neeta Travels selected. Now choosing seats."
```

### Dual System Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   BLIND USER APP    │         │  MANAGER DASHBOARD   │
│   (React Native)    │         │  (Web App)           │
│                     │         │                     │
│  Voice → Search     │────API──│  See all bookings   │
│  Number → Select    │         │  Call blind person  │
│  Hold → Speak       │         │  Confirm payment    │
│  Double Tap → Act   │         │  Mark confirmed     │
│  Triple Tap → Home  │         │  Send e-ticket      │
└─────────────────────┘         └─────────────────────┘
         │                               │
         └───────────┬───────────────────┘
                     │
            ┌────────────────┐
            │   BACKEND API  │
            │   (Express.js) │
            │                │
            │  Bus search    │
            │  Booking CRUD  │
            │  WebSocket     │
            │  Notification  │
            └────────────────┘
```

### Payment Flow (No Razorpay/CashFree)

```
1. Blind user searches & selects bus
2. App sends booking request to backend
3. Backend creates PENDING booking
4. Manager dashboard shows new booking
5. Manager CALLS blind person on phone
6. Blind person confirms details verbally
7. Manager collects payment (cash/UPI on call)
8. Manager marks booking CONFIRMED
9. Blind user receives e-ticket via SMS/app
```

---

## Voice AI Engine

### Architecture

```
┌─────────────────────────────────────────────────┐
│                VOICE AI ENGINE                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  STT     │───▶│  NLU     │───▶│  Intent  │  │
│  │  (Speech │    │  (Natural│    │  Router  │  │
│  │  to Text)│    │  Lang    │    │          │  │
│  └──────────┘    │  Underst)│    └────┬─────┘  │
│                  └──────────┘         │         │
│                                       ▼         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  TTS     │◀───│  Response│◀───│  Action  │  │
│  │  (Text   │    │  Generator│    │  Executor│  │
│  │  to      │    │          │    │          │  │
│  │  Speech) │    └──────────┘    └──────────┘  │
│  └──────────┘                                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Components

#### 1. Speech-to-Text (STT)

**Option A: Web Speech API (Free, Browser-based)**
```javascript
// Already implemented in hooks/useVoiceInput.ts
const recognition = new SpeechRecognition();
recognition.lang = 'en-IN';
recognition.interimResults = true;
```

**Option B: Whisper (Offline, On-device)**
```bash
npm install expo-sherpa-onnx
# Uses Whisper model for offline STT
# Supports Hindi, English, Tamil, Bengali
```

**Option C: Google Cloud STT (Paid, Best accuracy)**
```javascript
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();
// 95%+ accuracy, supports Indian languages
```

#### 2. Natural Language Understanding (NLU)

**Intent Classification (Local, No API needed)**

```javascript
// services/intentClassifier.ts

interface Intent {
  name: string;
  keywords: string[];
  patterns: RegExp[];
}

const intents: Intent[] = [
  {
    name: 'search_buses',
    keywords: ['search', 'find', 'look', 'bus', 'travel', 'go'],
    patterns: [
      /search\s+(?:for\s+)?buses/i,
      /find\s+buses/i,
      /(?:want|need)\s+to\s+go/i,
      /bus\s+(?:from|to)/i,
    ],
  },
  {
    name: 'select_bus',
    keywords: ['select', 'choose', 'pick', 'book'],
    patterns: [
      /select\s+(?:bus\s+)?(\d+)/i,
      /book\s+(?:bus\s+)?(\d+)/i,
      /^(\d+)$/i,  // Just a number
      /number\s+(\d+)/i,
    ],
  },
  {
    name: 'go_home',
    keywords: ['home', 'start', 'begin', 'main'],
    patterns: [/go\s+home/i, /home\s+screen/i, /start\s+over/i],
  },
  {
    name: 'go_back',
    keywords: ['back', 'previous', 'return'],
    patterns: [/go\s+back/i, /previous\s+screen/i],
  },
  {
    name: 'read_results',
    keywords: ['read', 'tell', 'again', 'repeat'],
    patterns: [/read\s+(?:again|results)/i, /tell\s+me/i],
  },
  {
    name: 'confirm',
    keywords: ['yes', 'confirm', 'okay', 'proceed'],
    patterns: [/^(?:yes|confirm|okay|proceed)$/i],
  },
  {
    name: 'cancel',
    keywords: ['no', 'cancel', 'stop'],
    patterns: [/^(?:no|cancel|stop)$/i],
  },
];

export function classifyIntent(transcript: string): { intent: string; entities: any } {
  const lower = transcript.toLowerCase().trim();
  
  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      const match = lower.match(pattern);
      if (match) {
        return {
          intent: intent.name,
          entities: extractEntities(lower, intent.name, match),
        };
      }
    }
  }
  
  // Check for number selection
  const numMatch = lower.match(/^(\d+)$/);
  if (numMatch) {
    return { intent: 'select_number', entities: { number: parseInt(numMatch[1]) } };
  }
  
  return { intent: 'unknown', entities: {} };
}

function extractEntities(text: string, intent: string, match: RegExpMatchArray) {
  const entities: any = {};
  
  if (intent === 'search_buses') {
    // Extract city names
    const fromMatch = text.match(/from\s+(\w+(?:\s+\w+)?)/i);
    const toMatch = text.match(/to\s+(\w+(?:\s+\w+)?)/i);
    if (fromMatch) entities.from = fromMatch[1];
    if (toMatch) entities.to = toMatch[1];
  }
  
  if (intent === 'select_bus' || intent === 'select_number') {
    entities.number = parseInt(match[1]);
  }
  
  return entities;
}
```

#### 3. Response Generator

```javascript
// services/responseGenerator.ts

export function generateResponse(intent: string, context: any): string {
  switch (intent) {
    case 'search_buses':
      return `Searching buses from ${context.from} to ${context.to}. Please wait.`;
    
    case 'select_number':
      const bus = context.buses[context.entities.number - 1];
      if (bus) {
        return `Selected ${bus.operatorName}. ${bus.busType}. ${bus.fare} rupees. Say confirm to book.`;
      }
      return `Invalid selection. Say a number between 1 and ${context.buses.length}.`;
    
    case 'go_home':
      return `Going to home screen.`;
    
    case 'go_back':
      return `Going back.`;
    
    case 'read_results':
      return readBusList(context.buses);
    
    case 'confirm':
      return `Booking confirmed. You will receive a confirmation call shortly.`;
    
    case 'cancel':
      return `Cancelled. What would you like to do?`;
    
    default:
      return `I didn't understand. You can say search buses, select a number, or go home.`;
  }
}

function readBusList(buses: any[]): string {
  if (!buses || buses.length === 0) return 'No buses found.';
  
  let text = `Found ${buses.length} buses. `;
  buses.slice(0, 5).forEach((bus, i) => {
    text += `Bus ${i + 1}: ${bus.operatorName}, ${bus.busType}, ${bus.fare} rupees. `;
  });
  text += `Say a number to select.`;
  return text;
}
```

#### 4. Text-to-Speech (TTS)

```javascript
// Already implemented in hooks/useVoiceOutput.ts
// Uses Web Speech API SpeechSynthesis
// Rate: 0.45 (slow for clarity)
// Language: en-IN (Indian English)
```

---

## RAG Model (Retrieval-Augmented Generation)

### What is RAG?

RAG combines a **retrieval system** (search) with a **language model** (generation) to answer questions using your own data.

```
User Question → Search Knowledge Base → Find Relevant Docs → 
Generate Answer using LLM + Found Docs → Return Answer
```

### Knowledge Base Structure

```
knowledge-base/
├── routes/
│   ├── mumbai-pune.json
│   ├── delhi-jaipur.json
│   └── ...
├── operators/
│   ├── vrl-travels.json
│   ├── neeta-travels.json
│   └── ...
├── stations/
│   ├── dadar.json
│   ├── pune-swargate.json
│   └── ...
├── policies/
│   ├── cancellation.json
│   ├── refund.json
│   └── ...
└── faq/
    ├── general.json
    ├── accessibility.json
    └── ...
```

### Example Knowledge Document

```json
// knowledge-base/routes/mumbai-pune.json
{
  "id": "route-001",
  "type": "route",
  "from": "Mumbai",
  "to": "Pune",
  "distance": "150 km",
  "duration": "4-5 hours",
  "popular_operators": ["VRL Travels", "Neeta Travels", "MSRTC Shivneri"],
  "boarding_points": [
    { "name": "Dadar TT Circle", "lat": 19.0178, "lng": 72.8478 },
    { "name": "Kurla Station", "lat": 19.0726, "lng": 72.8796 },
    { "name": "Mumbai Central", "lat": 19.0008, "lng": 72.8147 }
  ],
  "dropping_points": [
    { "name": "Pune Station Road", "lat": 18.5286, "lng": 73.8745 },
    { "name": "Kothrud Depot", "lat": 18.5074, "lng": 73.8077 }
  ],
  "fare_range": { "sleeper": "600-900", "ac": "800-1200", "seater": "300-500" },
  "best_time": "Night buses (9PM-11PM) for overnight travel",
  "tips": "Book 2-3 days in advance for weekend travel"
}
```

```json
// knowledge-base/operators/vrl-travels.json
{
  "id": "operator-001",
  "type": "operator",
  "name": "VRL Travels",
  "rating": 4.5,
  "bus_types": ["AC Sleeper", "Non-AC Seater", "AC Seater"],
  "coverage": "Mumbai, Pune, Bangalore, Goa, Hubli",
  "amenities": ["WiFi", "Blanket", "Water Bottle", "Charging Point"],
  "cancellation_policy": "Free cancellation up to 4 hours before departure",
  "contact": "1800-123-4567",
  "accessibility": "Wheelchair accessible buses available on select routes"
}
```

### RAG Implementation

```javascript
// services/ragEngine.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class RAGEngine {
  private knowledgeBase: Map<string, any[]> = new Map();
  
  // Load knowledge base
  async loadKnowledgeBase() {
    // In production, load from files/database
    // For hackathon, use in-memory
  }
  
  // Search knowledge base (vector similarity)
  async search(query: string, topK: number = 3): Promise<any[]> {
    const results: any[] = [];
    const queryLower = query.toLowerCase();
    
    // Simple keyword matching (upgrade to vector search in production)
    for (const [category, docs] of this.knowledgeBase) {
      for (const doc of docs) {
        const score = this.calculateRelevance(queryLower, doc);
        if (score > 0.3) {
          results.push({ ...doc, score, category });
        }
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
  
  // Calculate relevance score
  private calculateRelevance(query: string, doc: any): number {
    const text = JSON.stringify(doc).toLowerCase();
    const words = query.split(' ');
    let matches = 0;
    
    for (const word of words) {
      if (word.length > 2 && text.includes(word)) {
        matches++;
      }
    }
    
    return matches / words.length;
  }
  
  // Generate answer using LLM + retrieved context
  async answer(question: string): Promise<string> {
    // 1. Retrieve relevant documents
    const relevantDocs = await this.search(question);
    
    // 2. Build context
    const context = relevantDocs
      .map(doc => JSON.stringify(doc, null, 2))
      .join('\n\n');
    
    // 3. Generate answer with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are BusSahayak, an accessible bus booking assistant for blind users in India.
    
Answer the user's question using ONLY the provided context. Be concise and helpful.
If the answer is not in the context, say "I don't have that information. Please try asking differently."

Context:
${context}

User Question: ${question}

Answer:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}

export const ragEngine = new RAGEngine();
```

### RAG Flow for Bus Booking

```
User: "What buses go from Mumbai to Pune at night?"

RAG Engine:
1. Search KB → finds route-001 (Mumbai-Pune route)
2. Search KB → finds operator-001 (VRL night buses)
3. Context = [route-001, operator-001]
4. LLM generates: "Mumbai to Pune has several night buses. 
   VRL Travels has AC Sleeper buses departing 9-11 PM, 
   arriving 1-3 AM. Fare is 600-900 rupees. 
   Popular boarding points: Dadar TT Circle, Kurla Station. 
   Want me to search available buses?"
5. TTS reads this to the blind user
```

---

## Tech Stack Summary

| Component | Technology | Why |
|-----------|-----------|-----|
| Mobile App | React Native + Expo | Cross-platform, accessibility APIs |
| Voice Input | Web Speech API + Whisper | Free + offline backup |
| Voice Output | SpeechSynthesis API | Built-in, no cost |
| Intent Classification | Custom regex classifier | Fast, no API needed |
| RAG Knowledge Base | JSON files + vector search | Simple for hackathon |
| LLM (RAG) | Gemini API (free tier) | Good for Indian context |
| Backend | Express.js + SQLite | Simple, no database setup |
| Real-time | WebSocket (Socket.io) | Live booking updates |
| Manager Dashboard | React + Vite | Fast web app |
| Deployment | Vercel (web) + EAS (mobile) | Free tier |

---

## File Structure

```
bus-sahayak/
├── app/                    # React Native screens
│   ├── _layout.tsx
│   ├── index.tsx           # Onboarding
│   ├── home.tsx            # Home with triple-tap
│   ├── search.tsx          # Voice search
│   ├── results.tsx         # Number selection
│   ├── seat-selection.tsx  # Text seat picker
│   ├── booking.tsx         # Confirmation
│   └── tickets.tsx         # My bookings
├── components/
│   ├── GestureHandler.tsx  # Tap/hold gesture system
│   ├── NumberSelector.tsx  # Voice number selection
│   ├── VoiceButton.tsx     # Hold-to-speak button
│   └── ...
├── hooks/
│   ├── useGestures.ts      # Triple-tap, hold, double-tap
│   ├── useVoiceInput.ts    # STT
│   ├── useVoiceOutput.ts   # TTS
│   └── useIntentRouter.ts  # Intent classification
├── services/
│   ├── intentClassifier.ts # NLU
│   ├── responseGenerator.ts# Response builder
│   ├── ragEngine.ts        # RAG model
│   └── busApi.ts           # Bus search API
├── knowledge-base/         # RAG data
│   ├── routes/
│   ├── operators/
│   ├── stations/
│   └── policies/
├── manager-dashboard/      # Web dashboard
│   ├── src/
│   │   ├── App.tsx
│   │   ├── BookingsList.tsx
│   │   └── BookingDetail.tsx
│   └── package.json
└── backend/
    ├── server.ts
    └── routes/
        ├── bookings.ts
        └── websocket.ts
```
