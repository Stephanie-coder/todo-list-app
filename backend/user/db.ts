import { SQLDatabase } from "encore.dev/storage/sqldb";

export const userDB = SQLDatabase.named("postgres");
