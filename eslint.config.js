import globals from "globals"; 
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: ["src/public/**"], // התעלמות מכל הקבצים בתיקיית src/public
    languageOptions: {
      globals: globals.browser, // הגדרת משתנים גלובליים של סביבת הדפדפן
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      indent: ["error", 2], // שימוש ב-2 רווחים לאינדנטציה
      quotes: ["error", "single"], // שימוש במרכאות בודדות למחרוזות
      semi: ["error", "always"], // דרישה לנקודה-פסיק בסוף כל משפט
    },
  },
];
