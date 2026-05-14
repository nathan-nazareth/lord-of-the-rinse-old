export enum SoapShape {
  SQUARE = "Square",
  CIRCLE = "Circle",
  HEART = "Heart",
  OVAL_FLAT = "Oval Flat",
  OVAL_DIP = "Oval with Dip",
}

export enum SoapScent {
  LAVENDER = "Lavender",
  CITRONELLA = "Citronella",
  COCONUT = "Coconut",
}

export interface SoapOption {
  scent: SoapScent;
  price: number;
}

export const SOAP_OPTIONS: SoapOption[] = [
  { scent: SoapScent.LAVENDER, price: 110 },
  { scent: SoapScent.COCONUT, price: 100 },
  { scent: SoapScent.CITRONELLA, price: 100 },
];

export const SHAPE_OPTIONS = [
  { label: "Square", value: SoapShape.SQUARE },
  { label: "Circle", value: SoapShape.CIRCLE },
  { label: "Heart", value: SoapShape.HEART },
  { label: "Oval Flat", value: SoapShape.OVAL_FLAT },
  { label: "Oval with Dip", value: SoapShape.OVAL_DIP },
];

export const DEFAULT_SIZE = 100;
export const MAX_SIZE = 100;
export const BASE_SIZE = 100;
export const LAVENDER_PIECES_PRICE = 5;

export enum SoapColor {
  WHITE = "White",
  YELLOW = "Yellow",
  PINK = "Pink",
  GREEN = "Green",
}

export interface OrderItem {
  id: string;
  shape: SoapShape;
  scent: SoapScent;
  color: SoapColor;
  quantity: string;
  size: number;
  hasLavenderPieces: boolean;
  hasRosePieces: boolean;
  price: number;
}

export interface OrderFormState {
  shape: SoapShape | null;
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
