var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//Entry point this entry point regarded as the main index point
import "reflect-metadata";
import app from "./server.js";
import { ENV } from "const/env.js";
import { AppDataSource } from "config/.ormconfig.js";
//PORT called from the .env dai le milako const ma xa condition if u want
const PORT = ENV.PORT;
//initialize the migration here
AppDataSource.initialize()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield AppDataSource.runMigrations();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`For Swagger_UI on port http://localhost:${PORT}/api-docs`);
    });
}))
    .catch((error) => console.log(error));
