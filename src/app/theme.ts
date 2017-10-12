const common = {
  fontFamily: "\"Neue Helvetica\", Helvetica, Verdana, sans-serif",
  fontSize: 16,
};

const light = {
  ...common,
  foreground: "#333333",
  background: "#f1f1f1"
};

const dark = {
  ...common,
  foreground: "#f1f1f1",
  background: "#333333"
};

export enum Shade {
  Light,
  Dark
};

export interface Theme {
  fontFamily: string;
  fontSize: number;
  foreground: string;
  background: string;
}

export const getTheme = (shade: Shade): Theme => {
  switch (shade) {
    case Shade.Light:
      return light;
    case Shade.Dark:
      return dark;
    default:
      throw new TypeError("Unknown Shade");
  }
}
