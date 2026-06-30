import { cookies } from 'next/headers'

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false
  return token === process.env.ADMIN_TOKEN
}

export async function requireAdmin() {
  const isAdmin = await getAdminSession()
  if (!isAdmin) {
    throw new Error('Unauthorized')
  }
}
