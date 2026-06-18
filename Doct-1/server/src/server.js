import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.locals.dbAvailable = true;
  })
  .catch((error) => {
    app.locals.dbAvailable = false;
    console.warn(`MongoDB unavailable: ${error.message}`);
    console.warn("Starting API in demo browsing mode.");
  })
  .finally(() => {
    app.listen(port, () => console.log(`API running on port ${port}`));
  });
