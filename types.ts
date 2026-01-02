export enum SoapScent {
  LAVENDER = 'Lavender',
  COFFEE = 'Coffee',
  CLOVE = 'Clove',
  CINNAMON = 'Cinnamon',
  LEMONGRASS = 'Lemongrass',
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

export interface OrderFormState {
  scent: SoapScent | null;
  customScent: string;
  color: SoapColor | null;
  quantity: string;
  contactInfo: string;
}
