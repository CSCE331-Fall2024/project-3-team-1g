'use client'

import { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import Image from 'next/image' // Import the Image component
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EmployeeLogin() {
  const backendUrl = 'https://backend-project-3-team-1g-production.up.railway.app'
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent, loginType: string) => {
    e.preventDefault()
    setError("")

    const url = loginType === 'manager' ? new URL('/manager-login', backendUrl) : new URL('/cashier-login', backendUrl);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login: username, password }), 
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }
      localStorage.setItem('employeeName', data.name);
      alert(data.message)

      const redirectPath = loginType === 'manager' ? '/manager-view' : '/cashier-view';
      router.push(redirectPath)

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    }
  }

  const handleGoogleLogin = async () => {
    // Google OAuth 
  }

  return (
    <>
      <header className="bg-[#DC0032] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1"> {}
              <Image src="/logo.png" alt="Logo" width={40} height={40} /> {}
            </div>
            <span className="text-2xl font-bold">Panda Express</span>
          </Link>
          <Button asChild variant="ghost" className="text-white bg-black hover:text-[#DC0032] hover:bg-white">
            <Link href="/customer-login">Customer Login</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="w-full max-w-md bg-[#DC0032] rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">Employee Login</h2>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#2D2D2D] border-none text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#2D2D2D] border-none text-white"
                  required
                />
              </div>
              <div className="flex gap-4 align-center">
                <div className="flex-1">
                  <Button
                    className="bg-[#2D2D2D] text-white w-full hover:bg-[#404040]"
                    onClick={(e) => handleLogin(e, 'manager')}
                  > 
                  Manager Login
                  </Button>
                </div>
                <div className="flex-1">
                  <Button
                    className="bg-[#2D2D2D] text-white w-full hover:bg-[#404040]"
                    onClick={(e) => handleLogin(e, 'cashier')}
                  >
                    Cashier Login
                  </Button>
                </div>
              </div>
            </form>
            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-white text-gray-600 hover:bg-gray-100"
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}