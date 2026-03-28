import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import PropertyListPage from '@/pages/PropertyListPage'
import PropertyNewPage from '@/pages/PropertyNewPage'
import PropertyDetailPage from '@/pages/PropertyDetailPage'
import PropertyEditPage from '@/pages/PropertyEditPage'
import EvaluationPage from '@/pages/EvaluationPage'
import ComparePage from '@/pages/ComparePage'
import MigrationDialog, { isMigrationAsked, markMigrationAsked } from '@/components/auth/MigrationDialog'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/lib/db'

function AppContent() {
  useAuth()
  const { user } = useAuthStore()
  const [migrationOpen, setMigrationOpen] = useState(false)
  const [localCount, setLocalCount] = useState(0)

  useEffect(() => {
    if (!user || isMigrationAsked()) return

    db.properties.count().then((count) => {
      if (count > 0) {
        setLocalCount(count)
        setMigrationOpen(true)
      } else {
        // ローカルデータがなければ移行不要、フラグをセットして二度と聞かない
        markMigrationAsked()
      }
    })
  }, [user])

  return (
    <>
      <Routes>
        <Route path="/" element={<PropertyListPage />} />
        <Route path="/properties/new" element={<PropertyNewPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/properties/:id/edit" element={<PropertyEditPage />} />
        <Route path="/properties/:id/evaluation" element={<EvaluationPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
      <Toaster />
      {user && (
        <MigrationDialog
          open={migrationOpen}
          onOpenChange={setMigrationOpen}
          userId={user.id}
          localCount={localCount}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </BrowserRouter>
  )
}
