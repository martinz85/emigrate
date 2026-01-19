import { createAdminClient } from '@/lib/supabase/server'
import { UserTable } from './UserTable'

export const metadata = {
  title: 'User-Verwaltung | Admin',
}

export default async function UsersPage() {
  const supabase = createAdminClient()

  // Fetch users with analysis count
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      created_at,
      subscription_tier
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch analysis counts separately
  const { data: analysisCounts } = await supabase
    .from('analyses')
    .select('user_id')
    .not('user_id', 'is', null)

  // Count analyses per user
  const countMap: Record<string, number> = {}
  analysisCounts?.forEach(a => {
    countMap[a.user_id] = (countMap[a.user_id] || 0) + 1
  })

  const usersWithCounts = users?.map(user => ({
    ...user,
    analysisCount: countMap[user.id] || 0,
  })) || []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">User-Verwaltung</h1>
        <p className="text-slate-500 mt-1">
          Verwalte User und erfülle DSGVO-Anfragen (Art. 17: Recht auf Löschung)
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Fehler beim Laden der User: {error.message}
        </div>
      ) : (
        <UserTable users={usersWithCounts} />
      )}
    </div>
  )
}

