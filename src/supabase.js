import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://shygktgabnyqispwsseq.supabase.co';

const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeWdrdGdhYm55cWlzcHdzc2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTQzNjYsImV4cCI6MjA3NjE3MDM2Nn0.bj8jGb62h7FTImmTK-UkMoc2qAJpLaDrBDJuSIVTi5o"
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

