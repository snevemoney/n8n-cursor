import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedEmailEvents() {
  console.log('🌱 Seeding email events...');

  // Sample emails and workspace IDs
  const emails = [
    'user1@example.com',
    'user2@example.com', 
    'user3@example.com',
    'user4@example.com',
    'user5@example.com',
    'user6@example.com',
    'user7@example.com',
    'user8@example.com',
  ];

  const workspaceId = '123e4567-e89b-12d3-a456-426614174000'; // Sample workspace ID

  // Generate events for the last 30 days
  const events = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Random number of events per day
    const dailyEvents = Math.floor(Math.random() * 10) + 1;
    
    for (let j = 0; j < dailyEvents; j++) {
      const email = emails[Math.floor(Math.random() * emails.length)];
      const eventType = Math.random() > 0.7 ? 'click' : 'open'; // 30% clicks, 70% opens
      
      events.push({
        email,
        workspace_id: workspaceId,
        type: eventType,
        timestamp: date.toISOString(),
      });
    }
  }

  // Insert events
  const { data, error } = await supabase
    .from('email_events')
    .insert(events);

  if (error) {
    console.error('❌ Error seeding email events:', error);
    return;
  }

  console.log(`✅ Successfully seeded ${events.length} email events`);

  // Also create some workspace records for conversion tracking
  const { error: workspaceError } = await supabase
    .from('workspaces')
    .upsert([
      {
        id: workspaceId,
        name: 'Sample Workspace',
        plan: 'pro',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
      }
    ]);

  if (workspaceError) {
    console.error('❌ Error creating workspace:', workspaceError);
  } else {
    console.log('✅ Sample workspace created for conversion tracking');
  }
}

// Run if called directly
if (require.main === module) {
  seedEmailEvents()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedEmailEvents }; 