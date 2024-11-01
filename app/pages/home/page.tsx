'use client'

import { useAtom } from 'jotai'
import { useState, useEffect, cache } from 'react'
import { db } from '@/firebase'
import Image from 'next/image'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { Clock, Eye, NotebookText , Share2 } from 'lucide-react'
import Link from 'next/link'
import { userAtom, loadingAtom } from '@/store/userAtoms'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from '@/components/ui/button'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { BlogPost } from '@/types/types'
import { useToast } from "@/hooks/use-toast"



const fetchBlogPosts = cache(async (userEmail: string) => {
  const postsRef = collection(db, 'posts')
  const q = query(postsRef, where('authorId', '==', userEmail))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data() as Omit<BlogPost, 'id'>
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt,
      views: data.views || 0,
    }
  })
})



export default function HomePage() {
  const { toast } = useToast()
  const [user] = useAtom(userAtom)
  const [loading] = useAtom(loadingAtom)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    const loadBlogPosts = async () => {
      if (!user?.email) return
      setPostsLoading(true)

      try {
        const posts = await fetchBlogPosts(user.email)
        setBlogPosts(posts.map(post => ({
          ...post,
          authorPhotoURL: user.photoURL,
        })))
      } catch (error) {
        console.error('Error fetching blog posts:', error)
      } finally {
        setPostsLoading(false)
      }
    }

    if (user && !loading) loadBlogPosts()
  }, [user, loading])

    const handleShare = (postId: string) => {
    const url = `/blog/${postId}`
    // Copy to clipboard
    navigator.clipboard.writeText(window.location.origin + url)
    
    toast({
      title: "Link copied to clipboard",
      description: window.location.origin + url,
    })
  }


  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Welcome to the Blog</h2>
          <p className="text-muted-foreground">Please log in to continue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MaxWidthWrapper>
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-8 mb-12 mt-12"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-32 w-32 ring-4 ring-primary/10">
              <AvatarImage
                src={user.photoURL || '/placeholder.svg?height=128&width=128'}
                alt={user.displayName || 'User'}
              />
              <AvatarFallback className="text-2xl">
                {user.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-2">Welcome Back</h1>
              <p className="text-xl sm:text-2xl text-primary-foreground/90">{user.displayName || 'User'}</p>
              <p className="text-sm text-primary-foreground/75 mt-2">{user.email}</p>
            </div>
          </div>
        </motion.header>

        <main className="space-y-8">
          {postsLoading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-[400px] w-full rounded-xl" />
              ))}
            </div>
          ) : blogPosts.length > 0 ? (
            <div className="grid gap-8">
              {blogPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group overflow-hidden">
                  <Link href={`/blog/${post.id}`}>
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2 h-[300px] relative">
                          <Image
                            src={post.imageUrl || '/placeholder.svg'}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 p-6">
                          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                            {post.title}
                          </h2>
                          <p className="text-base sm:text-lg text-muted-foreground mb-4 line-clamp-2">
                            {post.desc}
                          </p>

                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                <Image
                                  src={post.authorPhotoURL || '/placeholder.svg'}
                                  alt={post.authorName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">{post.authorName}</span>
                            </div>
                            <time className="text-sm text-muted-foreground">
                              {post.createdAt.toDate().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </time>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>6 min read</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.views || 0} views</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags?.map((tag) => (
                              <span key={tag} className="bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="mt-4 flex gap-4">
                          <Link href={`/blog/${post.id}/edit`}>
                            <Button variant="secondary">
                            <NotebookText />
                                Edit post
                            </Button>
                            </Link>
                            <Button 
                              variant="secondary" 
                              onClick={() => handleShare(post.id)}
                            >
                              <Share2 className="mr-2 h-4 w-4" />
                              Share post
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
            
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="inline-block p-6 rounded-full bg-secondary mb-4">
                <svg
                  className="w-12 h-12 text-secondary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0l3 3m0 0l-3 3"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">No posts yet</h2>
              <p className="text-muted-foreground">Create your first blog post to get started.</p>
            </motion.div>
          )}
        </main>
      </MaxWidthWrapper>
    </div>
  )
}
