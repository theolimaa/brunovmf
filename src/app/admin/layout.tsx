import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 min-w-0">
        {children}
      </main>
    </div>
  )
}
