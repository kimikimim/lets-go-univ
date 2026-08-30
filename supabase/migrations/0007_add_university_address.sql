-- 모집요강 list cards show the school's address (see cloudflare/pages or
-- app/src/app/(tabs)/admissions.tsx for the layout this feeds).
alter table universities add column address text;
