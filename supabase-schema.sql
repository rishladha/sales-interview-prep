-- =============================================
-- SALES INTERVIEW PREP - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text, -- SDR, AE, CSM, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- INTERVIEWS TABLE
-- =============================================
create table if not exists public.interviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  -- Setup info
  role_type text not null, -- sdr, ae, csm, etc.
  interview_type text not null, -- cold_call, discovery, csm_renewal, etc.
  company_name text,
  
  -- Scenario info
  scenario_person_name text,
  scenario_person_role text,
  scenario_context text,
  
  -- Results
  overall_score integer,
  dimension_scores jsonb, -- [{name: "Opening", score: 75, note: "..."}]
  strengths jsonb, -- [{point: "...", framework: "..."}]
  improvements jsonb, -- [{point: "...", framework: "...", tip: "..."}]
  annotated_moments jsonb, -- [{quote: "...", type: "good|warning", note: "..."}]
  summary text,
  transcript text,
  
  -- Metadata
  duration_seconds integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.interviews enable row level security;

-- Policies
create policy "Users can view own interviews" on public.interviews
  for select using (auth.uid() = user_id);

create policy "Users can insert own interviews" on public.interviews
  for insert with check (auth.uid() = user_id);

-- =============================================
-- VIEWS FOR PROGRESS DASHBOARD
-- =============================================

-- User stats view
create or replace view public.user_stats as
select 
  user_id,
  count(*) as total_interviews,
  round(avg(overall_score)) as avg_score,
  max(created_at) as last_practice,
  round(avg(overall_score) filter (where created_at > now() - interval '30 days')) as avg_score_this_month,
  round(avg(overall_score) filter (where created_at > now() - interval '60 days' and created_at <= now() - interval '30 days')) as avg_score_last_month
from public.interviews
where overall_score is not null
group by user_id;

-- Recent scores (last 12)
create or replace function public.get_recent_scores(p_user_id uuid, p_limit integer default 12)
returns table(score integer, created_at timestamp with time zone) as $$
  select overall_score, created_at
  from public.interviews
  where user_id = p_user_id and overall_score is not null
  order by created_at desc
  limit p_limit;
$$ language sql security definer;

-- Dimension averages (for focus areas)
create or replace function public.get_dimension_averages(p_user_id uuid)
returns jsonb as $$
declare
  result jsonb;
begin
  select jsonb_agg(
    jsonb_build_object(
      'name', dim->>'name',
      'avg_score', round((sum((dim->>'score')::numeric) / count(*))::numeric)
    )
  )
  into result
  from public.interviews,
  lateral jsonb_array_elements(dimension_scores) as dim
  where user_id = p_user_id
  group by dim->>'name';
  
  return coalesce(result, '[]'::jsonb);
end;
$$ language plpgsql security definer;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
create index if not exists interviews_user_id_idx on public.interviews(user_id);
create index if not exists interviews_created_at_idx on public.interviews(created_at desc);
create index if not exists interviews_user_created_idx on public.interviews(user_id, created_at desc);
