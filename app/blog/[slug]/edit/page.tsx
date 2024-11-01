'use client'

import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { updateBlogAction, getBlogByIdAction } from '@/lib/action'
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import Editor from '@/components/editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { userAtom } from '@/store/userAtoms'
import { defaultValue } from './defaultValue';



// Helper function to try parsing JSON or return defaultValue
const parseContent = (content: string) => {
  try {
    return JSON.parse(content)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // If content is HTML or invalid JSON, create a default structure with the content
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: content
            }
          ]
        }
      ]
    }
  }
}

export default function EditPost({ params }: { params: { slug: string } }) {
  const [title, setTitle] = useState('')
  const router = useRouter()
  const [desc, setDesc] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [img, setImage] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('')
  const [content, setContent] = useState('')
  const [editorContent, setEditorContent] = useState(defaultValue)
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user] = useAtom(userAtom)

  useEffect(() => {
    async function fetchPost() {
      try {
        const post = await getBlogByIdAction(params.slug)
        if (post) {
          setTitle(post.title)
          setDesc(post.desc)
          setTags(post.tags || [])
          setContent(post.content)
          setEditorContent(parseContent(post.content))
          setCurrentImageUrl(post.imageUrl || '')
        } else {
          toast.error('Post not found')
        }
      } catch (error) {
        toast.error('Error fetching post')
        console.error('Error fetching post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.slug])

  const addTag = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    e.preventDefault()
    const trimmedTag = currentTag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to edit a post.')
      return
    }
    if (!title || !content || !desc) {
      toast.error('Title, description, and content are required.')
      return
    }

    setPending(true)

    try {
      let imageBase64 = null
      if (img) {
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(img)
        })
      }

      const result = await updateBlogAction({
        id: params.slug,
        title,
        content: JSON.stringify(content), // Ensure content is stringified properly
        desc,
        tags,
        imageData: imageBase64 as string,
        imageName: img?.name,
        currentImageUrl: currentImageUrl,
      })

      if (result?.error) {
        toast.error(`Error: ${result.error}`)
      } else if (result?.success) {
        toast.success('Blog post updated successfully!')
        router.push(`/blog/${params.slug}`)
      } else {
        toast.error('Unexpected response from server')
      }
    } catch (error) {
      toast.error('An unexpected error occurred.')
      console.error('Error during blog update:', error)
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return (
      <MaxWidthWrapper className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className='flex max-w-2xl flex-col gap-4 justify-center w-full'>
        <h1>Edit blog post</h1>
        <div className='flex gap-4'>
          <Input
            type='text'
            placeholder='Title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <Input
            type='text'
            placeholder='Description'
            value={desc}
            onChange={e => setDesc(e.target.value)}
            required
          />
        </div>

        <div className='flex gap-2 items-center'>
          <Input
            type='text'
            placeholder='Add tags'
            value={currentTag}
            onChange={e => setCurrentTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag(e)}
          />
          <Button 
            type='button' 
            variant='secondary' 
            onClick={addTag}
            disabled={!currentTag.trim()}
          >
            Add Tag
          </Button>
        </div>

        {tags.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {tags.map(tag => (
              <div 
                key={tag} 
                className='bg-gray-800 text-white px-2 py-1 rounded-full flex items-center gap-2'
              >
                <span>{tag}</span>
                <button 
                  type='button'
                  onClick={() => removeTag(tag)}
                  className='text-red-500 hover:text-red-700'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {currentImageUrl && (
          <div className="relative">
           
          </div>
        )}

        <input
          type='file'
          accept='image/*'
          onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
        />

        <Editor 
          initialValue={editorContent}
          onChange={setContent}
        />
        
        <Button type="submit" disabled={pending}>
          {pending ? 'Updating...' : 'Update Post'}
        </Button>
      </form>
    </MaxWidthWrapper>
  )
}