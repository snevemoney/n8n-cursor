-- Function to get comprehensive schema documentation for the AI agent
CREATE OR REPLACE FUNCTION get_schema_doc()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result TEXT := '';
  table_rec RECORD;
  column_rec RECORD;
BEGIN
  -- Get all public tables with their descriptions
  FOR table_rec IN 
    SELECT t.table_name, obj_description(c.oid) as table_comment
    FROM information_schema.tables t
    LEFT JOIN pg_class c ON c.relname = t.table_name
    WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name
  LOOP
    result := result || E'\n--- Table: ' || table_rec.table_name || E' ---\n';
    
    IF table_rec.table_comment IS NOT NULL THEN
      result := result || 'Description: ' || table_rec.table_comment || E'\n';
    END IF;
    
    result := result || 'Columns:' || E'\n';
    
    -- Get columns for this table
    FOR column_rec IN
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = table_rec.table_name
      ORDER BY ordinal_position
    LOOP
      result := result || '  • ' || column_rec.column_name || 
                ' (' || column_rec.data_type || ')';
      
      IF column_rec.is_nullable = 'NO' THEN
        result := result || ' NOT NULL';
      END IF;
      
      IF column_rec.column_default IS NOT NULL THEN
        result := result || ' DEFAULT ' || column_rec.column_default;
      END IF;
      
      result := result || E'\n';
    END LOOP;
    
    result := result || E'\n';
  END LOOP;
  
  -- Add some context about the Lightning platform
  result := result || E'\n=== Lightning Platform Context ===\n';
  result := result || 'This is a Lightning Network SaaS platform for businesses to:' || E'\n';
  result := result || '• Manage Lightning nodes and payment channels' || E'\n';
  result := result || '• Track Bitcoin payments and invoices' || E'\n';
  result := result || '• Run AI-powered business automation' || E'\n';
  result := result || '• Analyze email campaign performance' || E'\n';
  result := result || '• Monitor node performance and earnings' || E'\n';
  
  RETURN result;
END;
$$; 