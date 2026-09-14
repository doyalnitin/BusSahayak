import { BusResult } from '../store/useBookingStore';

interface ResponseContext {
  buses?: BusResult[];
  selectedBus?: BusResult;
  selectedSeats?: string[];
  from?: string;
  to?: string;
  pnr?: string;
  totalFare?: number;
  entities?: Record<string, any>;
}

export function generateResponse(
  intent: string,
  context: ResponseContext
): string {
  switch (intent) {
    case 'search_buses':
      if (context.from && context.to) {
        return `Searching buses from ${context.from} to ${context.to}. Please wait.`;
      }
      return 'Please tell me where you want to go. Say from and to city names.';

    case 'select_bus':
    case 'select_number':
      if (context.entities?.number && context.buses) {
        const idx = context.entities.number - 1;
        const bus = context.buses[idx];
        if (bus) {
          return `Selected ${bus.operatorName}. ${bus.busType}. ${bus.fare} rupees. Say confirm to book or back to choose another.`;
        }
        return `Invalid selection. Say a number between 1 and ${context.buses.length}.`;
      }
      return 'Say a number to select a bus.';

    case 'select_seat':
      if (context.entities?.seat) {
        return `Seat ${context.entities.seat} selected. Say confirm to continue.`;
      }
      return 'Say a seat number like 5L or 2M.';

    case 'go_home':
      return 'Going to home screen.';

    case 'go_back':
      return 'Going back.';

    case 'read_results':
      return readBusList(context.buses || []);

    case 'confirm':
      if (context.pnr) {
        return `Booking confirmed. Your PNR is ${context.pnr}. You will receive a confirmation call shortly.`;
      }
      return 'Confirming your booking.';

    case 'cancel':
      return 'Cancelled. What would you like to do?';

    default:
      return 'I did not understand. You can say search buses, select a number, or go home.';
  }
}

function readBusList(buses: BusResult[]): string {
  if (!buses || buses.length === 0) return 'No buses found.';

  let text = `Found ${buses.length} buses. `;
  buses.slice(0, 5).forEach((bus, i) => {
    text += `Bus ${i + 1}: ${bus.operatorName}, ${bus.busType}, ${bus.fare} rupees. `;
  });
  text += 'Say a number to select.';
  return text;
}

export function readBookingConfirmation(
  pnr: string,
  bus: BusResult,
  seats: string[],
  totalFare: number
): string {
  return `Booking confirmed. PNR number ${pnr}. ${bus.operatorName} from ${bus.boardingPoints[0]} to ${bus.droppingPoints[0]}. Seat ${seats.join(' and ')}. Total fare ${totalFare} rupees. You will receive a confirmation call shortly.`;
}
