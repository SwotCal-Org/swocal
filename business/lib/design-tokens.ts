// Mirrors mobile/constants/theme.ts. Source of truth for the customer app is there;
// this is the web port. Hex values must stay identical so the two surfaces feel
// like one brand.

export const Swo = {
  mustard: '#F2B23A',
  mustardDeep: '#C98F1C',
  mustardSoft: '#FBE5A6',

  coral: '#E36A4D',
  coralDeep: '#C04A30',
  coralSoft: '#F7CFC0',

  mint: '#8DB36B',
  mintDeep: '#5F8842',
  mintSoft: '#E1EBC9',

  plum: '#A14E5E',
  plumSoft: '#F1D7DA',

  sky: '#6E9C9B',
  skySoft: '#D9E5E2',

  cream: '#FBF5EA',
  creamDeep: '#F2E9D6',
  paper: '#FFFEFB',
  shell: '#F7ECD9',

  ink: '#2A1F1A',
  ink2: '#5C4A3F',
  ink3: '#8B7969',
  ink4: '#C9B9A6',

  danger: '#B94A35',
  borderSoft: '#E8DCC6',
} as const;

export const CATEGORIES = [
  { value: 'cafe', label: 'Café' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'bar', label: 'Bar' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' },
] as const;

export const DAYS = [
  { value: 1, short: 'Mon', long: 'Monday', key: 'mon' },
  { value: 2, short: 'Tue', long: 'Tuesday', key: 'tue' },
  { value: 3, short: 'Wed', long: 'Wednesday', key: 'wed' },
  { value: 4, short: 'Thu', long: 'Thursday', key: 'thu' },
  { value: 5, short: 'Fri', long: 'Friday', key: 'fri' },
  { value: 6, short: 'Sat', long: 'Saturday', key: 'sat' },
  { value: 0, short: 'Sun', long: 'Sunday', key: 'sun' },
] as const;
