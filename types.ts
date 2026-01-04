export enum SoapScent {
  LAVENDER = 'Lavender',
  COFFEE = 'Coffee',
  CLOVE = 'Clove',
  CINNAMON = 'Cinnamon',
  LEMONGRASS = 'Lemongrass',
  ALOE_VERA = 'Aloe Vera',
  COCONUT = 'Coconut',
  TURMERIC = 'Turmeric',
  CUSTOM = 'Custom'
}

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
  customScent: string;
  color: SoapColor;
  quantity: string;
}

export interface OrderFormState {
  scent: SoapScent | null;
  customScent: string;
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
