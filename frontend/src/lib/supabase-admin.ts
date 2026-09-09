import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Helper function to call Edge Functions
 */
export async function callEdgeFunction<T = any>(
  functionName: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: Request failed`);
  }

  return response.json();
}

/**
 * Types for Akun management
 */
export interface AkunUser {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  banned: boolean;
  created_at: string;
  user_metadata?: {
    id_petugas?: string;
    role_id?: string;
  };
  profile?: {
    id: string;
    nik: string;
    nama_phl: string;
    email: string;
    role?: {
      id: string;
      nama_role: string;
    };
  };
}

/**
 * List all users with their profiles
 */
export async function listUsers(): Promise<AkunUser[]> {
  const { users } = await callEdgeFunction<{ users: AkunUser[] }>('admin-list-users');
  return users || [];
}

/**
 * Create a new auth user
 */
export async function createUser(data: {
  email: string;
  password: string;
  id_petugas: string;
  role_id?: string;
}): Promise<{ user: { id: string; email: string } }> {
  return callEdgeFunction('admin-create-user', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update user (email, banned status)
 */
export async function updateUser(data: {
  id: string;
  email?: string;
  banned?: boolean;
}): Promise<{ user: { id: string; email: string; banned: boolean } }> {
  return callEdgeFunction('admin-update-user', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Reset user password
 */
export async function resetPassword(data: {
  id: string;
  new_password: string;
}): Promise<{ success: boolean }> {
  return callEdgeFunction('admin-reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
