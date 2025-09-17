// Supabase Storage Setup Utility
// Run this script to create storage buckets for your Ausmo AAC app

import { supabase, STORAGE_BUCKETS } from './src/config/supabase';

async function setupStorageBuckets() {
  console.log('Setting up Supabase storage buckets...');

  const buckets = [
    {
      name: STORAGE_BUCKETS.USER_PHOTOS,
      public: true,
      description: 'User profile photos',
    },
    {
      name: STORAGE_BUCKETS.SYMBOL_IMAGES,
      public: true,
      description: 'Custom symbol images',
    },
    {
      name: STORAGE_BUCKETS.AUDIO_MESSAGES,
      public: false,
      description: 'Recorded audio messages',
    },
    {
      name: STORAGE_BUCKETS.BACKGROUND_IMAGES,
      public: true,
      description: 'Page background images',
    },
  ];

  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
        allowedMimeTypes: bucket.name === STORAGE_BUCKETS.AUDIO_MESSAGES 
          ? ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac']
          : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✓ Bucket '${bucket.name}' already exists`);
        } else {
          console.error(`✗ Error creating bucket '${bucket.name}':`, error.message);
        }
      } else {
        console.log(`✓ Created bucket '${bucket.name}': ${bucket.description}`);
      }
    } catch (err) {
      console.error(`✗ Unexpected error creating bucket '${bucket.name}':`, err);
    }
  }

  console.log('\nStorage bucket setup complete!');
  console.log('\nNext steps:');
  console.log('1. Go to your Supabase dashboard → Storage');
  console.log('2. Review the created buckets');
  console.log('3. Set up appropriate RLS policies for each bucket');
  console.log('4. Configure CORS settings if needed for web access');
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupStorageBuckets().catch(console.error);
}

export default setupStorageBuckets;
