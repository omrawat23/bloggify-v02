'use client'

import { useState } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { createBlogAction } from '@/lib/action'
import MaxWidthWrapper from "@/components/MaxWidthWrapper"

import Editor from '@/components/editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { userAtom } from '@/store/userAtoms'
import { defaultValue } from './defaultValue';

export default function ContentForm() {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [img, setImage] = useState<File | null>(null)
  const [content, setContent] = useState('')
  const [pending, setPending] = useState(false)
  const [user] = useAtom(userAtom)

  const addTag = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    e.preventDefault();
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag('');
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a post.');
      return;
    }
    if (!title || !content || !desc) {
      toast.error('Title, description, and content are required.');
      return;
    }
  
    setPending(true);
  
    try {
      // Convert image file to base64 if it exists
      let imageBase64 = null;
      if (img) {
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(img);
        });
      }
  
      // Call createBlogAction with the base64 image data and tags
      const result = await createBlogAction({
        title,
        content,
        desc,
        tags, // Add tags to the blog post creation
        imageData: imageBase64 as string,
        imageName: img?.name,
        authorId: user.email,
        authorName: user.displayName,
        authorImage: user.photoURL, 
      });
  
      if (result?.error) {
        toast.error(`Error: ${result.error}`);
      } else if (result?.success) {
        toast.success(`Blog post created successfully! ID: ${result.id}`);
        setTitle('');
        setDesc('');
        setTags([]); // Reset tags
        setImage(null);
        setContent('');
      } else {
        toast.error('Unexpected response from server');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
      console.error('Error during blog creation:', error);
    } finally {
      setPending(false);
    }
  }

  return (
    <MaxWidthWrapper className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className='flex max-w-2xl flex-col gap-4 justify-center w-full'>
        <h1>Write a blog</h1>
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

        <input
          type='file'
          accept='image/*'
          onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
        />

        <Editor initialValue={defaultValue} onChange={setContent} />
        <Button type="submit" disabled={pending}>
          {pending ? 'Submitting...' : 'Create'}
        </Button>
      </form>
    </MaxWidthWrapper>
  )
}