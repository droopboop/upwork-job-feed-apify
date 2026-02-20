import { config as loadDotEnv } from "dotenv";

// Local convenience for development. On Apify platform use environment variables.
loadDotEnv({
    path: process.env.PRIVATE_ENV_FILE || ".env",
    override: false
});
