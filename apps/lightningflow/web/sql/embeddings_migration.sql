-- Enable pgvector extension
create extension if not exists vector;

-- Loop tutorial embeddings table
create table loop_embeddings (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  title text,
  summary text,
  metadata jsonb,
  embedding vector(1536),
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

-- Onboarding event tracking
create table onboarding_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  step text not null,
  action text not null, -- "started", "completed", "error", "dropped_off"
  metadata jsonb,
  created_at timestamp default current_timestamp
);

-- Loop failure logs
create table loop_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  channel_id text,
  error_code text,
  raw_log text not null,
  status text default 'new', -- "new", "explained", "resolved"
  explanation text,
  created_at timestamp default current_timestamp
);

-- Vector similarity search function
create or replace function match_loop_embeddings(
  query_embedding vector(1536),
  match_threshold float default 0.75,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  title text,
  summary text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    loop_embeddings.id,
    loop_embeddings.content,
    loop_embeddings.title,
    loop_embeddings.summary,
    loop_embeddings.metadata,
    1 - (loop_embeddings.embedding <=> query_embedding) as similarity
  from loop_embeddings
  where loop_embeddings.embedding <=> query_embedding < (1 - match_threshold)
  order by loop_embeddings.embedding <=> query_embedding
  limit match_count;
$$;

-- Indexes for performance
create index on loop_embeddings using ivfflat (embedding vector_cosine_ops);
create index on onboarding_events (user_id, created_at);
create index on loop_logs (user_id, created_at); 