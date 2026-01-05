require('dotenv').config();

if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL FOUND");
} else {
    console.log("DATABASE_URL NOT FOUND");
}
