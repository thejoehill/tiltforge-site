export default function Footer() {
  return (
    <footer className="w-full px-6 py-12 border-t border-border bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-secondary text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Join the Beta
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Maker Kit
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Design Files (STLs)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Replacement Parts
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-secondary text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  About TiltForge
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Design Philosophy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-secondary text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Installation Guides
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Compatibility Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-secondary text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Warranty & Disclaimers
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-secondary text-sm max-w-xl">
            TiltForge © 2026 — Built to respect the hardware you already own.
            Designed to be repaired, modified, and understood.
          </p>

          <div className="flex gap-6 mt-6 md:mt-0">
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              GitHub
            </a>
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              Discord
            </a>
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              Updates
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}