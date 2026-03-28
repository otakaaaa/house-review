import BottomNav from './BottomNav'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-2xl px-4 pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
