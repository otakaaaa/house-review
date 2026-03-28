import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import PropertyListPage from '@/pages/PropertyListPage'
import PropertyNewPage from '@/pages/PropertyNewPage'
import PropertyDetailPage from '@/pages/PropertyDetailPage'
import PropertyEditPage from '@/pages/PropertyEditPage'
import EvaluationPage from '@/pages/EvaluationPage'
import ComparePage from '@/pages/ComparePage'

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<PropertyListPage />} />
          <Route path="/properties/new" element={<PropertyNewPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/properties/:id/edit" element={<PropertyEditPage />} />
          <Route path="/properties/:id/evaluation" element={<EvaluationPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
        <Toaster />
      </TooltipProvider>
    </BrowserRouter>
  )
}
