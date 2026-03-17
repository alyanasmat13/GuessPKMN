import React from 'react'
import Header from './frontend/Header'
import ImageCard from './frontend/ImageCard'
import GuessCard from './frontend/GuessCard'
import Timer from './frontend/Timer'
import GoogleLoginButton from './frontend/GoogleLoginButton'
import HeaderLogin from './frontend/HeaderLogin'

const App: React.FC = () => {
  return (
    <main className="relative min-h-screen flex flex-col items-center py-8 px-4">
      {/* Top bar */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8 animate-fade-in-up">
        <Timer />
        <GoogleLoginButton />
      </div>

      {/* Main card */}
      <div className="glass-card w-full max-w-xl p-8 flex flex-col items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <HeaderLogin />
          <Header />
        </div>

        {/* Pokemon image */}
        <div className="my-2">
          <ImageCard />
        </div>

        {/* Guess form */}
        <GuessCard />
      </div>

      {/* Footer credit */}
      <p className="mt-8 text-xs text-white/30 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        Powered by PokéAPI
      </p>
    </main>
  )
}

export default App
