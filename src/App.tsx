import React from 'react'
import Header from './frontend/Header'
import ImageCard from './frontend/ImageCard'
import GuessCard from './frontend/GuessCard'
import Timer from './frontend/Timer'
import GoogleLoginButton from './frontend/GoogleLoginButton'
import HeaderLogin from './frontend/HeaderLogin'

const App: React.FC = () => {
  return (
    <main className="relative min-h-screen flex flex-col items-center py-6 px-6 sm:px-12 bg-[#0f111a]">
      {/* Top Header Row */}
      <div className="w-full flex justify-between items-start animate-fade-in-up gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-white/90">
            Who's That Pokémon?
          </h1>
          <p className="text-xs text-white/40">Powered by PokéAPI</p>
        </div>
        <div className="flex flex-col items-end gap-3 text-right">
          <GoogleLoginButton />
          <div className="flex flex-wrap items-center justify-end gap-4">
             <HeaderLogin />
             <Header />
          </div>
        </div>
      </div>

      {/* Main Focus */}
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-10 sm:gap-14 my-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <Timer />
        
        <div className="relative">
          <div className="absolute inset-0 bg-red-800/10 rounded-full blur-3xl w-64 h-64 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
          <ImageCard />
        </div>

        <GuessCard />
      </div>
    </main>
  )
}

export default App
