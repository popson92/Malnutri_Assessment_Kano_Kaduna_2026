import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from '@/store/DataProvider'
import { PageShell } from '@/components/layout/PageShell'

const Overview = lazy(() => import('@/pages/Overview'))
const AssessmentFindings = lazy(() => import('@/pages/AssessmentFindings'))
const FieldworkProgress = lazy(() => import('@/pages/FieldworkProgress'))
const CaregiverInterviews = lazy(() => import('@/pages/CaregiverInterviews'))
const GeographicOverview = lazy(() => import('@/pages/GeographicOverview'))
const DataQuality = lazy(() => import('@/pages/DataQuality'))
const RegisterVerification = lazy(() => import('@/pages/RegisterVerification'))
const RutfStock = lazy(() => import('@/pages/RutfStock'))
const HealthWorkerPerspectives = lazy(() => import('@/pages/HealthWorkerPerspectives'))
const FacilityExplorer = lazy(() => import('@/pages/FacilityExplorer'))
const LgaDeepDive = lazy(() => import('@/pages/LgaDeepDive'))
const IssuesFollowUp = lazy(() => import('@/pages/IssuesFollowUp'))
const DataSettings = lazy(() => import('@/pages/DataSettings'))

function PageLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

const wrap = (el: React.ReactNode) => <Suspense fallback={<PageLoading />}>{el}</Suspense>

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PageShell />}>
            <Route index element={wrap(<Overview />)} />
            <Route path="/findings" element={wrap(<AssessmentFindings />)} />
            <Route path="/fieldwork" element={wrap(<FieldworkProgress />)} />
            <Route path="/caregivers" element={wrap(<CaregiverInterviews />)} />
            <Route path="/geographic" element={wrap(<GeographicOverview />)} />
            <Route path="/data-quality" element={wrap(<DataQuality />)} />
            <Route path="/register" element={wrap(<RegisterVerification />)} />
            <Route path="/rutf" element={wrap(<RutfStock />)} />
            <Route path="/health-workers" element={wrap(<HealthWorkerPerspectives />)} />
            <Route path="/facility" element={wrap(<FacilityExplorer />)} />
            <Route path="/lga" element={wrap(<LgaDeepDive />)} />
            <Route path="/flags" element={wrap(<IssuesFollowUp />)} />
            <Route path="/settings" element={wrap(<DataSettings />)} />
            {/* Redirect old routes */}
            <Route path="/issues" element={<Navigate to="/flags" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}
