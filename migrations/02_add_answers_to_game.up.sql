begin;

alter table game
add column answers jsonb default '[]'::jsonb;

commit;
