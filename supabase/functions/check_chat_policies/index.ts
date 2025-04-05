
// This edge function checks for missing RLS policies that might affect chat functionality
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const { authorization } = req.headers
    
    // Check if authorization header is missing
    if (!authorization) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing authorization header',
          success: false
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 401
        }
      )
    }
    
    // Create a Supabase client with the auth header
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authorization } } }
    )

    // Check for RLS policies
    const { data: conversationPolicies, error: convError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'conversations')
    
    const { data: participantPolicies, error: partError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'conversation_participants')
    
    const { data: messagePolicies, error: msgError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'messages')

    if (convError || partError || msgError) {
      throw new Error('Error checking policies')
    }

    // Analyze missing policies
    const missingPolicies = []
    
    // Check for conversation policies
    const hasConvSelect = conversationPolicies.some(p => p.cmd === 'SELECT')
    const hasConvInsert = conversationPolicies.some(p => p.cmd === 'INSERT')
    if (!hasConvSelect) {
      missingPolicies.push('SELECT on conversations')
    }
    if (!hasConvInsert) {
      missingPolicies.push('INSERT on conversations')
    }
    
    // Check for participants policies
    const hasPartSelect = participantPolicies.some(p => p.cmd === 'SELECT')
    const hasPartInsert = participantPolicies.some(p => p.cmd === 'INSERT')
    if (!hasPartSelect) {
      missingPolicies.push('SELECT on conversation_participants')
    }
    if (!hasPartInsert) {
      missingPolicies.push('INSERT on conversation_participants')
    }
    
    // Check for message policies
    const hasMsgSelect = messagePolicies.some(p => p.cmd === 'SELECT')
    const hasMsgInsert = messagePolicies.some(p => p.cmd === 'INSERT')
    if (!hasMsgSelect) {
      missingPolicies.push('SELECT on messages')
    }
    if (!hasMsgInsert) {
      missingPolicies.push('INSERT on messages')
    }

    return new Response(
      JSON.stringify({
        conversationPolicies,
        participantPolicies,
        messagePolicies,
        missingPolicies,
        success: true
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})
