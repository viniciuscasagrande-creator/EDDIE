-- Criação dos Schemas isolados por Bounded Context (Módulo)
CREATE SCHEMA IF NOT EXISTS eventos;
CREATE SCHEMA IF NOT EXISTS inventario;
CREATE SCHEMA IF NOT EXISTS pagamentos;
CREATE SCHEMA IF NOT EXISTS acesso;
CREATE SCHEMA IF NOT EXISTS financeiro;
CREATE SCHEMA IF NOT EXISTS contabilidade;
CREATE SCHEMA IF NOT EXISTS sac;
CREATE SCHEMA IF NOT EXISTS developer;
CREATE SCHEMA IF NOT EXISTS marketing;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS estorno;

-- Habilita extensões necessárias no Postgres (ex: pgvector, uuid)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "vector"; -- descomentar caso use imagem pgvector
