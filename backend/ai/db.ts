import { SQLDatabase } from "encore.dev/storage/sqldb";

export const aiDB = SQLDatabase.named("postgres");
