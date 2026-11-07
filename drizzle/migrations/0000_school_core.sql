create type public.app_role as enum ('admin', 'editor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- First account ever created becomes admin; later accounts get no role until an admin grants one.
create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_first_admin after insert on auth.users for each row execute function public.handle_first_admin();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- News & announcements
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  category text not null default 'Announcement',
  image_url text,
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "Public reads published posts" on public.posts for select to anon, authenticated using (published = true or public.has_role(auth.uid(),'admin'));
create policy "Admins write posts" on public.posts for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger posts_touch before update on public.posts for each row execute function public.touch_updated_at();

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'School Activity',
  venue text not null default '',
  starts_at timestamptz not null,
  time_label text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "Public reads published events" on public.events for select to anon, authenticated using (published = true or public.has_role(auth.uid(),'admin'));
create policy "Admins write events" on public.events for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger events_touch before update on public.events for each row execute function public.touch_updated_at();

-- Enquiries (contact + admissions)
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact','admission')),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200),
  phone text check (phone is null or char_length(phone) <= 40),
  subject text check (subject is null or char_length(subject) <= 200),
  child_name text check (child_name is null or char_length(child_name) <= 120),
  level text check (level is null or char_length(level) <= 80),
  message text not null check (char_length(message) between 2 and 4000),
  status text not null default 'new' check (status in ('new','in_progress','closed')),
  created_at timestamptz not null default now()
);
grant insert on public.enquiries to anon, authenticated;
grant select, update, delete on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;
create policy "Anyone can submit enquiry" on public.enquiries for insert to anon, authenticated with check (status = 'new');
create policy "Admins read enquiries" on public.enquiries for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins update enquiries" on public.enquiries for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete enquiries" on public.enquiries for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Site settings (contact info etc.)
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Public reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins write settings" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Knowledge base for Calvary AI
create table public.kb_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source text not null default 'Admin upload',
  content text not null,
  file_path text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.kb_documents to authenticated;
grant all on public.kb_documents to service_role;
alter table public.kb_documents enable row level security;
create policy "Admins manage kb docs" on public.kb_documents for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger kb_touch before update on public.kb_documents for each row execute function public.touch_updated_at();

create table public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.kb_documents(id) on delete cascade,
  content text not null,
  fts tsvector generated always as (to_tsvector('english', content)) stored
);
create index kb_chunks_fts_idx on public.kb_chunks using gin (fts);
grant select, insert, update, delete on public.kb_chunks to authenticated;
grant all on public.kb_chunks to service_role;
alter table public.kb_chunks enable row level security;
create policy "Admins manage kb chunks" on public.kb_chunks for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Retrieval: returns only text from active approved documents (no private tables).
create or replace function public.search_kb(q text, match_count int default 6)
returns table (chunk_id uuid, title text, source text, content text, rank real)
language plpgsql stable security definer set search_path = public as $$
declare tq tsquery;
begin
  select to_tsquery('english', string_agg(quote_literal(l) || ':*', ' | '))
    into tq from unnest(tsvector_to_array(to_tsvector('english', coalesce(q,'')))) l;
  if tq is null then return; end if;
  return query
    select c.id, d.title, d.source, c.content, ts_rank(c.fts, tq) as rank
    from public.kb_chunks c join public.kb_documents d on d.id = c.document_id
    where d.active and c.fts @@ tq
    order by rank desc
    limit least(greatest(match_count,1),12);
end $$;
grant execute on function public.search_kb(text, int) to anon, authenticated;

-- Seed: verified information from the official website
insert into public.site_settings (key, value) values ('contact', jsonb_build_object(
  'mainAddress', '1–5 Calvary Avenue, Pipeline, Arepo, Obafemi Owode LGA, Ogun State, Nigeria',
  'annexAddress', '2B Adigboluja Street, Off Ojodu Abiodun Road, Ogun State',
  'phones', jsonb_build_array('+234 703 892 9888','+234 806 982 5550','+234 703 988 4475'),
  'emails', jsonb_build_array('info@calvarygroupofschools.com','enquiries@calvarygroupofschools.com'),
  'offices', jsonb_build_array(
    jsonb_build_object('label','Principal Office','phone','0703 892 9888'),
    jsonb_build_object('label','School HM Office','phone','0805 331 7830'),
    jsonb_build_object('label','Bursary Office','phone','0703 988 4475')),
  'facebook', 'https://www.facebook.com/calvarysch',
  'x', 'https://x.com/calvarysch'
));

with d as (
  insert into public.kb_documents (title, source, content) values
  ('School history and founder', 'Official website — About page',
'Calvary Group of Schools was founded in 2005, on Tuesday 4th of January. The sole aim of the founder, Pa Oyesile Elijah, was to create a private public-like education centre for Nigerians.

The founder, Pa Oyesile Elijah, is described on the official website as a reverend father, a scientist and a philanthropist.

The school started with its main campus at 1–5 Calvary Avenue, Pipeline, Arepo, Obafemi Owode LGA, along the Lagos–Ibadan Expressway, Ogun State, Nigeria.

The school later extended to an annex campus at 2B Adigboluja Street, Off Ojodu Abiodun Road, Ogun State.

The school is accredited to conduct examinations such as WAEC, NECO and BECE.

According to the official website, the school has graduated over a hundred students who are in various universities in Nigeria and abroad. The website states the school engages over 30 staff and accommodates over 300 children.'),
  ('Mission, pledge and affirmations', 'Official website — Home page',
'Mission: Our aim at Calvary Schools is to be widely acclaimed locally and internationally as a school that trains and turns out students who have been adequately prepared for tertiary education, and to produce a total child through a holistic education programme that benchmarks best practices while being socially responsible.

School pledge: I pledge as a student of Calvary Model College, to be disciplined and morally sound, to walk in faith and integrity, to learn with diligence, to excel in my academics and imbibe the fear of God, and to make choices that reflect God''s wisdom.

Affirmations: With God''s grace, I will strive to grow in knowledge, to respect my teachers, peers and those I meet. I will develop my talents for the good of others. I will be a light in the world and live a life of kindness and humility. I affirm that with faith and hard work my future is bright, and I will step forward with confidence knowing that God has a purpose for my life.

A separate vision statement has not yet been confirmed by the school.'),
  ('Educational levels and academics', 'Official website — Our Schools section',
'Calvary Group of Schools offers Pre-school (KG), Primary (Basic), Junior Secondary School and Senior Secondary School. The secondary arm is known as Calvary Model College.

Pre-school: Pre-school classes are tailored to prepare children for their first year in primary school. At this stage their foundations are structured for brighter future academic experiences. Teaching staff are caring and experienced in early childhood education, and the school assures parents of the safety of their wards.

Primary: The curriculum is delivered in an integrated manner through cross-curricular themes. Training aims to promote moral, cultural, cognitive, physical and spiritual development. The school specifies learning goals for each subject and staff are trained, experienced teachers.

College (Secondary): At Calvary Model College, "our strength is in God Almighty". Activities are designed to produce a well-reputed personality. The curriculum is based on the requirements of both the State and Federal Ministry of Education.

Government approved examinations: WAEC (West African Examinations Council) is taken in the last stage of secondary education and qualifies students for tertiary education. NECO is an indigenous examination taken at the end of secondary school. BECE is taken by candidates in their third year of Junior Secondary School to transition to Senior Secondary.

A full subject list for each level has not yet been confirmed by the school.'),
  ('Admissions', 'Official website — Admission page',
'Admission is offered upon success at the entrance examination and the availability of space in the candidate''s desired year of entry. The entrance examination subjects are English Language, Mathematics and General Paper.

How to apply: Application forms are available at the Admission Office. The previous official website listed the form at a token of 5,000 Naira; the current fee must be confirmed with the school before relying on it.

Completed forms should be submitted along with 4 passport photographs, a photocopy of the birth certificate, and the most recent academic reports from the last 2 years.

After the entrance examination, successful candidates are informed via SMS, email or phone call. A provisional letter of admission is then issued for collection. The acceptance letter is signed and returned with all required payments.

The entrance examination date for the current session has not been confirmed. Contact the admission office: info@calvarygroupofschools.com, Principal Office 07038929888, School HM Office 08053317830, Bursary Office 07039884475.'),
  ('Facilities', 'Official website — Facilities section',
'Facilities shown on the official website include: the school compound and sports ground, science laboratories, the school hall, school buses used to move pupils and students, and student interactive sessions.

Other facilities (for example library, ICT lab, sick bay) have not been confirmed by the school.'),
  ('Contact information', 'Official website — Contact page',
'Main campus address: 1–5 Calvary Avenue, Pipeline, Arepo, Obafemi Owode LGA, Ogun State, Nigeria.

Annex campus: 2B Adigboluja Street, Off Ojodu Abiodun Road, Ogun State.

Email: info@calvarygroupofschools.com and enquiries@calvarygroupofschools.com.

Phone: +234 703 892 9888, +234 806 982 5550, +234 703 988 4475. Principal Office: 0703 892 9888. School HM Office: 0805 331 7830. Bursary Office: 0703 988 4475.

Visitors can book a visit or appointment with the Principal, Headmaster or Admin through the contact form.'),
  ('Student life and past activities', 'Official website — Events and gallery',
'Past school activities shown on the official website include: a karting competition (venue: Hi-impact) won by student Benedict Ebenezer; an excursion to MM2 Airport, Lagos; Cultural Day 2025 celebrating Nigerian and African culture; a Nivea sensitization visit on personal hygiene; inter-house football competition; Next Circle Foundation character-building campaign and seminar; inter-house sports; home economics event; school games; spelling bee; club activities; and the annual graduation celebration (2025 graduation).

These are past events. Upcoming events are published on the website''s News & Events page by the school.'),
  ('Third Term 2025/2026 calendar (past session)', 'Official website — School calendar',
'This calendar is for the Third Term of the 2025/2026 session, which has already passed. The school notes that dates can be changed by government policy.

Resumption/Revision: 27th April 2026. Workers'' Day: 1st May 2026. Power Day: 8th May 2026. Gender Talk: 14th May 2026. Spelling Bee: 4th June 2026. Mid-Term Test: 5th June 2026. Mid-Term Break: 11th June 2026. Games: 25th June 2026. Club Activities: 2nd July 2026. Graduation Setup: 3rd July 2026. Revision Week: 6th July 2026. Examination Week: 8th July 2026. Vacation: 22nd July 2026. Graduation: 25th July 2026.')
  returning id, content
)
insert into public.kb_chunks (document_id, content)
select d.id, trim(p) from d, regexp_split_to_table(d.content, E'\n\n') p where trim(p) <> '';

insert into public.posts (title, excerpt, body, category, published, image_url) values
('Admission in progress', 'Enrol your children for quality education in a conducive learning atmosphere.', 'Calvary Group of Schools admission is in progress. Enrol your children for quality education in a conducive learning atmosphere. Visit the Admissions page to send an enquiry, or contact the admission office at info@calvarygroupofschools.com.', 'Admissions', true, '/images/building.jpg'),
('Science Day Exhibition', 'Our students are preparing science practicals for presentation.', 'Science Day Exhibition comes up — watch out as our students prepare science practicals for presentation. The date will be announced by the school.', 'Academic', true, '/images/science.jpg');

insert into public.events (title, description, category, venue, starts_at, time_label, published) values
('School Inter-house Sports', 'Annual inter-house sports competition.', 'Sports', 'Mountain Top University', '2026-02-27 10:00:00+01', '10:00am', true),
('Cultural Day 2026', 'Celebrating the beauty of Nigerian and African culture.', 'Celebration', 'School Hall', '2026-03-06 10:00:00+01', '10:00am', true);
