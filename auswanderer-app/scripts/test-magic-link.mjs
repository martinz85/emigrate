// Test Magic Link via Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hkktofxvgrxfkaixcowm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhra3RvZnh2Z3J4ZmthaXhjb3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDI0MjIsImV4cCI6MjA4NDM3ODQyMn0.cZ-HNWr09HihiHXsDIEXbCfLlGPYAQVC18SAl5pQZYY'

const email = process.argv[2] || 'mm.zaremski@gmail.com'

console.log('Testing Magic Link...')
console.log('Supabase URL:', supabaseUrl)
console.log('Email:', email)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testMagicLink() {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'http://localhost:3003/auth/callback',
    },
  })

  if (error) {
    console.error('❌ Error:', error.message)
    console.error('Error details:', JSON.stringify(error, null, 2))
  } else {
    console.log('✅ Success! Check your email.')
    console.log('Response:', JSON.stringify(data, null, 2))
  }
}

testMagicLink()

