'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EmployeeLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleGoogleLogin = async () => {
    // TODO: Google OAuth logic here
  }

  return (
    <>
      <header className="bg-[#DC0032] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
             <img className="h-10"></img>
            <span className="text-2xl font-bold">Panda Express</span>
          </Link>
          <Button asChild variant="ghost" className="text-white hover:text-[#DC0032] hover:bg-white">
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
                <Link href="manager-view">
                  <Button className="bg-[#2D2D2D] text-white w-40 hover:bg-[#404040]">
                    Manager Login
                  </Button>
                </Link>
                <Link href="cashier-view">
                  <Button className="bg-[#2D2D2D] text-white w-40 hover:bg-[#404040]">
                    Cashier Login
                  </Button>
                </Link>
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