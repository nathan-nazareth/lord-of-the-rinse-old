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
  { scent: SoapScent.LAVENDER, price: 110 },
  { scent: SoapScent.ALOE_VERA, price: 100 },
  { scent: SoapScent.COCONUT, price: 100 },
  { scent: SoapScent.COFFEE, price: 100 },
  { scent: SoapScent.CLOVE, price: 100 },
  { scent: SoapScent.CINNAMON, price: 100 },
  { scent: SoapScent.LEMONGRASS, price: 100 },
  { scent: SoapScent.TURMERIC, price: 100 },
  { scent: SoapScent.HONEY, price: 110 }
];

export const DEFAULT_SIZE = 100;
export const MAX_SIZE = 100;
export const BASE_SIZE = 100;
export const LAVENDER_PIECES_PRICE = 5;

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
  size: number;
  hasLavenderPieces: boolean;
}

export interface OrderFormState {
  scent: SoapScent | null;
  color: SoapColor | null;
  quantity: string;
  size: number;
  hasLavenderPieces: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}
