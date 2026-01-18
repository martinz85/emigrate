import { Header } from '@/components/layout/Header'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen flex items-center justify-center pt-16">
        {children}
      </main>
    </>
  )
}



