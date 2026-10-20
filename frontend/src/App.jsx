import { useEffect, useState } from 'react'

export default function App() {
  const [message, setMessage] = useState('Connecting to the server...')

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/health')
      .then((response) => response.json())
      .then((data) => setMessage(`Server says: ${data.status}`))
      .catch(() => setMessage('Could not reach the server'))
  }, [])

  return (
    <main>
      <h1>Unispace</h1>
      <p>{message}</p>
    </main>
  )
}