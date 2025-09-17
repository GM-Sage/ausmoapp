// Data Migration Utility
// Use this script to migrate data from SQLite to Supabase

import { SupabaseDatabaseService } from '../src/services/supabaseDatabaseService';
import { DatabaseService } from '../src/services/databaseService';

async function migrateDataToSupabase() {
  console.log('Starting data migration from SQLite to Supabase...');

  try {
    // Initialize both services
    console.log('Initializing database services...');
    await DatabaseService.initialize(); // SQLite
    await SupabaseDatabaseService.initialize(); // Supabase

    // Create backup from SQLite
    console.log('Creating backup from SQLite...');
    const backupData = await DatabaseService.createBackup();
    console.log(`✓ Backup created with ${backupData.users.length} users, ${backupData.books.length} books, ${backupData.messages.length} messages, ${backupData.symbols.length} symbols`);

    // Restore to Supabase
    console.log('Restoring data to Supabase...');
    await SupabaseDatabaseService.restoreBackup(backupData);
    console.log('✓ Data successfully migrated to Supabase');

    // Verify migration
    console.log('Verifying migration...');
    const supabaseUsers = await SupabaseDatabaseService.getAllUsers();
    const supabaseBooks = [];
    for (const user of supabaseUsers) {
      const userBooks = await SupabaseDatabaseService.getBooksByUser(user.id);
      supabaseBooks.push(...userBooks);
    }

    console.log(`✓ Verification complete: ${supabaseUsers.length} users, ${supabaseBooks.length} books migrated`);

    // Close SQLite connection
    await DatabaseService.close();
    console.log('✓ Migration completed successfully!');

  } catch (error) {
    console.error('✗ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDataToSupabase().catch(console.error);
}

export default migrateDataToSupabase;
