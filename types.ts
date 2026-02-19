export enum SoapScent {
  LAVENDER = 'Lavender',
  LEMONGRASS = 'Lemongrass',
  COCONUT = 'Coconut'
}

export interface SoapOption {
  scent: SoapScent;
  price: number;
}

export const SOAP_OPTIONS: SoapOption[] = [
  { scent: SoapScent.LAVENDER, price: 110 },
  { scent: SoapScent.COCONUT, price: 100 },
  { scent: SoapScent.LEMONGRASS, price: 100 }
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
