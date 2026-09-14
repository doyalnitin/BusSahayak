import { BusResult, SeatInfo } from "../store/useBookingStore";

export const mockBuses: BusResult[] = [
  {
    id: "bus-001",
    operatorName: "VRL Travels",
    busType: "Volvo A/C Sleeper (2+1)",
    busCategory: "sleeper",
    departureTime: "22:00",
    arrivalTime: "02:00",
    duration: "4h 00m",
    availableSeats: 12,
    fare: 800,
    rating: 4.5,
    boardingPoints: [
      { id: "bp-1", name: "Dadar TT Circle", time: "22:00" },
      { id: "bp-2", name: "Kurla Station", time: "22:15" },
    ],
    droppingPoints: [
      { id: "dp-1", name: "Pune Station Road", time: "02:00" },
      { id: "dp-2", name: "Kothrud Depot", time: "02:20" },
    ],
  },
  {
    id: "bus-002",
    operatorName: "Neeta Travels",
    busType: "Volvo A/C Seater (2+2)",
    busCategory: "volvo",
    departureTime: "23:30",
    arrivalTime: "04:00",
    duration: "4h 30m",
    availableSeats: 24,
    fare: 650,
    rating: 4.2,
    boardingPoints: [
      { id: "bp-1", name: "Mumbai Central ST Depot", time: "23:30" },
      { id: "bp-2", name: "Andheri East", time: "23:50" },
    ],
    droppingPoints: [
      { id: "dp-1", name: "Pune Swargate", time: "04:00" },
      { id: "dp-2", name: "Pune Katraj", time: "04:15" },
    ],
  },
  {
    id: "bus-003",
    operatorName: "MSRTC Shivneri",
    busType: "A/C Seater (2+2)",
    busCategory: "ac",
    departureTime: "06:00",
    arrivalTime: "10:30",
    duration: "4h 30m",
    availableSeats: 8,
    fare: 450,
    rating: 4.0,
    boardingPoints: [
      { id: "bp-1", name: "Mumbai Dadar ST", time: "06:00" },
    ],
    droppingPoints: [
      { id: "dp-1", name: "Pune Swargate ST", time: "10:30" },
    ],
  },
  {
    id: "bus-004",
    operatorName: "Paulo Travels",
    busType: "Volvo A/C Sleeper (2+1)",
    busCategory: "sleeper",
    departureTime: "21:00",
    arrivalTime: "01:00",
    duration: "4h 00m",
    availableSeats: 6,
    fare: 900,
    rating: 4.6,
    boardingPoints: [
      { id: "bp-1", name: "Borivali Station East", time: "21:00" },
      { id: "bp-2", name: "Andheri Kurla Road", time: "21:20" },
    ],
    droppingPoints: [
      { id: "dp-1", name: "Pune Shivajinagar", time: "01:00" },
    ],
  },
  {
    id: "bus-005",
    operatorName: "RedBus Express",
    busType: "Non A/C Seater (2+3)",
    busCategory: "seater",
    departureTime: "05:00",
    arrivalTime: "10:00",
    duration: "5h 00m",
    availableSeats: 30,
    fare: 300,
    rating: 3.8,
    boardingPoints: [
      { id: "bp-1", name: "Mumbai LTT", time: "05:00" },
    ],
    droppingPoints: [
      { id: "dp-1", name: "Pune Laxmi Road", time: "10:00" },
    ],
  },
];

export function generateSeats(busCategory: string): SeatInfo[] {
  const seats: SeatInfo[] = [];
  const rows = busCategory === "sleeper" ? 8 : 10;
  const cols = busCategory === "sleeper" ? ["L", "M", "R"] : ["A", "B", "C", "D"];

  for (let row = 1; row <= rows; row++) {
    for (const col of cols) {
      const seatNumber = `${row}${col}`;
      const isBooked = Math.random() < 0.3;
      const isLadies = !isBooked && Math.random() < 0.1;
      const position =
        col === "A" || col === "L"
          ? "window"
          : col === "D" || col === "R"
          ? "aisle"
          : "middle";

      seats.push({
        number: seatNumber,
        position,
        deck: row <= 4 ? "upper" : "lower",
        type: busCategory === "sleeper" ? "sleeper" : "seater",
        status: isLadies ? "ladies" : isBooked ? "booked" : "available",
        fare: busCategory === "sleeper" ? 800 : busCategory === "volvo" ? 650 : 450,
      });
    }
  }

  return seats;
}

export const mockSearchResults = (from: string, to: string): BusResult[] => {
  return mockBuses.filter(() => Math.random() > 0.2);
};

export const mockBookingConfirm = () => ({
  pnr: `ZP_BUS_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
  status: "CONFIRMED",
  ticketUrl: "https://example.com/ticket",
});
