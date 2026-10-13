import {
  Bebas_Neue,
  Cormorant_Garamond,
  DM_Serif_Display,
  Fraunces,
  Inter,
  Manrope,
  Montserrat,
  Outfit,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
  Syne,
} from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--f-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--f-playfair", preload: false });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--f-cormorant", preload: false });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--f-montserrat", preload: false });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--f-space", preload: false });
const outfit = Outfit({ subsets: ["latin"], variable: "--f-outfit", preload: false });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--f-poppins", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--f-fraunces", preload: false });
const manrope = Manrope({ subsets: ["latin"], variable: "--f-manrope", preload: false });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--f-bebas", preload: false });
const dmserif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--f-dmserif", preload: false });
const syne = Syne({ subsets: ["latin"], variable: "--f-syne", preload: false });

export const fontVariables = [
  inter, playfair, cormorant, montserrat, space, outfit, poppins, fraunces, manrope, bebas, dmserif, syne,
]
  .map((f) => f.variable)
  .join(" ");
