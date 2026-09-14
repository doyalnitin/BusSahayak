export const A11y = {
  minTouchTarget: 48,
  fontScale: {
    small: 0.85,
    normal: 1.0,
    large: 1.15,
    xlarge: 1.3,
    maxCapped: 2.143,
  },
  contrast: {
    normalText: 4.5,
    largeText: 3.0,
    uiComponents: 3.0,
    enhanced: 7.0,
  },
  announcementDelay: {
    ios: 800,
    android: 0,
  },
  timeout: {
    processing: 2000,
    longProcessing: 5000,
  },
};

export type StepLabel =
  | "Search Buses"
  | "Select Bus"
  | "Choose Seat"
  | "Enter Details"
  | "Confirm Booking";

export const StepLabels: StepLabel[] = [
  "Search Buses",
  "Select Bus",
  "Choose Seat",
  "Enter Details",
  "Confirm Booking",
];

export const VoiceCommands = {
  search: ["search", "find buses", "look for buses"],
  book: ["book", "reserve", "confirm"],
  next: ["next", "more", "next bus", "more options"],
  back: ["back", "go back", "previous"],
  confirm: ["confirm", "yes", "okay", "proceed"],
  cancel: ["cancel", "stop", "no"],
  read: ["read", "read again", "tell me"],
};
