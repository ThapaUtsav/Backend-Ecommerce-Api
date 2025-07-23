//Entry point this entry point regarded as the main index point
import "reflect-metadata";
import app from "./index.js";
import { ENV } from "const/env.js";
import logger from "utils/logger.js";

//PORT called from the .env dai le milako const ma xa condition if u want
const PORT = ENV.PORT;

//console output for which server it might be running at
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
