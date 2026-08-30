-- Pin the function's search_path (mitigates search_path hijacking) and move
-- the vector extension out of the public schema, per the security advisor.
alter function match_saenggibu_sources(vector, uuid, int) set search_path = public;

create schema if not exists extensions;
alter extension vector set schema extensions;
