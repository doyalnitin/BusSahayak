import { create } from "zustand";

export interface Passenger {
  name: string;
  age: number;
  gender: "M" | "F" | "O";
}

export interface BusResult {
  id: string;
  operatorName: string;
  busType: string;
  busCategory: "ac" | "sleeper" | "seater" | "volvo";
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableSeats: number;
  fare: number;
  rating: number;
  boardingPoints: { id: string; name: string; time: string }[];
  droppingPoints: { id: string; name: string; time: string }[];
}

export interface SeatInfo {
  number: string;
  position: "window" | "aisle" | "middle";
  deck: "upper" | "lower";
  type: "sleeper" | "seater";
  status: "available" | "booked" | "ladies";
  fare: number;
}

export interface BookingState {
  from: string;
  to: string;
  date: string;
  selectedBus: BusResult | null;
  selectedSeats: SeatInfo[];
  passengers: Passenger[];
  mobileNumber: string;
  boardingPoint: string;
  droppingPoint: string;
  currentStep: number;
  pnr: string | null;

  setFrom: (city: string) => void;
  setTo: (city: string) => void;
  setDate: (date: string) => void;
  selectBus: (bus: BusResult) => void;
  toggleSeat: (seat: SeatInfo) => void;
  setPassengers: (passengers: Passenger[]) => void;
  addPassenger: (passenger: Passenger) => void;
  removePassenger: (index: number) => void;
  setMobileNumber: (mobile: string) => void;
  setBoardingPoint: (pointId: string) => void;
  setDroppingPoint: (pointId: string) => void;
  setStep: (step: number) => void;
  setPnr: (pnr: string) => void;
  reset: () => void;
  swapCities: () => void;
}

const initialState = {
  from: "",
  to: "",
  date: new Date().toISOString().split("T")[0],
  selectedBus: null,
  selectedSeats: [],
  passengers: [],
  mobileNumber: "",
  boardingPoint: "",
  droppingPoint: "",
  currentStep: 1,
  pnr: null,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setFrom: (city) => set({ from: city }),
  setTo: (city) => set({ to: city }),
  setDate: (date) => set({ date }),

  selectBus: (bus) =>
    set({
      selectedBus: bus,
      boardingPoint: bus.boardingPoints[0]?.id || "",
      droppingPoint: bus.droppingPoints[0]?.id || "",
      currentStep: 3,
    }),

  toggleSeat: (seat) =>
    set((state) => {
      const exists = state.selectedSeats.find((s) => s.number === seat.number);
      if (exists) {
        return {
          selectedSeats: state.selectedSeats.filter(
            (s) => s.number !== seat.number
          ),
        };
      }
      return {
        selectedSeats: [...state.selectedSeats, seat],
      };
    }),

  setPassengers: (passengers) => set({ passengers }),
  addPassenger: (passenger) =>
    set((state) => ({
      passengers: [...state.passengers, passenger],
    })),
  removePassenger: (index) =>
    set((state) => ({
      passengers: state.passengers.filter((_, i) => i !== index),
    })),

  setMobileNumber: (mobile) => set({ mobileNumber: mobile }),
  setBoardingPoint: (pointId) => set({ boardingPoint: pointId }),
  setDroppingPoint: (pointId) => set({ droppingPoint: pointId }),
  setStep: (step) => set({ currentStep: step }),
  setPnr: (pnr) => set({ pnr }),

  swapCities: () =>
    set((state) => ({
      from: state.to,
      to: state.from,
    })),

  reset: () => set(initialState),
}));
