#!/usr/bin/env node

/**
 * Billing Data Migration Script
 *
 * This script migrates billing data from the old schema (venues table)
 * to the new schema (accounts table).
 *
 * Old schema: venues.is_paid, venues.trial_ends_at
 * New schema: accounts.is_paid, accounts.trial_ends_at
 *
 * Run with: node scripts/migrate-billing-data.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeDatabaseState() {
  console.log('📊 Analyzing database state...\n');

  // Check for venues with billing data (old schema)
  const { data: oldSchemaVenues, error: venuesError } = await supabase
    .from('venues')
    .select('id, name, email, account_id')
    .order('created_at', { ascending: true });

  if (venuesError) {
    console.error('❌ Error fetching venues:', venuesError);
    return null;
  }

  // Check existing accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, trial_ends_at, is_paid, stripe_customer_id')
    .order('created_at', { ascending: true });

  if (accountsError) {
    console.error('❌ Error fetching accounts:', accountsError);
    return null;
  }

  // Check existing users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, account_id, role')
    .order('created_at', { ascending: true });

  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
    return null;
  }

  // Check auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return null;
  }

  console.log(`📍 Current State:`);
  console.log(`   Venues: ${oldSchemaVenues.length}`);
  console.log(`   Accounts: ${accounts.length}`);
  console.log(`   Users (table): ${users.length}`);
  console.log(`   Auth Users: ${authUsers.users.length}\n`);

  return {
    venues: oldSchemaVenues,
    accounts,
    users,
    authUsers: authUsers.users
  };
}

async function migrateVenue(venue, authUsers, existingUsers, existingAccounts) {
  console.log(`\n🔄 Processing venue: ${venue.name} (${venue.email})`);

  // Find corresponding auth user by email
  const authUser = authUsers.find(u => u.email === venue.email);

  if (!authUser) {
    console.log(`   ⚠️  No auth user found for ${venue.email} - skipping`);
    return { success: false, reason: 'no_auth_user' };
  }

  // Check if user record exists
  let userRecord = existingUsers.find(u => u.id === authUser.id);

  // Check if account exists for this venue
  let accountRecord = venue.account_id
    ? existingAccounts.find(a => a.id === venue.account_id)
    : null;

  // If account exists and has billing data, no migration needed
  if (accountRecord && (accountRecord.is_paid !== null || accountRecord.trial_ends_at !== null)) {
    console.log(`   ✅ Account already has billing data - no migration needed`);
    return { success: true, reason: 'already_migrated' };
  }

  // If venue has account_id but no account record, there's an orphan reference
  if (venue.account_id && !accountRecord) {
    console.log(`   ⚠️  Venue has account_id but account doesn't exist - creating new account`);
  }

  // Create new account if needed
  if (!accountRecord) {
    console.log(`   ➕ Creating new account...`);

    const { data: newAccount, error: accountError } = await supabase
      .from('accounts')
      .insert([{
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
        is_paid: false,
        stripe_customer_id: null,
        stripe_subscription_id: null
      }])
      .select()
      .single();

    if (accountError) {
      console.error(`   ❌ Failed to create account:`, accountError);
      return { success: false, reason: 'account_creation_failed', error: accountError };
    }

    accountRecord = newAccount;
    console.log(`   ✅ Account created: ${accountRecord.id}`);
  }

  // Update venue to link to account
  if (venue.account_id !== accountRecord.id) {
    console.log(`   🔗 Linking venue to account...`);

    const { error: venueLinkError } = await supabase
      .from('venues')
      .update({ account_id: accountRecord.id })
      .eq('id', venue.id);

    if (venueLinkError) {
      console.error(`   ❌ Failed to link venue to account:`, venueLinkError);
      return { success: false, reason: 'venue_link_failed', error: venueLinkError };
    }

    console.log(`   ✅ Venue linked to account`);
  }

  // Create or update user record
  if (!userRecord) {
    console.log(`   ➕ Creating user record...`);

    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authUser.id,
        email: authUser.email,
        role: 'master',
        account_id: accountRecord.id
      }]);

    if (userError) {
      console.error(`   ❌ Failed to create user record:`, userError);
      return { success: false, reason: 'user_creation_failed', error: userError };
    }

    console.log(`   ✅ User record created`);
  } else if (userRecord.account_id !== accountRecord.id) {
    console.log(`   🔗 Linking user to account...`);

    const { error: userLinkError } = await supabase
      .from('users')
      .update({ account_id: accountRecord.id })
      .eq('id', authUser.id);

    if (userLinkError) {
      console.error(`   ❌ Failed to link user to account:`, userLinkError);
      return { success: false, reason: 'user_link_failed', error: userLinkError };
    }

    console.log(`   ✅ User linked to account`);
  }

  console.log(`   ✅ Migration complete for ${venue.name}`);
  return { success: true, reason: 'migrated', accountId: accountRecord.id };
}

async function runMigration(dryRun = true) {
  console.log('🚀 Starting Billing Data Migration');
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will modify database)'}\n`);

  if (!dryRun) {
    console.log('⚠️  WARNING: This will modify your production database!');
    console.log('⚠️  Make sure you have a backup before proceeding.\n');
  }

  const state = await analyzeDatabaseState();
  if (!state) {
    console.error('❌ Failed to analyze database state');
    process.exit(1);
  }

  const { venues, accounts, users, authUsers } = state;

  if (dryRun) {
    console.log('\n📋 DRY RUN - Analyzing what would be migrated:\n');
  } else {
    console.log('\n🔨 LIVE RUN - Migrating data:\n');
  }

  const results = {
    total: venues.length,
    migrated: 0,
    alreadyMigrated: 0,
    noAuthUser: 0,
    failed: 0,
    errors: []
  };

  for (const venue of venues) {
    if (dryRun) {
      // In dry run, just check what would happen
      const authUser = authUsers.find(u => u.email === venue.email);
      if (!authUser) {
        console.log(`❌ ${venue.name} (${venue.email}) - No auth user`);
        results.noAuthUser++;
      } else {
        const userRecord = users.find(u => u.id === authUser.id);
        const accountRecord = venue.account_id
          ? accounts.find(a => a.id === venue.account_id)
          : null;

        if (accountRecord && (accountRecord.is_paid !== null || accountRecord.trial_ends_at !== null)) {
          console.log(`✅ ${venue.name} - Already has account with billing data`);
          results.alreadyMigrated++;
        } else {
          console.log(`🔄 ${venue.name} - Would create/link account, user record`);
          results.migrated++;
        }
      }
    } else {
      // Live run - actually perform migration
      const result = await migrateVenue(venue, authUsers, users, accounts);

      if (result.success) {
        if (result.reason === 'already_migrated') {
          results.alreadyMigrated++;
        } else {
          results.migrated++;
        }
      } else {
        if (result.reason === 'no_auth_user') {
          results.noAuthUser++;
        } else {
          results.failed++;
          results.errors.push({ venue: venue.name, error: result });
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(60));
  console.log(`Total venues: ${results.total}`);
  console.log(`${dryRun ? 'Would migrate' : 'Migrated'}: ${results.migrated}`);
  console.log(`Already migrated: ${results.alreadyMigrated}`);
  console.log(`No auth user: ${results.noAuthUser}`);
  console.log(`Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(e => {
      console.log(`   - ${e.venue}: ${e.error.reason}`);
    });
  }

  if (dryRun) {
    console.log('\n✅ Dry run complete. Run with --live to apply changes.');
  } else {
    console.log('\n✅ Migration complete!');
  }
}

// Main execution
const isLive = process.argv.includes('--live');
runMigration(!isLive)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
