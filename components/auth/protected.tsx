import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function Protected({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  return <>{children}</>
}
