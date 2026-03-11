import WaitlistForm from "@/components/ui/waitlist-form"

export default function FinalCTA() {
  return (
    <section id="final-cta" className="w-full px-6 py-20 md:py-32 bg-gradient-to-b from-background to-card-bg/50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-balance mb-8">
          Automate Your Blinds — Without Replacing Them.
        </h2>

        <p className="text-lg text-secondary max-w-2xl mx-auto mb-4">
          TiltForge is currently in Alpha. We're not taking orders yet — but we want to
          hear from people who care how things work.
        </p>
        <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10">
          Join the waitlist to follow development, give early feedback, and be first to
          know when units are ready.
        </p>

        <div className="flex justify-center">
          <WaitlistForm
            variant="section"
            buttonText="Join the Waitlist"
            successMessage="You're in. We'll keep you posted as TiltForge comes together."
          />
        </div>
      </div>
    </section>
  )
}