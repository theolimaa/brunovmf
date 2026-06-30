import { redirect } from 'next/navigation'

// Redirecionando para a nova rota /admin/clientes
export default function LeadsPage() {
  redirect('/admin/clientes')
}
