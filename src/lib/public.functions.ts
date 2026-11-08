import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { enquirySchema } from './validation';
function db() {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('School information is temporarily unavailable.');
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (h.get('Authorization') === `Bearer ${key}`) h.delete('Authorization'); h.set('apikey', key); return fetch(input, { ...init, headers: h }); } } });
}
export const getPublicContent = createServerFn({ method: 'GET' }).handler(async () => {
  const client = db();
  const [posts, events, settings] = await Promise.all([client.from('posts').select('*').eq('published', true).order('published_at', { ascending: false }), client.from('events').select('*').eq('published', true), client.from('site_settings').select('value').eq('key', 'contact').maybeSingle()]);
  if (posts.error || events.error || settings.error) throw new Error('School information could not be loaded. Please try again.');
  return { posts: posts.data, events: events.data, contact: settings.data?.value ?? null };
});
export const submitEnquiry = createServerFn({ method: 'POST' }).inputValidator((data: unknown) => enquirySchema.parse(data)).handler(async ({ data }) => {
  if (data.website) throw new Error('Please leave the website field empty.');
  const { website: _website, consent: _consent, ...entry } = data;
  const { error } = await db().from('enquiries').insert(entry);
  if (error) throw new Error('Your enquiry could not be sent. Please try again or call the school.');
  return { success: true };
});
