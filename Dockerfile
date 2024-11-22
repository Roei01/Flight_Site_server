# השתמש בתמונה רשמית של Node.js
FROM node:20

# הגדרת ספריית העבודה
WORKDIR /app

# העתקת קבצים הקשורים לתלויות
COPY package*.json ./

# התקנת התלויות
RUN npm install

# העתקת שאר הקבצים
COPY . .

# פתיחת הפורט שבו השרת ירוץ
EXPOSE 3000

# פקודת ההרצה
CMD ["npm", "start"]
