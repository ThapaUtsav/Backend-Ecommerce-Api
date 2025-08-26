//Entry point this entry point regarded as the main index point
import "reflect-metadata";
import app from "./server.js";
import { ENV } from "const/env.js";
import { AppDataSource } from "config/.ormconfig.js";
//PORT called from the .env dai le milako const ma xa condition if u want
const PORT = ENV.PORT;
//initialize the migration here
AppDataSource.initialize()
  .then(async () => {
    await AppDataSource.runMigrations();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`For Swagger_UI on port http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => console.log(error));

//To run migartion
//tsc
//npx ts-node ./node_modules/typeorm/cli.js migration:run -d src/config/.ormconfig.ts
