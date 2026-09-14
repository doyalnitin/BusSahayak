export interface Intent {
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
      /from\s+\w+\s+to\s+\w+/i,
    ],
  },
  {
    name: 'select_bus',
    keywords: ['select', 'choose', 'pick', 'book'],
    patterns: [
      /select\s+(?:bus\s+)?(\d+)/i,
      /book\s+(?:bus\s+)?(\d+)/i,
      /number\s+(\d+)/i,
    ],
  },
  {
    name: 'select_number',
    keywords: [],
    patterns: [/^(\d+)$/i],
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
    patterns: [/read\s+(?:again|results|buses)/i, /tell\s+me/i],
  },
  {
    name: 'confirm',
    keywords: ['yes', 'confirm', 'okay', 'proceed'],
    patterns: [/^(?:yes|confirm|okay|proceed|confirm\s*booking)$/i],
  },
  {
    name: 'cancel',
    keywords: ['no', 'cancel', 'stop'],
    patterns: [/^(?:no|cancel|stop)$/i],
  },
  {
    name: 'select_seat',
    keywords: ['seat'],
    patterns: [
      /seat\s+([a-z]?\d+[a-z]?)/i,
      /^([a-z]?\d+[a-z]?)$/i,
    ],
  },
];

export interface ClassifiedIntent {
  intent: string;
  entities: Record<string, any>;
}

export function classifyIntent(transcript: string): ClassifiedIntent {
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

  const numMatch = lower.match(/^(\d+)$/);
  if (numMatch) {
    return { intent: 'select_number', entities: { number: parseInt(numMatch[1]) } };
  }

  return { intent: 'unknown', entities: {} };
}

function extractEntities(
  text: string,
  intent: string,
  match: RegExpMatchArray
): Record<string, any> {
  const entities: Record<string, any> = {};

  if (intent === 'search_buses') {
    const fromMatch = text.match(/from\s+(\w+(?:\s+\w+)?)/i);
    const toMatch = text.match(/to\s+(\w+(?:\s+\w+)?)/i);
    if (fromMatch) entities.from = fromMatch[1];
    if (toMatch) entities.to = toMatch[1];
  }

  if (intent === 'select_bus' || intent === 'select_number') {
    entities.number = parseInt(match[1]);
  }

  if (intent === 'select_seat') {
    entities.seat = match[1];
  }

  return entities;
}
