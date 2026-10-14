-- Additive migration: does not alter custom rug requests or payment systems.
begin;
create schema if not exists nfd_tracker_private;
revoke all on schema nfd_tracker_private from public, anon, authenticated;
create table nfd_tracker_private.admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
create table nfd_tracker_private.settings (
 singleton boolean primary key default true check(singleton),
 code_hash text not null
);
create table nfd_tracker_private.orders (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(trim(name)) between 1 and 100),
 description text not null default '' check(length(description)<=300),
 phone_last_two text not null check(phone_last_two ~ '^[0-9]{2}$'),
 stage text not null check(stage in ('waiting','up_next','production','wrapping','completed')),
 queue_rank bigint not null,
 updated_at timestamptz not null default now()
);
create table nfd_tracker_private.throttle (
 singleton boolean primary key default true check(singleton),
 window_started timestamptz not null default now(), failures integer not null default 0
);
insert into nfd_tracker_private.throttle(singleton) values(true);
alter table nfd_tracker_private.throttle enable row level security;
alter table nfd_tracker_private.admins enable row level security;
alter table nfd_tracker_private.settings enable row level security;
alter table nfd_tracker_private.orders enable row level security;
revoke all on all tables in schema nfd_tracker_private from public,anon,authenticated;

create function nfd_tracker_private.require_admin() returns void
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from nfd_tracker_private.admins where user_id=auth.uid()) then
  raise exception 'Admin access required' using errcode='42501';
 end if;
end $$;
revoke all on function nfd_tracker_private.require_admin() from public,anon,authenticated;

-- Shared access is a bearer secret; never use a phone suffix.
-- Hash using core PostgreSQL SHA256 (no extension dependency).
create function public.nfd_tracker_read(access_code text) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 -- Serialize attempts and commit failed-attempt counters by returning errors,
 -- rather than throwing (which would roll back the counters).
 perform pg_advisory_xact_lock(641015);
 update nfd_tracker_private.throttle set window_started=now(),failures=0
 where window_started < now()-interval '5 minutes';
 if (select failures from nfd_tracker_private.throttle)>=30 then
  return jsonb_build_object('error','Too many failed attempts. Please try again in five minutes.');
 end if;
 if access_code is null or length(access_code) not between 10 and 128 or not exists(
  select 1 from nfd_tracker_private.settings
  where code_hash=encode(sha256(convert_to(access_code,'UTF8')),'hex')
 ) then
  update nfd_tracker_private.throttle set failures=failures+1;
  return jsonb_build_object('error','That access code was not accepted. Please check the code you received.');
 end if;
 return coalesce((select jsonb_agg(jsonb_build_object(
  'name',o.name,'description',o.description,'phone_last_two',o.phone_last_two,
  'stage',o.stage,'ahead',(select count(*) from nfd_tracker_private.orders a
    where a.stage<>'completed' and (a.queue_rank,a.id)<(o.queue_rank,o.id))
 ) order by (o.stage='completed'),o.queue_rank,o.id)
 from nfd_tracker_private.orders o),'[]'::jsonb);
end $$;

create function public.nfd_tracker_admin_list() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform nfd_tracker_private.require_admin();
 return coalesce((select jsonb_agg(to_jsonb(o) order by o.queue_rank,o.id)
 from nfd_tracker_private.orders o),'[]'::jsonb);
end $$;

create function public.nfd_tracker_save(order_id uuid,order_data jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform nfd_tracker_private.require_admin();
 perform pg_advisory_xact_lock(641014);
 if order_id is null then
  insert into nfd_tracker_private.orders(name,description,phone_last_two,stage,queue_rank)
  values(trim(order_data->>'name'),coalesce(order_data->>'description',''),order_data->>'phone_last_two',order_data->>'stage',
    coalesce((select max(queue_rank) from nfd_tracker_private.orders),0)+1)
  returning id into result;
 else
  update nfd_tracker_private.orders set name=trim(order_data->>'name'),
   description=coalesce(order_data->>'description',''),phone_last_two=order_data->>'phone_last_two',
   stage=order_data->>'stage',updated_at=now() where id=order_id returning id into result;
  if result is null then raise exception 'Order no longer exists'; end if;
 end if;
 return result;
end $$;

create function public.nfd_tracker_reorder(order_ids uuid[]) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform nfd_tracker_private.require_admin();
 perform pg_advisory_xact_lock(641014);
 if order_ids is null or cardinality(order_ids)<>(select count(*) from nfd_tracker_private.orders)
  or (select count(distinct x) from unnest(order_ids) x)<>cardinality(order_ids)
  or exists(select 1 from unnest(order_ids) x where not exists(select 1 from nfd_tracker_private.orders where id=x)) then
  raise exception 'Queue changed. Refresh before reordering.';
 end if;
 update nfd_tracker_private.orders o set queue_rank=q.rank,updated_at=now()
 from unnest(order_ids) with ordinality as q(id,rank) where o.id=q.id;
end $$;

create function public.nfd_tracker_set_code(access_code text) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform nfd_tracker_private.require_admin();
 if access_code is null or length(access_code) not between 10 and 128 then
  raise exception 'Access code must contain 10–128 characters';
 end if;
 insert into nfd_tracker_private.settings(singleton,code_hash)
 values(true,encode(sha256(convert_to(access_code,'UTF8')),'hex'))
 on conflict(singleton) do update set code_hash=excluded.code_hash;
end $$;

create function public.nfd_tracker_rotate() returns text
language plpgsql security definer set search_path='' as $$
declare code text;
begin
 perform nfd_tracker_private.require_admin();
 -- Two independently random v4 UUIDs: 244 random bits.
 code:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 insert into nfd_tracker_private.settings(singleton,code_hash)
 values(true,encode(sha256(convert_to(code,'UTF8')),'hex'))
 on conflict(singleton) do update set code_hash=excluded.code_hash;
 return code;
end $$;

create function public.nfd_tracker_import(order_data jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare item jsonb;
begin
 perform nfd_tracker_private.require_admin();
 perform pg_advisory_xact_lock(641014);
 if jsonb_typeof(order_data)<>'array' then raise exception 'Expected an array'; end if;
 if jsonb_array_length(order_data) not between 1 and 100 then raise exception 'Expected 1–100 orders'; end if;
 -- Atomic import. Intended only for an empty tracker to avoid duplicates.
 if exists(select 1 from nfd_tracker_private.orders) then raise exception 'Initial import requires an empty tracker'; end if;
 for item in select value from jsonb_array_elements(order_data) loop
  perform public.nfd_tracker_save(null,item);
 end loop;
end $$;

-- Functions default to PUBLIC execution unless explicitly revoked.
revoke all on function public.nfd_tracker_read(text) from public,anon,authenticated;
revoke all on function public.nfd_tracker_admin_list() from public,anon,authenticated;
revoke all on function public.nfd_tracker_save(uuid,jsonb) from public,anon,authenticated;
revoke all on function public.nfd_tracker_reorder(uuid[]) from public,anon,authenticated;
revoke all on function public.nfd_tracker_set_code(text) from public,anon,authenticated;
revoke all on function public.nfd_tracker_rotate() from public,anon,authenticated;
revoke all on function public.nfd_tracker_import(jsonb) from public,anon,authenticated;
grant execute on function public.nfd_tracker_read(text) to anon,authenticated;
grant execute on function public.nfd_tracker_admin_list() to authenticated;
grant execute on function public.nfd_tracker_save(uuid,jsonb) to authenticated;
grant execute on function public.nfd_tracker_reorder(uuid[]) to authenticated;
grant execute on function public.nfd_tracker_set_code(text) to authenticated;
grant execute on function public.nfd_tracker_rotate() to authenticated;
grant execute on function public.nfd_tracker_import(jsonb) to authenticated;
commit;
