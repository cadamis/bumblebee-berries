import Link from "next/link";
import BumblebeeLogo from "@/components/BumblebeeLogo";
import { requireSetupComplete } from "@/lib/auth";

export default function HomePage() {
  requireSetupComplete();
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="bg-honey-400 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BumblebeeLogo size={40} />
            <span className="font-display text-xl font-bold text-honey-900">
              Bumblebee Berries
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden bg-gradient-to-br from-honey-100 via-berry-50 to-honey-200 min-h-[600px]">
        {/* Background raspberry illustration */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
          <RaspberryBasketIllustration className="w-[700px] h-[700px]" />
        </div>

        <div className="relative z-10 text-center px-6 py-20 max-w-3xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/80 rounded-full p-4 shadow-xl ring-4 ring-honey-300">
              <BumblebeeLogo size={100} />
            </div>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold text-berry-800 drop-shadow-sm mb-4">
            Bumblebee Berries
          </h1>
          <p className="text-xl md:text-2xl text-berry-700 mb-3 font-display italic">
            Fresh-picked raspberries, straight from our garden.
          </p>
          <p className="text-base text-gray-600 mb-10 max-w-xl mx-auto">
            We grow and hand-pick small batches of sweet raspberries right here
            in the neighborhood. Reserve your cup for pickup on a date that works
            for you.
          </p>

          <Link
            href="/order"
            className="inline-block bg-berry-600 hover:bg-berry-700 text-white font-semibold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Order Your Raspberries
          </Link>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-white border-t border-honey-100 py-14">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <FeatureCard
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/raspberry.png" alt="Raspberries" className="w-14 h-14 object-contain" />
            }
            title="One product, done right"
            body="We grow one thing — fresh raspberries — and we grow it well. No shortcuts."
          />
          <FeatureCard
            icon="📅"
            title="Pick your day"
            body="Choose a pickup date that suits you. We'll have your cup ready and waiting."
          />
          <FeatureCard
            icon="🏡"
            title="Truly local"
            body="Grown just around the corner. Picked the same day you pick them up."
          />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-berry-700 text-white py-12 text-center px-6">
        <h2 className="font-display text-3xl font-bold mb-4">
          Ready for the best raspberries you've ever tasted?
        </h2>
        <Link
          href="/order"
          className="inline-block bg-white text-berry-700 font-semibold text-lg px-10 py-3 rounded-full shadow hover:bg-berry-50 transition-colors"
        >
          Reserve a Cup Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-honey-900 text-honey-200 text-center text-sm py-6 px-4">
        <p>© {new Date().getFullYear()} Bumblebee Berries. All rights reserved.</p>
        <p className="mt-1">
          <Link href="/admin/login" className="underline hover:text-white">
            Admin Login
          </Link>
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-5xl flex items-center justify-center">{icon}</span>
      <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
    </div>
  );
}


function RaspberryBasketIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Basket */}
      <ellipse cx="200" cy="280" rx="130" ry="30" fill="#d97706" />
      <path
        d="M70 200 Q70 310 200 310 Q330 310 330 200 L310 180 Q310 290 200 290 Q90 290 90 180Z"
        fill="#b45309"
      />
      <path d="M70 200 Q200 230 330 200 Q200 170 70 200Z" fill="#d97706" />

      {/* Basket weave lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M80 ${210 + i * 20} Q200 ${235 + i * 20} 320 ${210 + i * 20}`}
          stroke="#92400e"
          strokeWidth="2"
          fill="none"
        />
      ))}

      {/* Raspberries */}
      {[
        [160, 170], [200, 155], [240, 165], [175, 145], [225, 140],
        [145, 155], [255, 155], [200, 130],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="18" fill="#db2777" />
          {/* Drupelets */}
          {[
            [-6, -6], [0, -8], [6, -6],
            [-8, 0], [0, 0], [8, 0],
            [-6, 6], [0, 8], [6, 6],
          ].map(([dx, dy], j) => (
            <circle
              key={j}
              cx={(cx ?? 0) + dx}
              cy={(cy ?? 0) + dy}
              r="5"
              fill="#be185d"
              stroke="#9d174d"
              strokeWidth="0.5"
            />
          ))}
          <circle cx={(cx ?? 0) - 4} cy={(cy ?? 0) - 4} r="2" fill="#fce7f3" opacity="0.5" />
          {/* Leaf */}
          <path
            d={`M${cx} ${(cy ?? 0) - 18} Q${(cx ?? 0) + 8} ${(cy ?? 0) - 26} ${(cx ?? 0) + 6} ${(cy ?? 0) - 20}`}
            fill="#16a34a"
          />
        </g>
      ))}

      {/* Handle */}
      <path
        d="M130 180 Q130 100 200 100 Q270 100 270 180"
        stroke="#b45309"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
