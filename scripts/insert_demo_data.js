#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Venue IDs from the SQL file
const venues = [
  { id: 'd877bd0b-6522-409f-9192-ca996e1a7f48', name: 'The Lion of Beaconsfield' },
  { id: 'd7683570-11ac-4007-ba95-dcdb4ef6c101', name: 'The Dunn Inn' },
  { id: 'ba9c45d4-3947-4560-9327-7f00c695d177', name: 'The Fox' }
];

// Employees per venue (will be populated after employee insertion)
const employeesByVenue = {};

// Helper function to execute SQL file
async function executeSqlFile(filePath) {
  console.log(`\n📄 Reading SQL file: ${filePath}`);
  const sql = fs.readFileSync(filePath, 'utf-8');

  // Split by semicolons and filter out empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s.length > 5);

  console.log(`   Found ${statements.length} SQL statements`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Skip comments-only statements
    if (statement.split('\n').every(line => line.trim().startsWith('--') || !line.trim())) {
      continue;
    }

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // Try direct execution if RPC fails
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        // Note: Supabase client doesn't support raw SQL execution
        // We'll need to use the REST API or parse the SQL
        console.log(`   ⚠️  Warning: ${error.message}`);
      }
    } catch (err) {
      console.error(`   ❌ Error on statement ${i + 1}:`, err.message);
    }
  }
}

// Generate random date between start and end
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random feedback text
const feedbackTemplates = {
  positive: [
    "Absolutely fantastic experience! The food was delicious and the service was top-notch.",
    "Had a wonderful time here. Great atmosphere and friendly staff.",
    "Excellent meal, everything was perfect. Highly recommend!",
    "Best pub food I've had in ages. Will definitely be back!",
    "Lovely venue, great drinks selection, and the staff were amazing.",
    "Perfect spot for a Sunday roast. Everything was cooked to perfection.",
    "Really enjoyed our visit. The {staff_name} was particularly helpful.",
    "Great value for money and the portions were generous.",
    "Beautiful setting and the food exceeded expectations.",
    "Couldn't fault anything. From start to finish, it was brilliant."
  ],
  neutral: [
    "Nice place, food was good. Service could be a bit faster.",
    "Decent experience overall. Would come back.",
    "Good atmosphere, standard pub fare. Nothing special but nothing bad.",
    "Solid meal, reasonably priced. Busy but that's expected.",
    "Pleasant enough. The food was okay, maybe a bit hit and miss.",
    "Average experience. Food was fine, service was okay.",
    "Not bad for a quick bite. Would prefer more vegetarian options.",
    "Acceptable. Nothing to complain about but nothing remarkable either."
  ],
  negative: [
    "Disappointing experience. Food took ages to arrive and wasn't even hot.",
    "Not impressed. The service was slow and the food was mediocre.",
    "Expected better. The place was dirty and staff seemed disinterested.",
    "Overpriced for what you get. Won't be returning.",
    "Poor experience from start to finish. Very disappointing.",
    "Food was cold when it arrived. Had to send it back.",
    "Waited 45 minutes for our food, then it was wrong order.",
    "Not up to standard. The quality has really gone downhill."
  ]
};

const issueCategories = [
  'Food Quality', 'Service Speed', 'Cleanliness', 'Staff Attitude',
  'Pricing', 'Atmosphere', 'Wait Time', 'Order Accuracy', 'Temperature'
];

const assistanceReasons = [
  'Need extra napkins', 'Request bill', 'Order drinks', 'Ask about menu',
  'Need condiments', 'Table needs cleaning', 'Request water'
];

// Generate comprehensive feedback for a date range
async function generateFeedbackData() {
  console.log('\n🎲 Generating comprehensive feedback data...\n');

  const startDate = new Date('2025-08-09T10:00:00Z');
  const endDate = new Date('2025-10-10T23:59:59Z');

  const allFeedback = [];
  const allAssistance = [];

  // Calculate number of days
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  console.log(`   Generating data for ${daysDiff} days across ${venues.length} venues`);

  for (const venue of venues) {
    console.log(`\n   📍 ${venue.name}`);

    // Get employees for this venue
    const { data: employees, error: employeeError } = await supabase
      .from('employees')
      .select('id, first_name, last_name')
      .eq('venue_id', venue.id);

    if (employeeError) {
      console.error(`   ❌ Error fetching employees:`, employeeError.message);
      continue;
    }

    if (!employees || employees.length === 0) {
      console.log(`   ⚠️  No employees found for ${venue.name}, skipping...`);
      continue;
    }

    employeesByVenue[venue.id] = employees;
    console.log(`   ✓ Found ${employees.length} employees`);

    // Generate feedback for each day
    let currentDate = new Date(startDate);
    let dayCount = 0;

    while (currentDate <= endDate) {
      const responsesPerDay = Math.floor(Math.random() * 26) + 45; // 45-70 responses
      dayCount++;

      for (let i = 0; i < responsesPerDay; i++) {
        // Random time during the day (10am - 11pm)
        const responseTime = new Date(currentDate);
        responseTime.setHours(10 + Math.floor(Math.random() * 13));
        responseTime.setMinutes(Math.floor(Math.random() * 60));
        responseTime.setSeconds(Math.floor(Math.random() * 60));

        // Determine sentiment (70% positive, 20% neutral, 10% negative)
        const rand = Math.random();
        let sentiment, rating, templates;

        if (rand < 0.7) {
          sentiment = 'positive';
          rating = Math.random() < 0.5 ? 5 : 4;
          templates = feedbackTemplates.positive;
        } else if (rand < 0.9) {
          sentiment = 'neutral';
          rating = 3;
          templates = feedbackTemplates.neutral;
        } else {
          sentiment = 'negative';
          rating = Math.random() < 0.5 ? 1 : 2;
          templates = feedbackTemplates.negative;
        }

        // Random table number
        const tableNumber = Math.floor(Math.random() * 20) + 1;

        // Select random feedback template
        let feedbackText = templates[Math.floor(Math.random() * templates.length)];

        // Replace {staff_name} if present
        if (feedbackText.includes('{staff_name}')) {
          const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
          feedbackText = feedbackText.replace('{staff_name}', randomEmployee.first_name);
        }

        // Determine if resolved (95% of feedback gets resolved)
        const isResolved = Math.random() < 0.95;
        let resolvedAt = null;
        let resolvedBy = null;
        let resolutionNotes = null;

        if (isResolved) {
          // Resolution time: 1-23 minutes after submission
          const resolutionMinutes = Math.floor(Math.random() * 23) + 1;
          resolvedAt = new Date(responseTime.getTime() + resolutionMinutes * 60 * 1000);
          resolvedBy = employees[Math.floor(Math.random() * employees.length)].id;

          if (sentiment === 'negative') {
            resolutionNotes = [
              'Spoke with customer and resolved issue',
              'Manager addressed concern personally',
              'Offered complimentary drinks as apology',
              'Issue escalated and resolved satisfactorily',
              'Customer left happy after intervention'
            ][Math.floor(Math.random() * 5)];
          } else {
            resolutionNotes = [
              'Thanked customer for feedback',
              'Acknowledged positive experience',
              'Customer appreciated the service'
            ][Math.floor(Math.random() * 3)];
          }
        }

        // Create feedback record
        const feedback = {
          venue_id: venue.id,
          rating: rating,
          additional_feedback: feedbackText,
          table_number: tableNumber,
          created_at: responseTime.toISOString()
        };

        allFeedback.push(feedback);

        // 10% chance of assistance request
        if (Math.random() < 0.1) {
          const assistanceTime = new Date(responseTime.getTime() - Math.random() * 30 * 60 * 1000);
          const assistanceResolved = Math.random() < 0.98; // 98% assistance requests resolved

          let assistResolvedAt = null;
          let assistResolvedBy = null;

          if (assistanceResolved) {
            const assistMinutes = Math.floor(Math.random() * 5) + 1; // 1-5 minutes
            assistResolvedAt = new Date(assistanceTime.getTime() + assistMinutes * 60 * 1000);
            assistResolvedBy = employees[Math.floor(Math.random() * employees.length)].id;
          }

          const assistance = {
            venue_id: venue.id,
            table_number: tableNumber,
            status: assistanceResolved ? 'resolved' : 'pending',
            message: assistanceReasons[Math.floor(Math.random() * assistanceReasons.length)],
            created_at: assistanceTime.toISOString(),
            acknowledged_at: assistanceResolved ? assistanceTime.toISOString() : null,
            acknowledged_by: assistResolvedBy,
            resolved_at: assistResolvedAt ? assistResolvedAt.toISOString() : null,
            resolved_by: assistResolvedBy,
            notes: assistanceResolved ? 'Request handled' : null
          };

          allAssistance.push(assistance);
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`   ✓ Generated ${dayCount} days of feedback`);
  }

  console.log(`\n   📊 Total feedback records: ${allFeedback.length}`);
  console.log(`   📊 Total assistance requests: ${allAssistance.length}`);

  return { feedback: allFeedback, assistance: allAssistance };
}

// Insert data in batches
async function insertInBatches(tableName, data, batchSize = 1000) {
  console.log(`\n💾 Inserting ${data.length} records into ${tableName}...`);

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const { error } = await supabase.from(tableName).insert(batch);

    if (error) {
      console.error(`   ❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      console.error('   First record in failed batch:', JSON.stringify(batch[0], null, 2));
    } else {
      console.log(`   ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)} (${batch.length} records)`);
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting demo data insertion...\n');
  console.log(`📡 Connected to: ${supabaseUrl}\n`);

  try {
    // Step 1: Execute the comprehensive demo data SQL (staff + ratings)
    console.log('========================================');
    console.log('STEP 1: Inserting Staff & Historical Ratings');
    console.log('========================================');

    const sqlFile = path.join(__dirname, '..', 'comprehensive_demo_data_all_venues.sql');

    // Since Supabase JS client doesn't support raw SQL, we'll insert data programmatically
    console.log('\n⚠️  Using programmatic insertion (Supabase JS client limitation)');

    // Clear existing data
    console.log('\n🗑️  Clearing existing demo data...');

    const venueIds = venues.map(v => v.id);

    // Delete in correct order (respecting foreign keys)
    await supabase.from('assistance_requests').delete().in('venue_id', venueIds);
    await supabase.from('feedback').delete().in('venue_id', venueIds);
    await supabase.from('external_ratings').delete().in('venue_id', venueIds);
    await supabase.from('historical_ratings').delete().in('venue_id', venueIds);
    await supabase.from('employees').delete().in('venue_id', venueIds);

    console.log('   ✓ Cleared existing data');

    // Insert employees
    console.log('\n👥 Inserting employees...');

    const employeeData = [
      // Lion of Beaconsfield
      { id: 'd2242216-ff78-4cdc-9743-c705b37c3842', venue_id: 'd877bd0b-6522-409f-9192-ca996e1a7f48', first_name: 'James', last_name: 'Smith', role: 'Manager', email: 'james.smith@thelion.uk' },
      { id: '971de9a5-8282-4376-bbf8-c53a4edb6a07', venue_id: 'd877bd0b-6522-409f-9192-ca996e1a7f48', first_name: 'Lucy', last_name: 'Brown', role: 'Server', email: 'lucy.brown@thelion.uk' },
      { id: 'b1322e80-d179-492b-b943-0178c50e3633', venue_id: 'd877bd0b-6522-409f-9192-ca996e1a7f48', first_name: 'Poppy', last_name: 'Stanhope', role: 'Waiter/Waitress', email: 'poppy.stanhope@thelion.uk' },
      { id: '73205edc-c08e-49f6-81cb-7268d34bfbbc', venue_id: 'd877bd0b-6522-409f-9192-ca996e1a7f48', first_name: 'Tilly', last_name: 'Wadsworth', role: 'Bartender', email: 'tilly.wadsworth@thelion.uk' },
      { id: '8eacc52a-3dbd-407d-9f72-379e2794cd73', venue_id: 'd877bd0b-6522-409f-9192-ca996e1a7f48', first_name: 'Theo', last_name: 'Bannister', role: 'Bartender', email: 'theo.bannister@thelion.uk' },
      // Dunn Inn
      { id: 'a1b2c3d4-e5f6-4a5b-9c8d-1e2f3a4b5c6d', venue_id: 'd7683570-11ac-4007-ba95-dcdb4ef6c101', first_name: 'Emma', last_name: 'Johnson', role: 'Manager', email: 'emma.johnson@dunninn.uk' },
      { id: 'b2c3d4e5-f6a7-4b5c-9d8e-2f3a4b5c6d7e', venue_id: 'd7683570-11ac-4007-ba95-dcdb4ef6c101', first_name: 'Oliver', last_name: 'Davies', role: 'Server', email: 'oliver.davies@dunninn.uk' },
      { id: 'c3d4e5f6-a7b8-4c5d-9e8f-3a4b5c6d7e8f', venue_id: 'd7683570-11ac-4007-ba95-dcdb4ef6c101', first_name: 'Sophie', last_name: 'Williams', role: 'Waiter/Waitress', email: 'sophie.williams@dunninn.uk' },
      { id: 'd4e5f6a7-b8c9-4d5e-9f8a-4b5c6d7e8f9a', venue_id: 'd7683570-11ac-4007-ba95-dcdb4ef6c101', first_name: 'Jack', last_name: 'Taylor', role: 'Bartender', email: 'jack.taylor@dunninn.uk' },
      { id: 'e5f6a7b8-c9d0-4e5f-9a8b-5c6d7e8f9a0b', venue_id: 'd7683570-11ac-4007-ba95-dcdb4ef6c101', first_name: 'Mia', last_name: 'Anderson', role: 'Server', email: 'mia.anderson@dunninn.uk' },
      // The Fox
      { id: 'f6a7b8c9-d0e1-4f5a-9b8c-6d7e8f9a0b1c', venue_id: 'ba9c45d4-3947-4560-9327-7f00c695d177', first_name: 'Harry', last_name: 'Wilson', role: 'Manager', email: 'harry.wilson@thefox.uk' },
      { id: 'a7b8c9d0-e1f2-4a5b-9c8d-7e8f9a0b1c2d', venue_id: 'ba9c45d4-3947-4560-9327-7f00c695d177', first_name: 'Amelia', last_name: 'Thomas', role: 'Server', email: 'amelia.thomas@thefox.uk' },
      { id: 'b8c9d0e1-f2a3-4b5c-9d8e-8f9a0b1c2d3e', venue_id: 'ba9c45d4-3947-4560-9327-7f00c695d177', first_name: 'Charlie', last_name: 'Roberts', role: 'Waiter/Waitress', email: 'charlie.roberts@thefox.uk' },
      { id: 'c9d0e1f2-a3b4-4c5d-9e8f-9a0b1c2d3e4f', venue_id: 'ba9c45d4-3947-4560-9327-7f00c695d177', first_name: 'Isla', last_name: 'Moore', role: 'Bartender', email: 'isla.moore@thefox.uk' },
      { id: 'd0e1f2a3-b4c5-4d5e-9f8a-0b1c2d3e4f5a', venue_id: 'ba9c45d4-3947-4560-9327-7f00c695d177', first_name: 'George', last_name: 'White', role: 'Server', email: 'george.white@thefox.uk' }
    ];

    const { error: employeeError } = await supabase.from('employees').insert(employeeData);
    if (employeeError) {
      console.error('   ❌ Error inserting employees:', employeeError.message);
    } else {
      console.log(`   ✓ Inserted ${employeeData.length} employees`);
    }

    // Step 2: Generate and insert feedback data
    console.log('\n========================================');
    console.log('STEP 2: Generating Feedback Data');
    console.log('========================================');

    const { feedback, assistance } = await generateFeedbackData();

    // Step 3: Insert feedback
    console.log('\n========================================');
    console.log('STEP 3: Inserting Data into Supabase');
    console.log('========================================');

    await insertInBatches('feedback', feedback, 500);
    await insertInBatches('assistance_requests', assistance, 500);

    console.log('\n✅ Demo data insertion complete!\n');
    console.log('==========================================');
    console.log('Summary:');
    console.log('==========================================');
    console.log(`✓ ${employeeData.length} employees`);
    console.log(`✓ ${feedback.length} feedback sessions`);
    console.log(`✓ ${assistance.length} assistance requests`);
    console.log('==========================================\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();
