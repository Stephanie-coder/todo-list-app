import { SQLDatabase } from "encore.dev/storage/sqldb";

export const todoDB = SQLDatabase.named("postgres");
