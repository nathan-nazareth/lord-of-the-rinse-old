export enum SoapScent {
  LAVENDER = 'Lavender',
  COFFEE = 'Coffee',
  CLOVE = 'Clove',
  CINNAMON = 'Cinnamon',
  LEMONGRASS = 'Lemongrass',
  ALOE_VERA = 'Aloe Vera',
  COCONUT = 'Coconut',
  TURMERIC = 'Turmeric',
  HONEY = 'Honey'
}

export interface SoapOption {
  scent: SoapScent;
  price: number;
}

export const SOAP_OPTIONS: SoapOption[] = [
  { scent: SoapScent.LAVENDER, price: 30 },
  { scent: SoapScent.ALOE_VERA, price: 28 },
  { scent: SoapScent.COCONUT, price: 25 },
  { scent: SoapScent.COFFEE, price: 28 },
  { scent: SoapScent.CLOVE, price: 30 },
  { scent: SoapScent.CINNAMON, price: 29 },
  { scent: SoapScent.LEMONGRASS, price: 30 },
  { scent: SoapScent.TURMERIC, price: 27 },
  { scent: SoapScent.HONEY, price: 30 }
];

export enum SoapColor {
  WHITE = 'White',
  RED = 'Red',
  ORANGE = 'Orange',
  YELLOW = 'Yellow',
  GREEN = 'Green',
  BLUE = 'Blue',
  PURPLE = 'Purple'
}

export interface OrderItem {
  id: string;
  scent: SoapScent;
  color: SoapColor;
  quantity: string;
}

export interface OrderFormState {
  scent: SoapScent | null;
  color: SoapColor | null;
  quantity: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}
