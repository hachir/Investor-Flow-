'use client';
import {createClient} from '@supabase/supabase-js';
// This key is publishable. Authorization is enforced by database row policies.
export const supabase=createClient('https://qkkrypzejrlyxvepwszt.supabase.co','sb_publishable_4nclfHT3Z2FkKtLpUVyFXg_omlgL7tZ',{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});
