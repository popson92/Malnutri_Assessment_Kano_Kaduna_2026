import { Outlet, useLocation } from 'react-router-dom'
import { Menu, X, RefreshCw, User } from 'lucide-react'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { FilterBar } from './FilterBar'
import { useStore } from '@/store'
import { NAV_ITEMS } from '@/config/nav'

export function PageShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { syncStatus, refreshData } = useStore()
  const location = useLocation()

  const currentPage = NAV_ITEMS.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )

  const modeBanner = syncStatus.dataMode !== 'production'
  const bannerText = syncStatus.dataMode === 'development'
    ? 'Development Mode — Synthetic data'
    : 'Pilot Data — KoboToolbox test submissions'

  return (
    <div className="flex min-h-screen bg-page-bg">
      {/* Desktop sidebar */}
      <aside className={`hidden shrink-0 lg:block transition-[width] duration-200 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <Sidebar
            dataMode={syncStatus.dataMode}
            facilityCount={syncStatus.facilityCount}
            lastSync={syncStatus.lastSync}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          />
        </div>
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 shadow-xl">
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
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-white px-4 py-2.5">
          <button
            className="lg:hidden rounded-lg p-1.5 hover:bg-pale-blue text-muted"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Page title + breadcrumb */}
          <div className="min-w-0 flex-1 flex items-center gap-3">
            {currentPage && (
              <h2 className="text-sm font-semibold text-ink truncate hidden sm:block">
                {currentPage.label}
              </h2>
            )}
            <div className="hidden md:block flex-1">
              <FilterBar />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {syncStatus.lastSync && (
              <span className="hidden lg:inline text-[10px] text-muted">
                {new Date(syncStatus.lastSync).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refreshData}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:bg-pale-blue hover:text-ink transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pale-blue text-primary">
              <User size={15} />
            </div>
          </div>
        </header>

        {/* Mobile filter bar */}
        <div className="md:hidden border-b border-border bg-white px-4 py-2">
          <FilterBar />
        </div>

        {/* Data mode banner */}
        {modeBanner && (
          <div className={`px-4 py-1 text-center text-[11px] font-medium ${
            syncStatus.dataMode === 'development'
              ? 'bg-amber-50 text-amber-700 border-b border-amber-200'
              : 'bg-blue-50 text-blue-700 border-b border-blue-200'
          }`}>
            {bannerText}
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
