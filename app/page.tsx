import Hero from "@/components/sections/hero"
import Problem from "@/components/sections/problem"
import Solution from "@/components/sections/solution"
import ProductTiers from "@/components/sections/product-tiers"
import HowItWorks from "@/components/sections/how-it-works"
import Ecosystem from "@/components/sections/ecosystem"
import Comparison from "@/components/sections/comparison"
import FAQ from "@/components/sections/faq"
import FinalCTA from "@/components/sections/final-cta"
import Footer from "@/components/sections/footer"

export default function Home() {
  return (
    <main className="w-full">
      <Hero />
      <Problem />
      <Solution />
      <ProductTiers />
      <HowItWorks />
      <Ecosystem />
      <Comparison />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
