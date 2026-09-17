// src/cron/database-backup.ts
import cron from 'node-cron';
import { runDatabaseBackup } from '../scripts/backup-database';

export const initDatabaseBackup = () => {
    // Run every Sunday at 2:00 AM
    // Cron format: minute hour day-of-month month day-of-week
    // 0 2 * * 0 = At 02:00 on Sunday
    cron.schedule('0 2 * * 0', async () => {
        console.log('🕐 Starting scheduled database backup...');

        try {
            await runDatabaseBackup();
            console.log('✅ Scheduled backup completed successfully');
        } catch (error) {
            console.error('❌ Scheduled backup failed:', error);
        }
    });

    console.log('📅 Database backup scheduled: Every Sunday at 2:00 AM');
};
