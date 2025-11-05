import { Film, Sparkles, Zap, ArrowRight, Stars, CheckCircle2, Palette, Wand2 } from 'lucide-react';

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0e6f6] via-[#e8f4f8] to-[#ffe8f0]">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-[#d4c5e8] to-[#b8d9e8] rounded-full blur-3xl opacity-40 animate-float"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-br from-[#c8e6d0] to-[#ffd4e8] rounded-full blur-3xl opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-[#ffd4c8] to-[#fff4d4] rounded-full blur-3xl opacity-30" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-flex items-center gap-3 px-6 py-3 clay-element bg-gradient-to-r from-[#d4c5e8] to-[#b8d9e8] mb-8 animate-pulse-soft">
              <Stars className="w-5 h-5 text-[#6b5b7b]" />
              <span className="text-sm font-semibold text-[#6b5b7b]">AI-Powered Storyboard Magic</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{fontFamily: 'Fredoka'}}>
              <span className="gradient-text">
                Create Dreamy
              </span>
              <br />
              <span className="text-[#6b5b7b]">Music Video Scenes</span>
            </h1>

            <p className="text-xl text-[#7a6a8a] mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Transform your creative vision into soft, cinematic 9-shot storyboards in seconds
            </p>

            <button
              onClick={onStart}
              className="group inline-flex items-center gap-3 px-10 py-5 clay-button bg-gradient-to-r from-[#d4c5e8] to-[#b8d9e8] text-[#5a4a6a] text-lg font-bold"
            >
              Get Started
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Sparkles className="w-8 h-8 text-[#a78bca]" />,
                title: "Define Characters",
                description: "Upload character references or choose from your cozy library",
                color: "from-[#d4c5e8] to-[#e8d4f0]"
              },
              {
                icon: <Palette className="w-8 h-8 text-[#7ec8e3]" />,
                title: "Set the Aesthetic",
                description: "Choose your visual style with dreamy lighting references",
                color: "from-[#b8d9e8] to-[#d4e8f0]"
              },
              {
                icon: <Film className="w-8 h-8 text-[#9bc9a8]" />,
                title: "Generate Scenes",
                description: "Create 9 professional cinematic shots instantly with AI",
                color: "from-[#c8e6d0] to-[#d4f0dc]"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`clay-card bg-gradient-to-br ${feature.color} p-8 animate-fadeIn`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex p-4 clay-element bg-white/50 rounded-2xl mb-4 animate-float" style={{animationDelay: `${index * 0.3}s`}}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#5a4a6a]" style={{fontFamily: 'Fredoka'}}>{feature.title}</h3>
                <p className="text-[#7a6a8a] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="clay-card bg-gradient-to-br from-[#ffd4e8] to-[#ffe8f0] p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 clay-element bg-white/50 rounded-full mb-4">
                <Wand2 className="w-8 h-8 text-[#d896b5]" />
              </div>
              <h2 className="text-3xl font-bold text-[#6b5b7b] mb-3" style={{fontFamily: 'Fredoka'}}>Everything You Need</h2>
              <p className="text-[#8a7a9a]">Professional features wrapped in softness</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "9 cinematic shot types",
                "Character consistency",
                "Style & vibe control",
                "Multiple aspect ratios",
                "Actor library management",
                "Instant generation"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 clay-element bg-white/30 rounded-2xl">
                  <div className="p-2 clay-element bg-gradient-to-br from-[#c8e6d0] to-[#d4f0dc] rounded-full flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#6b8b73]" />
                  </div>
                  <span className="text-[#6b5b7b] font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
