import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            PRO Dashboard wird in Epic 7 implementiert.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}



