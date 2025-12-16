import Button from "@/components/ui/button"

export default function FinalCTA() {
  return (
    <section className="w-full px-6 py-20 md:py-32 bg-gradient-to-b from-background to-card-bg/50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-balance mb-8">Upgrade Your Blinds the Smart Way.</h2>

        <p className="text-lg text-secondary max-w-2xl mx-auto mb-10">
          Join thousands of homeowners building a more sustainable, repairable future.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary">Get TiltForge</Button>
          <Button variant="secondary">Build It Yourself</Button>
        </div>
      </div>
    </section>
  )
}
