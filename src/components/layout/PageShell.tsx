import { Outlet } from 'react-router-dom'
import { Menu, X, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { FilterBar } from './FilterBar'
import { useStore } from '@/store'

export function PageShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { syncStatus, refreshData } = useStore()

  return (
    <div className="flex min-h-screen bg-page-bg">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 h-screen overflow-hidden">
          <Sidebar
            dataMode={syncStatus.dataMode}
            facilityCount={syncStatus.facilityCount}
            lastSync={syncStatus.lastSync}
          />
        </div>
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            <Sidebar
              dataMode={syncStatus.dataMode}
              facilityCount={syncStatus.facilityCount}
              lastSync={syncStatus.lastSync}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-white/90 px-4 py-3 backdrop-blur">
          <button
            className="lg:hidden rounded-lg p-1.5 hover:bg-slate-100"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="min-w-0 flex-1">
            <FilterBar />
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-slate-50"
            title="Refresh data"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        {/* Data mode banner */}
        {syncStatus.dataMode !== 'production' && (
          <div className={`px-4 py-1.5 text-center text-xs font-medium ${
            syncStatus.dataMode === 'development'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-blue-50 text-blue-700'
          }`}>
            {syncStatus.dataMode === 'development'
              ? 'DEVELOPMENT MODE — Dummy data'
              : 'KOBO CONNECTED — Test submissions'}
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
