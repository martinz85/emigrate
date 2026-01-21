import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { FounderStory } from '@/components/landing/FounderStory'
import { PricingSection } from '@/components/landing/PricingSection'
import { FAQSection } from '@/components/landing/FAQSection'

// Disable caching for this page to always show fresh content
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      <Header />
      <HeroSection />
      <HowItWorks />
      <FounderStory />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  )
}

