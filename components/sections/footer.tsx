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
                  Buy Assembled
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Maker Kit
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  STLs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Parts Shop
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-secondary text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-secondary text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Docs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  API
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
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Warranty
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Returns
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-secondary text-sm">TiltForge © 2025 — Smart Blinds. Repairable. Affordable.</p>
          <div className="flex gap-6 mt-6 md:mt-0">
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              Twitter
            </a>
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              GitHub
            </a>
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
