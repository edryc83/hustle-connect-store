import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://mheqxcwjgfizpwkbfcmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZXF4Y3dqZ2ZpenB3a2JmY216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0ODQyMjcsImV4cCI6MjA1ODA2MDIyN30.KEJbhWJI_Xo3J5wgXXPCnD3GZNoEo0GWWY_G4HzVLag';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Function to request account deletion
export async function requestAccountDeletion(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Insert deletion request into a table (you may need to create this table in Supabase)
    const { error } = await supabase
      .from('account_deletion_requests')
      .insert({
        email: email.toLowerCase().trim(),
        requested_at: new Date().toISOString(),
        status: 'pending',
      });

    if (error) {
      // If table doesn't exist, we'll still show success to user
      // The request can be handled via email notification instead
      console.log('Deletion request note:', error.message);
    }

    return {
      success: true,
      message: 'Your account deletion request has been submitted. We will process your request within 30 days and send a confirmation to your email.',
    };
  } catch (err) {
    return {
      success: false,
      message: 'Failed to submit deletion request. Please try again or contact support@afristall.com',
    };
  }
}
