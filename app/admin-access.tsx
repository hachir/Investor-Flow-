"use client";

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { supabase } from './supabase-client';

type AdminState = 'loading' | 'admin' | 'signed-out' | 'denied';

export function isAdminUser(user: User | null) {
  return user?.app_metadata?.role === 'admin';
}

export function useAdminAccess() {
  const [state, setState] = useState<AdminState>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      const nextUser = error ? null : data.user;
      setUser(nextUser);
      setState(!nextUser ? 'signed-out' : isAdminUser(nextUser) ? 'admin' : 'denied');
    };
    void refresh();
    const { data } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refresh(), 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { state, user };
}

export default function AdminNavLink({
  label = 'Admin schedule',
  className = 'admin-nav-link',
}: {
  label?: string;
  className?: string;
}) {
  const { state } = useAdminAccess();
  if (state !== 'admin') return null;
  return <Link className={className} href="/admin/schedule">{label}</Link>;
}
