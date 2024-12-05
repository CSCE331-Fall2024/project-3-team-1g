'use client'

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import WeatherBox from './WeatherBox' // Import the WeatherBox component

export default function CustomerLogin() {
  const temp_id = '540665723185-hdqdi6ak0tf5bmc699ven4a34okdacru.apps.googleusercontent.com'
  const backendUrl = 'https://backend-project-3-team-1g-production.up.railway.app'
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch(new URL('/customer-login', backendUrl), {
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
      localStorage.setItem('customerName', data.name);
      
      alert(data.message)
      router.push('/customer-view') 
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    }
  }

  const handleGoogleLoginSuccess = (response: any) => {
    console.log(response);
    if (response && response.credential) {
      const decodedToken = JSON.parse(atob(response.credential.split('.')[1]));
      const username = decodedToken.name; 
      localStorage.setItem('customerName', username);
      router.push('/customer-view')
    } else {
      console.error('Google login response does not contain the expected profile information');
    }
  };

  const handleGoogleLoginFailure = () => {
    console.error('Google login failed');
    // Handle Google login failure
  };

  const TRANSLATE_API_KEY = 'AIzaSyAzT9821UMgFfHS6UYGqEj0OZxOAzJN6RA';
  const [translatedText, setTranslatedText] = useState({
    header: 'We Wok For You',
    login: 'Customer Login',
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    googleLoginError: 'Google login failed'
  })
  const [language, setLanguage] = useState("en") //track language (English by default)

  //function to translate text
  const translateText = async (text: string, targetLanguage: string) => {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
        }),
      });

      const data = await response.json();
      const translated = data.data.translations[0].translatedText;
      return translated;
    } catch (error) {
      console.error("Error translating text:", error);
    }
  };

  const handleTranslateToSpanish = async () => {
    setLanguage(language === "en" ? "es" : "en");
  };

  useEffect(() => {
    const translateAllText = async () => {
      const newText = { ...translatedText };

      if (language === "es") {
        newText.header = await translateText('We Wok For You', 'es');
        newText.login = await translateText('Customer Login', 'es');
        newText.username = await translateText('Username', 'es');
        newText.password = await translateText('Password', 'es');
        newText.loginButton = await translateText('Login', 'es');
        newText.googleLoginError = await translateText('Google login failed', 'es');
      } else {
        // Keep the original English text
        newText.header = 'We Wok For You';
        newText.login = 'Customer Login';
        newText.username = 'Username';
        newText.password = 'Password';
        newText.loginButton = 'Login';
        newText.googleLoginError = 'Google login failed';
      }

      setTranslatedText(newText); // Update the state with the translated text
    };

    translateAllText();
  }, [language]); // Trigger translation whenever the language changes

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || temp_id}>
      <header className="bg-dark-background text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <img className="h-10" alt="Logo" />
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
          <h1 className="text-4xl font-bold text-white mb-8">
            {translatedText.header}
          </h1>
          <WeatherBox /> {/* Use the WeatherBox component */}
          <div className="w-full max-w-md bg-[#DC0032] rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">
              {translatedText.login}
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  {translatedText.username}
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
                  {translatedText.password}
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
              {error && <p className="text-red-500">{translatedText.googleLoginError}</p>}
              <Button type="submit" className="w-full mt-6 bg-[#2D2D2D] text-white hover:bg-[#404040]">
                {translatedText.loginButton}
              </Button>
            </form>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
            />
          </div>
          <Button className="mt-4 bg-[#DC0032] text-white hover:bg-[#b8002a]"
                  onClick={handleTranslateToSpanish}>
            {language === "en" ? "Click para Español" : "Back to English"}
          </Button>
        </div>
      </main>
    </GoogleOAuthProvider>
  )
}