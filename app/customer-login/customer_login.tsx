'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function CustomerLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Add SQL database authentication logic here
  }

  const handleGoogleLogin = async () => {
    // Add Google OAuth logic here
  }

  return (
    <>
      <header className="bg-dark-background text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <img className="h-10"></img>
            <span className="text-2xl font-bold">Panda Express</span>
          </Link>
          <Link href="/employee-login">
          <Button className="text-white bg-panda-red hover:text-[#DC0032] hover:bg-white">
            Employee Login
          </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <h1 className="text-4xl font-bold text-white mb-8">We Wok For You</h1>
          <div className="w-full max-w-md bg-[#DC0032] rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">Customer Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
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
              <Link href="/customer-view">
                <Button className="w-full mt-6 bg-[#2D2D2D] text-white hover:bg-[#404040]">Login</Button>
              </Link>
            </form>
            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-white text-gray-600 hover:bg-gray-100"
            >
              Sign in with Google
            </Button>
          </div>
          <Button className="mt-4 bg-[#DC0032] text-white hover:bg-[#b8002a]">
            Click para Español
          </Button>
        </div>
      </main>
    </>
  )
}