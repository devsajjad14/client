import { Protected } from '@/components/auth/protected'

export default function DashboardPage() {
  return (
    <Protected>
      <div>Protected Dashboard</div>
    </Protected>
  )
}
