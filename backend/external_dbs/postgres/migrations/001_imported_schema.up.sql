-- Only include standard PostgreSQL extensions that are commonly available
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas that were referenced in the original extensions
CREATE SCHEMA IF NOT EXISTS extensions;
