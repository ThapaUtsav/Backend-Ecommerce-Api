//Entry point this entry point regarded as the main index point
import "reflect-metadata";
import app from "./server.js";
import { ENV } from "const/env.js";
//PORT called from the .env dai le milako const ma xa condition if u want
const PORT = ENV.PORT;
//console output for which server it might be running at
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`For Swagger_UI on port http://localhost:${PORT}/api-docs`);
});
