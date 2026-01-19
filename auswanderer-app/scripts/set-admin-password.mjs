#!/usr/bin/env node

/**
 * Set password for an admin user
 * 
 * Usage: node scripts/set-admin-password.mjs <email> <password>
 * 
 * Example: node scripts/set-admin-password.mjs martin@infravivo.se MySecurePassword123
 */

import { createClient } from '@supabase/supabase-js'

// Load from environment or use defaults
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hkktofxvgrxfkaixcowm.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  console.log('\nUsage:')
  console.log('  SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/set-admin-password.mjs <email> <password>')
  process.exit(1)
}

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('❌ Email and password are required')
  console.log('\nUsage:')
  console.log('  SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/set-admin-password.mjs <email> <password>')
  console.log('\nExample:')
  console.log('  SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/set-admin-password.mjs martin@infravivo.se MySecurePassword123')
  process.exit(1)
}

if (password.length < 8) {
  console.error('❌ Password must be at least 8 characters')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setPassword() {
  console.log(`\n🔐 Setting password for: ${email}`)
  console.log(`📍 Supabase: ${SUPABASE_URL}`)

  try {
    // Find user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      throw listError
    }

    const user = users.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ User not found: ${email}`)
      console.log('\nAvailable users:')
      users.forEach(u => console.log(`  - ${u.email}`))
      process.exit(1)
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser) {
      console.error(`❌ User ${email} is not an admin`)
      process.exit(1)
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: password,
      email_confirm: true, // Ensure email is confirmed
    })

    if (updateError) {
      throw updateError
    }

    console.log(`\n✅ Password set successfully!`)
    console.log(`\n📝 Login details:`)
    console.log(`   URL: http://localhost:3003/admin/login`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: (as provided)`)
    console.log(`   Role: ${adminUser.role}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

setPassword()

