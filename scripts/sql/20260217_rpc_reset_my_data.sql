-- Atomic reset of current authenticated user's data.
-- Execute this once in your Insforge/Postgres database.

create or replace function public.rpc_reset_my_data()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_email text;
    v_deleted_exams integer := 0;
    v_deleted_measurements integer := 0;
    v_deleted_plans integer := 0;
    v_deleted_meals integer := 0;
    v_deleted_biomarkers integer := 0;
    v_deleted_chat integer := 0;
    v_file_keys text[];
begin
    v_email := coalesce(
        nullif(current_setting('request.jwt.claim.email', true), ''),
        nullif((current_setting('request.jwt.claims', true)::jsonb ->> 'email'), '')
    );

    if v_email is null then
        raise exception 'auth email claim not found';
    end if;

    select coalesce(array_agg(distinct key), '{}')::text[]
      into v_file_keys
      from (
        select file_key as key from public.nutrixo_exams where user_email = v_email and file_key is not null
        union all
        select file_key as key from public.nutrixo_measurements where user_email = v_email and file_key is not null
        union all
        select file_key as key from public.nutrixo_plans where user_email = v_email and file_key is not null
        union all
        select image_key as key from public.nutrixo_meals where user_email = v_email and image_key is not null
      ) t;

    if to_regclass('public.nutrixo_biomarkers') is not null then
        delete from public.nutrixo_biomarkers where user_email = v_email;
        get diagnostics v_deleted_biomarkers = row_count;
    end if;

    if to_regclass('public.nutrixo_chat') is not null then
        delete from public.nutrixo_chat where user_email = v_email;
        get diagnostics v_deleted_chat = row_count;
    end if;

    delete from public.nutrixo_meals where user_email = v_email;
    get diagnostics v_deleted_meals = row_count;

    delete from public.nutrixo_measurements where user_email = v_email;
    get diagnostics v_deleted_measurements = row_count;

    delete from public.nutrixo_plans where user_email = v_email;
    get diagnostics v_deleted_plans = row_count;

    delete from public.nutrixo_exams where user_email = v_email;
    get diagnostics v_deleted_exams = row_count;

    update public.nutrixo_profiles
       set xp = 0,
           level = 1,
           avatar_id = null,
           updated_at = now()
     where user_email = v_email;

    return jsonb_build_object(
        'email', v_email,
        'deleted_exams', v_deleted_exams,
        'deleted_measurements', v_deleted_measurements,
        'deleted_plans', v_deleted_plans,
        'deleted_meals', v_deleted_meals,
        'deleted_biomarkers', v_deleted_biomarkers,
        'deleted_chat', v_deleted_chat,
        'file_keys', to_jsonb(coalesce(v_file_keys, '{}'))
    );
end;
$$;

grant execute on function public.rpc_reset_my_data() to authenticated;
