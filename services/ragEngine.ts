interface KnowledgeDocument {
  id: string;
  type: string;
  data: Record<string, any>;
}

const knowledgeBase: KnowledgeDocument[] = [
  {
    id: 'route-001',
    type: 'route',
    data: {
      from: 'Mumbai',
      to: 'Pune',
      distance: '150 km',
      duration: '4-5 hours',
      popularOperators: ['VRL Travels', 'Neeta Travels', 'MSRTC Shivneri'],
      boardingPoints: ['Dadar TT Circle', 'Kurla Station', 'Mumbai Central'],
      droppingPoints: ['Pune Station Road', 'Kothrud Depot'],
      fareRange: { sleeper: '600-900', ac: '800-1200', seater: '300-500' },
      bestTime: 'Night buses 9PM to 11PM for overnight travel',
      tips: 'Book 2-3 days in advance for weekend travel',
    },
  },
  {
    id: 'route-002',
    type: 'route',
    data: {
      from: 'Delhi',
      to: 'Jaipur',
      distance: '280 km',
      duration: '5-6 hours',
      popularOperators: ['Neeta Travels', 'RSRTC'],
      boardingPoints: ['Kashmere Gate ISBT', 'Majnu Ka Tilla'],
      droppingPoints: ['Jaipur Bus Stand', 'Mansarovar'],
      fareRange: { sleeper: '500-800', ac: '700-1000', seater: '250-400' },
      bestTime: 'Early morning buses for day travel',
      tips: 'NH48 is the main highway, takes about 5 hours',
    },
  },
  {
    id: 'route-003',
    type: 'route',
    data: {
      from: 'Bangalore',
      to: 'Hyderabad',
      distance: '570 km',
      duration: '8-10 hours',
      popularOperators: ['KSRTC', 'APSRTC', 'VRL Travels'],
      boardingPoints: ['Majestic Bus Stand', 'Electronic City'],
      droppingPoints: ['MGBS Hyderabad', 'Ameerpet'],
      fareRange: { sleeper: '800-1200', ac: '1000-1500', seater: '500-700' },
      bestTime: 'Overnight buses departing 8PM to 10PM',
      tips: 'Book well in advance, route is very popular',
    },
  },
  {
    id: 'operator-001',
    type: 'operator',
    data: {
      name: 'VRL Travels',
      rating: 4.5,
      busTypes: ['AC Sleeper', 'Non-AC Seater', 'AC Seater'],
      amenities: ['WiFi', 'Blanket', 'Water Bottle', 'Charging Point'],
      cancellationPolicy: 'Free cancellation up to 4 hours before departure',
      contact: '1800-123-4567',
      accessibility: 'Wheelchair accessible buses available on select routes',
    },
  },
  {
    id: 'operator-002',
    type: 'operator',
    data: {
      name: 'Neeta Travels',
      rating: 4.3,
      busTypes: ['Volvo AC', 'Non-AC Seater', 'Sleeper'],
      amenities: ['Water Bottle', 'Blanket', 'Charging Point'],
      cancellationPolicy: 'Free cancellation up to 2 hours before departure',
      contact: '1800-234-5678',
      accessibility: 'Priority seating for disabled passengers',
    },
  },
  {
    id: 'policy-001',
    type: 'policy',
    data: {
      topic: 'Cancellation',
      rules: [
        'Free cancellation up to 4 hours before departure',
        '50% refund for cancellations 2-4 hours before',
        'No refund for cancellations less than 2 hours before',
        'Refund processed within 5-7 business days',
      ],
    },
  },
  {
    id: 'policy-002',
    type: 'policy',
    data: {
      topic: 'Booking',
      rules: [
        'Bookings are confirmed after manager phone verification',
        'Payment collected via cash or UPI on call',
        'E-ticket sent via SMS after payment confirmation',
        'Carry a valid ID proof during travel',
      ],
    },
  },
  {
    id: 'faq-001',
    type: 'faq',
    data: {
      question: 'How does the voice booking work?',
      answer:
        'Hold the screen to activate voice, say your destination, select a bus by saying its number, and confirm. A manager will call you to verify and collect payment.',
    },
  },
  {
    id: 'faq-002',
    type: 'faq',
    data: {
      question: 'How is payment handled?',
      answer:
        'We do not use online payment gateways. After booking, a manager calls you to confirm and collect payment via cash or UPI. This makes it easier for blind users.',
    },
  },
  {
    id: 'faq-003',
    type: 'faq',
    data: {
      question: 'What gestures can I use?',
      answer:
        'Hold screen to use voice. Double tap to select. Triple tap to go home. Say a number to choose options. Swipe right for next element.',
    },
  },
];

export function searchKnowledgeBase(query: string, topK: number = 3): KnowledgeDocument[] {
  const results: { doc: KnowledgeDocument; score: number }[] = [];
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/).filter((w) => w.length > 2);

  for (const doc of knowledgeBase) {
    const text = JSON.stringify(doc.data).toLowerCase();
    let matches = 0;

    for (const word of words) {
      if (text.includes(word)) {
        matches++;
      }
    }

    const score = words.length > 0 ? matches / words.length : 0;
    if (score > 0.1) {
      results.push({ doc, score });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r) => r.doc);
}

export function generateRAGResponse(question: string): string {
  const relevantDocs = searchKnowledgeBase(question);

  if (relevantDocs.length === 0) {
    return 'I do not have that information. Please try asking differently or say search buses to start booking.';
  }

  const context = relevantDocs.map((doc) => {
    if (doc.type === 'route') {
      return `Route: ${doc.data.from} to ${doc.data.to}. Distance: ${doc.data.distance}. Duration: ${doc.data.duration}. Operators: ${doc.data.popularOperators.join(', ')}. Fare: ${JSON.stringify(doc.data.fareRange)}. Tips: ${doc.data.tips}`;
    }
    if (doc.type === 'operator') {
      return `Operator: ${doc.data.name}. Rating: ${doc.data.rating}. Types: ${doc.data.busTypes.join(', ')}. Amenities: ${doc.data.amenities.join(', ')}. Cancellation: ${doc.data.cancellationPolicy}`;
    }
    if (doc.type === 'policy') {
      return `Policy - ${doc.data.topic}: ${doc.data.rules.join('. ')}`;
    }
    if (doc.type === 'faq') {
      return `Q: ${doc.data.question} A: ${doc.data.answer}`;
    }
    return JSON.stringify(doc.data);
  });

  return context.join('. ');
}
