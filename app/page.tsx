'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LinkedInPost from '../components/LinkedInPost'

export default function Home() {
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  // Load initial likes from MongoDB
  useEffect(() => {
    const loadLikes = async () => {
      try {
        const response = await fetch('/api/like?postId=main-post')
        if (response.ok) {
          const data = await response.json()
          setLikes(data.likes || 0)
        }
      } catch (error) {
        console.error('Error loading likes:', error)
      }
    }
    loadLikes()
  }, [])

  const handleLike = async () => {
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: 'main-post' }),
      })

      if (response.ok) {
        const data = await response.json()
        setLikes(data.likes)
        setIsLiked(!isLiked)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = window.location.href
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* LinkedIn-like Post */}
        <div className="relative">
          <LinkedInPost
            onLike={handleLike}
            onShare={handleShare}
            likes={likes}
            isLiked={isLiked}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
