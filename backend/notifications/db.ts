import { SQLDatabase } from "encore.dev/storage/sqldb";

export const notificationsDB = SQLDatabase.named("postgres");
