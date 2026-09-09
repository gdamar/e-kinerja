import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    // Get all master_petugas for linking (match by email)
    const { data: masterPetugas, error: mpError } = await supabaseAdmin
      .from('master_petugas')
      .select('*, role:roles(*)');

    if (mpError) {
      throw mpError;
    }

    // Create a map for quick lookup by EMAIL (lowercase for consistency)
    const profileMap = new Map();
    masterPetugas?.forEach((profile) => {
      if (profile.email) {
        profileMap.set(profile.email.toLowerCase(), profile);
      }
    });

    // Combine auth users with their profiles
    const usersWithProfiles = authUsers.users.map((user) => {
      // Match by email (case-insensitive)
      const email = user.email?.toLowerCase() || '';
      const profile = profileMap.get(email);
      return {
        id: user.id,
        email: user.email,
        last_sign_in_at: user.last_sign_in_at,
        banned: user.banned,
        created_at: user.created_at,
        user_metadata: user.user_metadata,
        profile,
      };
    });

    return new Response(JSON.stringify({ users: usersWithProfiles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
