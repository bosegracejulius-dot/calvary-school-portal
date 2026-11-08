import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitEnquiry } from '@/lib/public.functions';
import { enquirySchema } from '@/lib/validation';
import { LEVELS } from '@/lib/school';
export function EnquiryForm({ kind }: { kind: 'contact' | 'admission' }) {
  const send = useServerFn(submitEnquiry); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [error, setError] = useState('');
  if (done) return <div role="status" className="border-y py-10"><CheckCircle2 className="size-9 text-accent"/><h3 className="mt-4 text-2xl">Thank you for getting in touch.</h3><p className="mt-3 text-muted-foreground">Your enquiry has been received by the school.</p><Button className="mt-6" variant="outline" onClick={() => setDone(false)}>Send another enquiry</Button></div>;
  return <form className="space-y-5" onSubmit={async e => { e.preventDefault(); const f = new FormData(e.currentTarget); const data = { kind, name: String(f.get('name') ?? ''), email: String(f.get('email') ?? ''), phone: String(f.get('phone') ?? ''), subject: String(f.get('subject') ?? ''), child_name: String(f.get('child_name') ?? ''), level: String(f.get('level') ?? ''), message: String(f.get('message') ?? ''), website: String(f.get('website') ?? ''), consent: f.get('consent') === 'on' }; const parsed = enquirySchema.safeParse(data); if (!parsed.success) { setError('Please complete the required fields and agree to sharing your enquiry with the school.'); return; } setBusy(true); setError(''); try { await send({ data: parsed.data }); setDone(true); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to send. Please try again.'); } finally { setBusy(false); } }}>
    <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium">{kind === 'admission' ? 'Parent / guardian name' : 'Your name'}<Input name="name" autoComplete="name" required minLength={2} maxLength={120}/></label><label className="space-y-2 text-sm font-medium">Email address<Input name="email" type="email" autoComplete="email" required maxLength={200}/></label></div>
    <label className="block space-y-2 text-sm font-medium">Phone number<Input name="phone" type="tel" autoComplete="tel" maxLength={40}/></label>
    {kind === 'admission' ? <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium">Child’s name (optional)<Input name="child_name" maxLength={120}/></label><label className="space-y-2 text-sm font-medium">Educational level<select name="level" required className="h-10 w-full rounded-md border bg-background px-3"><option value="">Select a level</option>{LEVELS.map(l => <option key={l.id}>{l.name}</option>)}</select></label></div> : <label className="block space-y-2 text-sm font-medium">Subject<Input name="subject" maxLength={200}/></label>}
    <label className="block space-y-2 text-sm font-medium">Your message<Textarea name="message" required minLength={2} maxLength={4000} rows={5}/></label>
    <label className="hidden" aria-hidden="true">Website<Input name="website" tabIndex={-1} autoComplete="off"/></label>
    <label className="flex items-start gap-3 text-sm text-muted-foreground"><input type="checkbox" name="consent" required className="mt-1"/>I agree to share these details with the school for the purpose of responding to my enquiry.</label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button variant="accent" disabled={busy} type="submit"><Send/>{busy ? 'Sending…' : 'Send enquiry'}</Button>
  </form>;
}
