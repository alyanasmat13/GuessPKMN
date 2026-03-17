import React from 'react'
import Header from './frontend/Header'
import ImageCard from './frontend/ImageCard'
import GuessCard from './frontend/GuessCard'
import Timer from './frontend/Timer'
import GoogleLoginButton from './frontend/GoogleLoginButton'
import HeaderLogin from './frontend/HeaderLogin'

const App: React.FC = () => {
  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <div className="absolute top-4 right-4">
        <GoogleLoginButton />
      </div>
      <div className="flex flex-col items-center justify-center gap-20 w-full max-w-3xl p-4">
        <Timer />
        <div className="flex flex-col items-center gap-1 text-2xl">
          <HeaderLogin />
          <Header />
        </div>
        <ImageCard />
        <GuessCard />
      </div>
    </main>
  )
}

export default App
