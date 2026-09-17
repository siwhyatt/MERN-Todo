// src/cron/index.ts
import { initDatabaseBackup } from "./database-backup";

export const initializeCronJobs = () => {
  console.log("Initializing cron jobs...");
  initDatabaseBackup();
};
