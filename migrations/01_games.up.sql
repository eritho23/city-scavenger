begin;

create table game (
  uid uuid primary key default gen_random_uuid(),
  -- Data may be any shape.
  place_profile jsonb,
  started_at timestamptz not null default now(),
  -- Null in this column means the game is ongoing.
  ended_at timestamptz
);

create type question_kind as enum(
  'radar',
  'relative',
  'oddball',
  'precision',
  'photo'
);

create table question (
  uid uuid primary key default gen_random_uuid(),
  kind question_kind not null,
  -- Schemas are defined in TS code (zod).
  parameters jsonb,
  response jsonb,
  game uuid not null references game (uid)
);

commit;
