export interface City {
  name: string;
  code: string;
  state: string;
}

export const cities: City[] = [
  { name: "Mumbai", code: "MUM", state: "Maharashtra" },
  { name: "Pune", code: "PUN", state: "Maharashtra" },
  { name: "Delhi", code: "DEL", state: "Delhi" },
  { name: "Bangalore", code: "BLR", state: "Karnataka" },
  { name: "Chennai", code: "CHN", state: "Tamil Nadu" },
  { name: "Hyderabad", code: "HYD", state: "Telangana" },
  { name: "Kolkata", code: "KOL", state: "West Bengal" },
  { name: "Ahmedabad", code: "AMD", state: "Gujarat" },
  { name: "Jaipur", code: "JAI", state: "Rajasthan" },
  { name: "Lucknow", code: "LKO", state: "Uttar Pradesh" },
  { name: "Kochi", code: "KOC", state: "Kerala" },
  { name: "Goa", code: "GOA", state: "Goa" },
  { name: "Nagpur", code: "NGP", state: "Maharashtra" },
  { name: "Indore", code: "IND", state: "Madhya Pradesh" },
  { name: "Bhopal", code: "BPL", state: "Madhya Pradesh" },
  { name: "Patna", code: "PAT", state: "Bihar" },
  { name: "Chandigarh", code: "CHD", state: "Chandigarh" },
  { name: "Coimbatore", code: "CBE", state: "Tamil Nadu" },
  { name: "Visakhapatnam", code: "VSKP", state: "Andhra Pradesh" },
  { name: "Surat", code: "STV", state: "Gujarat" },
  { name: "Nashik", code: "NSK", state: "Maharashtra" },
  { name: "Aurangabad", code: "AUR", state: "Maharashtra" },
  { name: "Thane", code: "THN", state: "Maharashtra" },
  { name: "Navi Mumbai", code: "NVM", state: "Maharashtra" },
  { name: "Mysore", code: "MYS", state: "Karnataka" },
  { name: "Manipal", code: "MANP", state: "Karnataka" },
  { name: "Udaipur", code: "UDR", state: "Rajasthan" },
  { name: "Jodhpur", code: "JDH", state: "Rajasthan" },
  { name: "Varanasi", code: "VNS", state: "Uttar Pradesh" },
  { name: "Agra", code: "AGA", state: "Uttar Pradesh" },
  { name: "Dehradun", code: "DED", state: "Uttarakhand" },
  { name: "Shimla", code: "SML", state: "Himachal Pradesh" },
  { name: "Manali", code: "MNL", state: "Himachal Pradesh" },
  { name: "Rishikesh", code: "RSH", state: "Uttarakhand" },
  { name: "Pondicherry", code: "PNY", state: "Puducherry" },
  { name: "Trivandrum", code: "TVM", state: "Kerala" },
  { name: "Calicut", code: "CLT", state: "Kerala" },
  { name: "Mangalore", code: "MNG", state: "Karnataka" },
  { name: "Hubli", code: "HBL", state: "Karnataka" },
  { name: "Belgaum", code: "BGM", state: "Karnataka" },
];

export function searchCities(query: string): City[] {
  if (!query || query.length < 1) return [];
  const lower = query.toLowerCase();
  return cities
    .filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.code.toLowerCase().includes(lower) ||
        c.state.toLowerCase().includes(lower)
    )
    .slice(0, 8);
}

export function getCityByCode(code: string): City | undefined {
  return cities.find((c) => c.code === code);
}
