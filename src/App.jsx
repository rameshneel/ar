import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ARProductPlacement from './ARProductPlacement'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <ARProductPlacement></ARProductPlacement>
    </>
  )
}

export default App
