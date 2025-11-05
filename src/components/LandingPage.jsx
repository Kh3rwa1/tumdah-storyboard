import { Sparkles, Film, Wand2, Zap, Layout, Rocket, Check, ArrowRight, Star } from 'lucide-react';

export default function LandingPage({ onStart }) {
  const benefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Generation",
      description: "Create 9 professional shots in seconds with AI-powered scene generation"
    },
    {
      icon: <Layout className="w-8 h-8" />,
      title: "Perfect Composition",
      description: "Every shot follows cinematic rules with optimal framing and angles"
    },
    {
      icon: <Wand2 className="w-8 h-8" />,
      title: "Style Consistency",
      description: "Maintain visual coherence across all scenes with style reference control"
    },
    {
      icon: <Film className="w-8 h-8" />,
      title: "Character Preservation",
      description: "Keep your subjects recognizable throughout the entire storyboard"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Export Ready",
      description: "Download shots in multiple aspect ratios ready for production"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "No Experience Required",
      description: "Simple 3-step process anyone can master in minutes"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Character",
      description: "Add your main subject or character reference image"
    },
    {
      number: "02",
      title: "Choose Style",
      description: "Select a visual style or upload your own style reference"
    },
    {
      number: "03",
      title: "Generate Scene",
      description: "Describe the action and get 9 cinematic shots instantly"
    }
  ];

  return (
    <div className="relative min-h-screen">
      {/* Floating Bubbles */}
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>

      {/* Navbar */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images (1).png" alt="Tumdah Logo" className="w-10 h-10" />
              <span className="text-xl font-bold text-contrast" style={{fontFamily: 'Poppins'}}>Tumdah AI Studio</span>
            </div>
            <button
              onClick={onStart}
              className="glass-button px-6 py-3 flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card-strong p-12 lg:p-20 text-center animate-fadeIn">
            <div className="inline-block mb-6 px-6 py-2 glass-card rounded-full">
              <span className="text-sm font-semibold text-contrast flex items-center gap-2">
                <Star className="w-4 h-4 fill-current" />
                Generate Professional Storyboards in Seconds
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black mb-6 text-contrast" style={{fontFamily: 'Poppins'}}>
              Turn Your Vision Into
              <br />
              <span className="gradient-text">Cinematic Scenes</span>
            </h1>

            <p className="text-xl lg:text-2xl text-contrast max-w-3xl mx-auto mb-10 font-medium opacity-90">
              Create stunning 9-shot storyboards for music videos, films, and commercials.
              AI-powered scene generation that maintains character consistency and style.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onStart}
                className="glass-button px-8 py-4 text-lg font-bold flex items-center gap-3 animate-glow"
              >
                <Sparkles className="w-5 h-5" />
                Start Creating Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mock Screenshot Placeholder */}
            <div className="glass-card p-8 max-w-5xl mx-auto">
              <div className="aspect-video frosted-glass rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Film className="w-24 h-24 mx-auto mb-4 text-[#10B981] opacity-50" />
                  <p className="text-lg font-semibold text-contrast opacity-70">Product Screenshot</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section (Optional - Social Proof) */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8 text-center">
            <p className="text-sm font-semibold text-contrast opacity-70 mb-6">TRUSTED BY CREATIVES WORLDWIDE</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-24 h-12 frosted-glass rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-contrast" style={{fontFamily: 'Poppins'}}>
              Why Choose Tumdah AI Studio?
            </h2>
            <p className="text-xl text-contrast opacity-80 max-w-2xl mx-auto">
              Focus on how it helps you create better content, not just features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="glass-card p-8 animate-fadeIn hover:scale-105 transition-transform"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="inline-flex p-4 glass-button rounded-2xl mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-contrast" style={{fontFamily: 'Poppins'}}>
                  {benefit.title}
                </h3>
                <p className="text-contrast opacity-80 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card-strong p-12 lg:p-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black mb-4 text-contrast" style={{fontFamily: 'Poppins'}}>
                Get Started in 3 Simple Steps
              </h2>
              <p className="text-xl text-contrast opacity-80">
                From concept to cinematic storyboard in minutes
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="glass-card p-8 text-center animate-slideUp"
                  style={{animationDelay: `${index * 0.15}s`}}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 glass-button rounded-2xl mb-6">
                    <span className="text-3xl font-black gradient-text">{step.number}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-contrast" style={{fontFamily: 'Poppins'}}>
                    {step.title}
                  </h3>
                  <p className="text-contrast opacity-80 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-contrast" style={{fontFamily: 'Poppins'}}>
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-contrast opacity-70 mb-8">
              No contracts. No surprise fees.
            </p>

            {/* Monthly/Yearly Toggle */}
            <div className="inline-flex glass-card p-1 rounded-full">
              <button className="px-6 py-2 glass-button rounded-full text-sm font-semibold">
                MONTHLY
              </button>
              <button className="px-6 py-2 rounded-full text-sm font-semibold text-contrast opacity-70 hover:opacity-100 transition-opacity">
                YEARLY
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-center">
            {/* Base Plan */}
            <div className="glass-card p-8 h-full">
              <div className="mb-6">
                <div className="text-5xl font-black text-contrast mb-1">$80</div>
                <div className="text-sm text-contrast opacity-70">/month</div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-contrast">Base</h3>
              <p className="text-sm text-contrast opacity-70 mb-6">
                For most businesses that want to optimize web queries
              </p>
              <ul className="space-y-3 mb-8">
                {['All limited links', 'Own analytics platform', 'Chat support', 'Optimize hashtags', 'Unlimited users'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-contrast">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full glass-card px-6 py-3 font-semibold text-contrast hover:glass-button transition-all">
                Downgrade
              </button>
            </div>

            {/* Pro Plan - Featured */}
            <div className="relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="glass-button px-4 py-1 text-xs font-bold uppercase tracking-wide">
                  MOST POPULAR
                </div>
              </div>
              <div className="glass-button p-10 h-full transform lg:scale-105">
                <div className="mb-6">
                  <div className="text-6xl font-black text-white mb-1">$120</div>
                  <div className="text-sm text-white opacity-90">/month</div>
                </div>
                <h3 className="text-3xl font-bold mb-2 text-white">Pro</h3>
                <p className="text-sm text-white opacity-90 mb-8">
                  For most businesses that want to optimize web queries
                </p>
                <ul className="space-y-4 mb-10">
                  {['All limited links', 'Own analytics platform', 'Chat support', 'Optimize hashtags', 'Unlimited users'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-white">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-white text-[#10B981] px-6 py-4 rounded-2xl font-bold hover:shadow-lg transition-all">
                  Upgrade
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="glass-card p-8 h-full">
              <div className="mb-6">
                <div className="text-5xl font-black text-contrast mb-1">$260</div>
                <div className="text-sm text-contrast opacity-70">/month</div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-contrast">Enterprise</h3>
              <p className="text-sm text-contrast opacity-70 mb-6">
                For most businesses that want to optimize web queries
              </p>
              <ul className="space-y-3 mb-8">
                {['All limited links', 'Own analytics platform', 'Chat support', 'Optimize hashtags', 'Unlimited users'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-contrast">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full glass-card px-6 py-3 font-semibold text-contrast hover:glass-button transition-all">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card-strong p-12 lg:p-16 text-center animate-glow">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-contrast" style={{fontFamily: 'Poppins'}}>
              Ready to Create Amazing Scenes?
            </h2>
            <p className="text-xl text-contrast opacity-80 mb-10 max-w-2xl mx-auto">
              Join thousands of creators using Tumdah AI Studio to bring their visions to life
            </p>
            <button
              onClick={onStart}
              className="glass-button px-10 py-5 text-xl font-bold flex items-center gap-3 mx-auto"
            >
              <Sparkles className="w-6 h-6" />
              Start Creating Now
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Logo */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src="/images (1).png" alt="Tumdah Logo" className="w-8 h-8" />
                  <span className="text-lg font-bold text-contrast">Tumdah AI Studio</span>
                </div>
                <p className="text-sm text-contrast opacity-70">
                  Professional storyboard generation powered by AI
                </p>
              </div>

              {/* Menu */}
              <div>
                <h4 className="font-bold mb-4 text-contrast">Product</h4>
                <ul className="space-y-2 text-sm text-contrast opacity-70">
                  <li><a href="#" className="hover:opacity-100">Features</a></li>
                  <li><a href="#" className="hover:opacity-100">Pricing</a></li>
                  <li><a href="#" className="hover:opacity-100">Examples</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-bold mb-4 text-contrast">Legal</h4>
                <ul className="space-y-2 text-sm text-contrast opacity-70">
                  <li><a href="#" className="hover:opacity-100">Privacy Policy</a></li>
                  <li><a href="#" className="hover:opacity-100">Terms of Service</a></li>
                  <li><a href="#" className="hover:opacity-100">Cookie Policy</a></li>
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="font-bold mb-4 text-contrast">Newsletter</h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 glass-input px-4 py-2 text-sm"
                  />
                  <button className="glass-button px-4">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-6 text-center text-sm text-contrast opacity-70">
              <p>&copy; 2025 Tumdah AI Studio. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
