// Conversational AI Engine for BusSahayak
// Understands natural voice commands and guides blind users through booking

interface UserContext {
  intent: string;
  from: string;
  to: string;
  date: string;
  time: string;
  busType: string;
  seatPreference: string;
  passengers: Array<{ name: string; age: number; gender: string }>;
  mobile: string;
  step: string;
  awaiting: string;
}

interface AIResponse {
  message: string;
  action: string;
  data: any;
  askFor: string[];
}

const CITIES: Record<string, string> = {
  mumbai: "Mumbai",
  pune: "Pune",
  delhi: "Delhi",
  jaipur: "Jaipur",
  bangalore: "Bangalore",
  bengaluru: "Bangalore",
  hyderabad: "Hyderabad",
  chennai: "Chennai",
  kolkata: "Kolkata",
  ahmedabad: "Ahmedabad",
  goa: "Goa",
  nagpur: "Nagpur",
  indore: "Indore",
  lucknow: "Lucknow",
  chandigarh: "Chandigarh",
  bhopal: "Bhopal",
  patna: "Patna",
  ranchi: "Ranchi",
  varanasi: "Varanasi",
  surat: "Surat",
  vadodara: "Vadodara",
  coimbatore: "Coimbatore",
  kochi: "Kochi",
  thiruvananthapuram: "Thiruvananthapuram",
  mysore: "Mysore",
  hubli: "Hubli",
  vijayawada: "Vijayawada",
  visakhapatnam: "Visakhapatnam",
  tiruchirappalli: "Tiruchirappalli",
  madurai: "Madurai",
  agra: "Agra",
  kanpur: "Kanpur",
  nashik: "Nashik",
  aurangabad: "Aurangabad",
  solapur: "Solapur",
  amravati: "Amravati",
  nanded: "Nanded",
  sangli: "Sangli",
  kolhapur: "Kolhapur",
};

const TIME_PATTERNS: Record<string, string> = {
  subah: "morning",
  morning: "morning",
  dopahar: "afternoon",
  afternoon: "afternoon",
  sham: "evening",
  evening: "evening",
  raat: "night",
  night: "night",
  "early morning": "early_morning",
  "late night": "late_night",
};

const BUS_TYPES: Record<string, string> = {
  ac: "AC",
  "non ac": "Non-AC",
  sleeper: "Sleeper",
  seater: "Seater",
  volvo: "Volvo",
  "ac sleeper": "AC Sleeper",
  "ac seater": "AC Seater",
  luxury: "Luxury",
  "semi luxury": "Semi-Luxury",
  ordinary: "Ordinary",
};

function extractCity(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, value] of Object.entries(CITIES)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  return null;
}

function extractTime(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, value] of Object.entries(TIME_PATTERNS)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  // Check for specific times like "10 baje", "2 PM"
  const timeMatch = lower.match(/(\d{1,2})\s*(baje|pm|am|o'clock)/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1]);
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }
  return null;
}

function extractDate(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("aaj") || lower.includes("today")) return "today";
  if (lower.includes("kal") || lower.includes("tomorrow")) return "tomorrow";
  if (lower.includes("parson") || lower.includes("day after")) return "day_after_tomorrow";
  if (lower.includes("is hafte") || lower.includes("this week")) return "this_week";
  if (lower.includes("agle hafte") || lower.includes("next week")) return "next_week";
  return null;
}

function extractBusType(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, value] of Object.entries(BUS_TYPES)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  return null;
}

function extractNumber(text: string): number | null {
  const lower = text.toLowerCase();
  const hindiNums: Record<string, number> = {
    ek: 1, do: 2, teen: 3, chaar: 4, char: 4,
    paanch: 5, che: 6, saat: 7, aath: 8, nau: 9, das: 10,
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  };
  for (const [key, value] of Object.entries(hindiNums)) {
    if (lower.includes(key)) return value;
  }
  const numMatch = lower.match(/\d+/);
  if (numMatch) return parseInt(numMatch[0]);
  return null;
}

function detectIntent(text: string): string {
  const lower = text.toLowerCase();

  // Booking intents
  if (lower.match(/book|ticket|kharid|reserve|ticket.*chahiye|bus.*chahiye|jana hai|jaana hai|travel|yatra/)) {
    return "search_buses";
  }
  if (lower.match(/search|dhundh|khoj|find/)) {
    return "search_buses";
  }

  // Status intents
  if (lower.match(/status|pnr|check.*booking|meri.*booking|booking.*kaisi/)) {
    return "check_status";
  }

  // Cancel intent
  if (lower.match(/cancel|radd|band|rok/)) {
    return "cancel_booking";
  }

  // Help intent
  if (lower.match(/help|madad|samajh|kya|kaise/)) {
    return "help";
  }

  // Home intent
  if (lower.match(/home|ghar|start|shuru|menu/)) {
    return "go_home";
  }

  // Back intent
  if (lower.match(/back|pichhe|wapas|return/)) {
    return "go_back";
  }

  // Confirm intent
  if (lower.match(/confirm|haan|yes|theek|sahi|ok|okay|done/)) {
    return "confirm";
  }

  // No/Cancel intent
  if (lower.match(/nahi|no|cancel|rok/)) {
    return "deny";
  }

  return "unknown";
}

export function processVoiceInput(
  transcript: string,
  context: UserContext
): AIResponse {
  const intent = detectIntent(transcript);
  const fromCity = extractCity(transcript);
  const toCity = extractCity(transcript);
  const time = extractTime(transcript);
  const date = extractDate(transcript);
  const busType = extractBusType(transcript);
  const number = extractNumber(transcript);

  // Update context with extracted info
  if (fromCity) context.from = fromCity;
  if (toCity) context.to = toCity;
  if (time) context.time = time;
  if (date) context.date = date;
  if (busType) context.busType = busType;

  // Handle different intents
  switch (intent) {
    case "search_buses":
      return handleSearch(context, transcript);

    case "check_status":
      return {
        message: "Aapka PNR number kya hai? Number bolo ya screen par dekho.",
        action: "ask_pnr",
        data: {},
        askFor: ["pnr"],
      };

    case "cancel_booking":
      return {
        message: "Konsi booking cancel karni hai? PNR number bolo.",
        action: "ask_pnr_cancel",
        data: {},
        askFor: ["pnr"],
      };

    case "help":
      return {
        message: "Main aapki madad kar sakta hoon. Bus dhundne ke liye bolo, jaise Mumbai se Pune jaana hai. Booking check karne ke liye meri bookings bolo.",
        action: "show_help",
        data: {},
        askFor: [],
      };

    case "go_home":
      return {
        message: "Home screen par aa gaye. Kya karna hai?",
        action: "go_home",
        data: {},
        askFor: [],
      };

    case "go_back":
      return {
        message: "Pichhe ja rahe hain.",
        action: "go_back",
        data: {},
        askFor: [],
      };

    case "confirm":
      return handleConfirm(context);

    case "deny":
      return {
        message: "Theek hai. Kya karna hai?",
        action: "deny",
        data: {},
        askFor: [],
      };

    default:
      return handleUnknown(transcript, context);
  }
}

function handleSearch(context: UserContext, transcript: string): AIResponse {
  const missing: string[] = [];

  if (!context.from) missing.push("from_city");
  if (!context.to) missing.push("to_city");

  // If both cities provided, ask for preferences
  if (context.from && context.to) {
    if (!context.date) {
      return {
        message: `${context.from} se ${context.to} ke liye kal ki buses dhundun? Ya koi aur date bolo.`,
        action: "ask_date",
        data: { from: context.from, to: context.to },
        askFor: ["date"],
      };
    }
    if (!context.time) {
      return {
        message: `Kis time ki bus chahiye? Subah, dopahar, sham, ya raat?`,
        action: "ask_time",
        data: { from: context.from, to: context.to, date: context.date },
        askFor: ["time"],
      };
    }
    if (!context.busType) {
      return {
        message: `Kaisi bus chahiye? AC, sleeper, seater, ya koi bhi?`,
        action: "ask_bus_type",
        data: { from: context.from, to: context.to, date: context.date, time: context.time },
        askFor: ["busType"],
      };
    }

    // All info collected, search
    return {
      message: `${context.from} se ${context.to} ki ${context.date} ko ${context.time} mein ${context.busType} buses dhundh rahe hain.`,
      action: "search_buses",
      data: {
        from: context.from,
        to: context.to,
        date: context.date,
        time: context.time,
        busType: context.busType,
      },
      askFor: [],
    };
  }

  // Missing cities
  if (!context.from && !context.to) {
    return {
      message: "Kahan se kahan jaana hai? Pehle departure city bolo, phir destination.",
      action: "ask_cities",
      data: {},
      askFor: ["from_city", "to_city"],
    };
  }

  if (!context.from) {
    return {
      message: "Aap kahan se jaana chahte ho? Departure city ka naam bolo.",
      action: "ask_from_city",
      data: {},
      askFor: ["from_city"],
    };
  }

  if (!context.to) {
    return {
      message: `${context.from} se kahan jaana hai? Destination city ka naam bolo.`,
      action: "ask_to_city",
      data: { from: context.from },
      askFor: ["to_city"],
    };
  }

  return {
    message: "Kahan jaana hai? Cities bolo.",
    action: "ask_cities",
    data: {},
    askFor: ["from_city", "to_city"],
  };
}

function handleConfirm(context: UserContext): AIResponse {
  if (context.step === "select_bus") {
    return {
      message: "Bus confirm ho gayi. Ab seat select karo.",
      action: "go_to_seats",
      data: {},
      askFor: ["seat"],
    };
  }
  if (context.step === "select_seat") {
    return {
      message: "Seats confirm. Ab passenger details daalo.",
      action: "go_to_passenger",
      data: {},
      askFor: ["passenger"],
    };
  }
  if (context.step === "passenger_details") {
    return {
      message: "Details confirm. Ab booking submit ho rahi hai. Manager call karega.",
      action: "submit_booking",
      data: {},
      askFor: [],
    };
  }
  return {
    message: "Confirm kya karna hai? Pehle booking karo.",
    action: "ask_booking",
    data: {},
    askFor: [],
  };
}

function handleUnknown(transcript: string, context: UserContext): AIResponse {
  // Try to extract cities even if intent is unclear
  const fromCity = extractCity(transcript);
  const toCity = extractCity(transcript);

  if (fromCity && toCity) {
    context.from = fromCity;
    context.to = toCity;
    return handleSearch(context, transcript);
  }

  if (fromCity && !context.from) {
    context.from = fromCity;
    return {
      message: `${fromCity} se kahan jaana hai?`,
      action: "ask_to_city",
      data: { from: fromCity },
      askFor: ["to_city"],
    };
  }

  if (toCity && !context.to) {
    context.to = toCity;
    if (context.from) {
      return handleSearch(context, transcript);
    }
    return {
      message: `${toCity} tak jaana hai. Kahan se jaoge?`,
      action: "ask_from_city",
      data: { to: toCity },
      askFor: ["from_city"],
    };
  }

  return {
    message: "Main samajh nahi paya. Dobara bolo. Jaise, Mumbai se Pune jaana hai.",
    action: "retry",
    data: {},
    askFor: [],
  };
}

export function createContext(): UserContext {
  return {
    intent: "",
    from: "",
    to: "",
    date: "tomorrow",
    time: "any",
    busType: "any",
    seatPreference: "",
    passengers: [],
    mobile: "",
    step: "start",
    awaiting: "",
  };
}

export function readBusResults(buses: any[]): string {
  if (!buses || buses.length === 0) {
    return "Koi bus nahi mili. Alag cities try karo.";
  }

  let text = `${buses.length} buses mili. `;
  buses.slice(0, 5).forEach((bus, i) => {
    const nums = ["ek", "do", "teen", "chaar", "paanch"];
    text += `Bus ${nums[i] || i + 1}. ${bus.operatorName}. ${bus.busType}. `;
    text += `${bus.departureTime} baje nikalti hai. Fare ${bus.fare} rupaye. `;
  });
  text += "Bus select karne ke liye number bolo.";
  return text;
}

export function readSeatOptions(seats: any[]): string {
  const available = seats.filter((s) => s.status === "available");
  if (available.length === 0) return "Koi seat available nahi hai.";

  let text = `${available.length} seats available hain. `;
  text += "Window seat ke liye L bolo. Middle seat ke liye M bolo. Aisle seat ke liye R bolo. ";
  text += "Seat select karne ke liye seat number bolo, jaise 5L ya 2M.";
  return text;
}

export function readBookingConfirmation(booking: any): string {
  return `Booking confirm ho gayi. PNR number ${booking.pnr}. ${booking.busName}. ${booking.seats}. Total fare ${booking.fare} rupaye. Manager jald hi call karega.`;
}
