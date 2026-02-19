create table if not exists public.nutrixo_import_jobs (
  id uuid primary key,
  kind text not null check (kind in ('exams','measurements','plans')),
  user_email text not null,
  file_name text not null,
  status text not null check (status in ('queued','running','completed','failed')),
  stage text not null check (stage in ('queued','extract','clean','llm','save','completed','failed')),
  percent integer not null default 0 check (percent >= 0 and percent <= 100),
  error text,
  result_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_nutrixo_import_jobs_user_kind_status
  on public.nutrixo_import_jobs (user_email, kind, status, created_at desc);

create index if not exists idx_nutrixo_import_jobs_created_at
  on public.nutrixo_import_jobs (created_at);

create or replace function public.set_nutrixo_import_jobs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_nutrixo_import_jobs_updated_at on public.nutrixo_import_jobs;
create trigger trg_nutrixo_import_jobs_updated_at
before update on public.nutrixo_import_jobs
for each row
execute function public.set_nutrixo_import_jobs_updated_at();
