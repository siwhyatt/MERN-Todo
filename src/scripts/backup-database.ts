// src/scripts/backup-database.ts
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// Disable eslint warnings for this script
/* eslint-disable no-console */

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

interface BackupOptions {
  mongoUri: string;
  dbName: string;
  backupDir: string;
  maxBackups: number;
}

class DatabaseBackup {
  private options: BackupOptions;

  constructor(options: BackupOptions) {
    this.options = options;
  }

  async createBackup(): Promise<void> {
    try {
      console.log("💾 Starting database backup...");
      console.log(`📦 Database: ${this.options.dbName}`);
      console.log(`📁 Backup directory: ${this.options.backupDir}`);

      // Ensure backup directory exists
      await this.ensureBackupDirectory();

      // Create timestamped backup folder
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(
        this.options.backupDir,
        `backup-${timestamp}`,
      );

      console.log(`🔄 Creating backup at: ${backupPath}`);

      // Build mongodump command
      const mongodumpCmd = this.buildMongodumpCommand(backupPath);

      console.log("⏳ Running mongodump...");

      // Execute mongodump
      const { stderr } = await execAsync(mongodumpCmd);

      if (stderr && !stderr.includes("writing")) {
        console.warn("⚠️  mongodump warnings:", stderr);
      }

      console.log("✅ Backup created successfully!");

      // Get backup size
      const backupSize = await this.getDirectorySize(backupPath);
      console.log(`📊 Backup size: ${this.formatBytes(backupSize)}`);

      // Clean up old backups
      await this.cleanupOldBackups();

      console.log("🎉 Backup completed successfully!");
    } catch (error) {
      console.error("❌ Backup failed:", error);
      throw error;
    }
  }

  private async ensureBackupDirectory(): Promise<void> {
    if (!fs.existsSync(this.options.backupDir)) {
      console.log(`📁 Creating backup directory: ${this.options.backupDir}`);
      fs.mkdirSync(this.options.backupDir, { recursive: true });
    }
  }

  private buildMongodumpCommand(backupPath: string): string {
    let cmd = `mongodump --uri="${this.options.mongoUri}"`;
    cmd += ` --db ${this.options.dbName}`;
    cmd += ` --out "${backupPath}"`;
    cmd += ` --gzip`;

    return cmd;
  }

  private async cleanupOldBackups(): Promise<void> {
    console.log("🧹 Cleaning up old backups...");

    // Get all backup directories
    const backupDirs = fs
      .readdirSync(this.options.backupDir)
      .filter((file) => {
        const fullPath = path.join(this.options.backupDir, file);
        return (
          fs.statSync(fullPath).isDirectory() && file.startsWith("backup-")
        );
      })
      .map((file) => ({
        name: file,
        path: path.join(this.options.backupDir, file),
        time: fs
          .statSync(path.join(this.options.backupDir, file))
          .mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time); // Sort by newest first

    console.log(`📋 Found ${backupDirs.length} backup(s)`);

    // Keep only the most recent maxBackups
    const backupsToDelete = backupDirs.slice(this.options.maxBackups);

    if (backupsToDelete.length === 0) {
      console.log("✨ No old backups to delete");
      return;
    }

    console.log(`🗑️  Deleting ${backupsToDelete.length} old backup(s)...`);

    for (const backup of backupsToDelete) {
      console.log(`   Removing: ${backup.name}`);
      await this.deleteDirectory(backup.path);
    }

    console.log("✅ Cleanup completed");
  }

  private async deleteDirectory(dirPath: string): Promise<void> {
    await execAsync(`rm -rf "${dirPath}"`);
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const { stdout } = await execAsync(`du -sb "${dirPath}" | cut -f1`);
      return parseInt(stdout.trim(), 10);
    } catch (error) {
      return 0;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Runs a backup using options derived from environment variables.
// Exported so the in-process cron job can call it directly, without
// spawning a `ts-node`/`node` subprocess (which requires devDependencies
// to be present and the script path to resolve correctly at runtime).
//
// Uses MONGO_URI (not MONGODB_URI) to match this app's existing env var
// naming - see server.ts and sync-database.ts.
async function runDatabaseBackup(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI environment variable is required. Make sure your .env file contains: MONGO_URI=mongodb://user:pass@host:port/dbname",
    );
  }

  // Get database name from URI or environment variable
  const dbNameMatch = mongoUri.match(/\/([^/?]+)(\?|$)/);
  const dbName =
    process.env.MONGO_DB_NAME ||
    (dbNameMatch ? dbNameMatch[1] : "todoapi_database");

  // Backup directory - default to project root /backups folder
  const backupDir =
    process.env.MONGODB_BACKUP_DIR || path.join(process.cwd(), "backups");

  // Maximum number of backups to keep
  const maxBackups = parseInt(process.env.MONGODB_BACKUP_RETENTION || "2", 10);

  const options: BackupOptions = {
    mongoUri,
    dbName,
    backupDir,
    maxBackups,
  };

  console.log("🚀 MongoDB Backup Utility");
  console.log("=========================");
  console.log(`📦 Database: ${dbName}`);
  console.log(`📁 Backup Directory: ${backupDir}`);
  console.log(`🔢 Retention: Keep ${maxBackups} most recent backup(s)`);
  console.log("=========================\n");

  const backup = new DatabaseBackup(options);
  await backup.createBackup();
}

// Run the script if called directly (e.g. via `ts-node src/scripts/backup-database.ts`)
if (require.main === module) {
  runDatabaseBackup().catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
}

export { DatabaseBackup, runDatabaseBackup };
