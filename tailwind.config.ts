import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Lato", "var(--font-sans)", ...fontFamily.sans],
        kai: ["var(--font-kai)", "Lato", ...fontFamily.serif],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")
  ],
} satisfies Config;
