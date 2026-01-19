// Add a user as admin
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hkktofxvgrxfkaixcowm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhra3RvZnh2Z3J4ZmthaXhjb3dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgwMjQyMiwiZXhwIjoyMDg0Mzc4NDIyfQ.fMWxkaaeNmybN86Fq-vKpxyyZSzO_iwmzD_e783jZH4'

const email = process.argv[2]
const role = process.argv[3] || 'super_admin'

if (!email) {
  console.log('Usage: node add-admin.mjs <email> [role]')
  console.log('Roles: admin, super_admin')
  process.exit(1)
}

console.log('Adding admin...')
console.log('Email:', email)
console.log('Role:', role)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addAdmin() {
  // List users to find by email
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('❌ Error listing users:', listError.message)
    return
  }
  
  const user = usersData.users.find(u => u.email === email)
  
  if (!user) {
    console.log('❌ User not found:', email)
    console.log('Available users:')
    usersData.users.forEach(u => console.log('  -', u.email))
    return
  }
  
  console.log('Found user:', user.id)
  
  // Add to admin_users table
  const { error: insertError } = await supabase
    .from('admin_users')
    .upsert({ 
      id: user.id, 
      role: role,
      created_at: new Date().toISOString()
    })
  
  if (insertError) {
    console.error('❌ Error adding admin:', insertError.message)
    return
  }
  
  console.log('✅ User added as', role + '!')
}

addAdmin()

