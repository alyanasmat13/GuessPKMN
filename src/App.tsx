import React from 'react'
import Header from './Header'
import ImageCard from './ImageCard'
import GuessCard from './GuessCard'
import Timer from './Timer'

const App: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-20 w-full max-w-3xl p-4">
        <Timer />
        <Header />
        <ImageCard />
        <GuessCard />
      </div>
    </main>
  )
}

export default App
