-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

\connect app_db

--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.tenants DISABLE TRIGGER ALL;

INSERT INTO public.tenants (id, display_name, is_admin) VALUES (1, 'user tenant 1', false);
INSERT INTO public.tenants (id, display_name, is_admin) VALUES (2, 'user tenant 2', false);
INSERT INTO public.tenants (id, display_name, is_admin) VALUES (3, 'admin tenant', true);


ALTER TABLE public.tenants ENABLE TRIGGER ALL;

--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.patients DISABLE TRIGGER ALL;

INSERT INTO public.patients (id, tenant_id, first_name, last_name, dob) VALUES (1, 1, 'John', 'Doe', '1984-02-11');
INSERT INTO public.patients (id, tenant_id, first_name, last_name, dob) VALUES (2, 2, 'Jane', 'Doe', '1992-05-13');


ALTER TABLE public.patients ENABLE TRIGGER ALL;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.users DISABLE TRIGGER ALL;

INSERT INTO public.users (id, tenant_id, user_name, password) VALUES (1, 1, 'user1', '$2b$10$zrWh.kGsBsGHy4DcPcgS4eczXTVGEJMnXTzenLRzHLvFqbhAtnHOq');
INSERT INTO public.users (id, tenant_id, user_name, password) VALUES (2, 2, 'user2', '$2b$10$iUK2psZixdzgnBNn/AuQLuw88487vJjY9H.LWilyS9ege1KFNq.6a');
INSERT INTO public.users (id, tenant_id, user_name, password) VALUES (3, 3, 'admin', '$2b$10$FqEkMpnM0pZgcQWYoUG70ONWtZCgmCIVH4SQqW9VtIcV9mbUXVSdS');


ALTER TABLE public.users ENABLE TRIGGER ALL;

--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_id_seq', 2, true);


--
-- Name: tenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tenants_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--

