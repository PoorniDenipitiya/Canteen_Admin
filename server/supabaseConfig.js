const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ucfpbbcfacgrehcoscar.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZnBiYmNmYWNncmVoY29zY2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzM3NzYsImV4cCI6MjA1NjE0OTc3Nn0.X1bJ7CGFHnItIY4MEUj0bpKrWQvUp7H893JswNlPg-o';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };