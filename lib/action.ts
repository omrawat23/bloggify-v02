'use server'

import { revalidatePath } from 'next/cache'
import { db, storage } from '@/firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,addDoc,
  Timestamp 
} from 'firebase/firestore'
import { 
  ref, 
  uploadString, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage'

const postsCollection = collection(db, 'posts')

// Define the base blog post type
interface BlogPost {
  title: string;
  content: string;
  desc: string;
  tags: string[];
  imageUrl: string;
  authorId: string;
  authorName: string;
  authorImage: string;
  createdAt: Timestamp;
  views: number;
  updatedAt?: Timestamp;
}

// Define the type for creating a new blog post
interface BlogActionData {
  title: string;
  content: string;
  desc: string;
  tags?: string[];
  imageData?: string;
  imageName?: string;
  authorId: string;
  authorName: string;
  authorImage: string;
}

// Define the type for updating an existing blog post
interface UpdateBlogData {
  id: string;
  title: string;
  content: string;
  desc: string;
  tags?: string[];
  imageData?: string;
  imageName?: string;
  currentImageUrl?: string;
}

export async function getBlogByIdAction(id: string) {
  try {
    const docRef = doc(db, 'posts', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data() as BlogPost
    
    return {
      id: docSnap.id,
      title: data.title,
      content: data.content,
      desc: data.desc,
      tags: data.tags || [],
      imageUrl: data.imageUrl || '',
      authorId: data.authorId,
      authorName: data.authorName,
      authorImage: data.authorImage,
      views: data.views,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString()
    }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    throw new Error('Failed to fetch blog post')
  }
}

export async function updateBlogAction(data: UpdateBlogData) {
  if (!data.id || !data.title || !data.content || !data.desc) {
    return { error: 'All required fields must be provided.' }
  }

  try {
    const docRef = doc(db, 'posts', data.id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return { error: 'Blog post not found.' }
    }

    let imageUrl = data.currentImageUrl || ''

    // Handle image update if new image data is provided
    if (data.imageData && data.imageName) {
      // If there's an existing image, delete it first
      if (data.currentImageUrl) {
        try {
          const oldImageRef = ref(storage, data.currentImageUrl)
          await deleteObject(oldImageRef)
        } catch (error) {
          console.error('Error deleting old image:', error)
          // Continue with upload even if delete fails
        }
      }

      // Upload new image
      const imageRef = ref(storage, `images/${data.imageName}-${Date.now()}`)
      await uploadString(imageRef, data.imageData, 'data_url')
      imageUrl = await getDownloadURL(imageRef)
    }

    const updateData = {
      title: data.title,
      content: data.content,
      desc: data.desc,
      tags: data.tags || [],
      imageUrl,
      updatedAt: serverTimestamp()
    }

    await updateDoc(docRef, updateData)

    revalidatePath(`/blog/${data.id}`)
    revalidatePath('/blog')
    
    return { success: true }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error updating blog post:', error)
    return { error: error.message || 'Failed to update the blog post.' }
  }
}

export async function createBlogAction(data: BlogActionData) {
  if (!data.title || !data.content || !data.desc || !data.authorId || !data.authorName  || !data.authorImage) {
    return { error: 'All fields are required.' }
  }

  try {
    let imageUrl = '';

    // Upload image to Firebase Storage if image data is provided
    if (data.imageData && data.imageName) {
      const imageRef = ref(storage, `images/${data.imageName}-${Date.now()}`)
      
      // Upload base64 data
      await uploadString(imageRef, data.imageData, 'data_url')
      
      // Get the download URL
      imageUrl = await getDownloadURL(imageRef)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postData: Omit<BlogPost, 'createdAt'> & { createdAt: any } = {
      title: data.title,
      content: data.content,
      desc: data.desc,
      tags: data.tags || [],
      imageUrl,
      authorId: data.authorId,
      authorName: data.authorName,
      authorImage: data.authorImage,
      createdAt: serverTimestamp(),
      views: 0
    }

    const docRef = await addDoc(postsCollection, postData)

    if (!docRef.id) {
      return { error: 'Failed to create the blog post.' }
    }

    revalidatePath('/blog')
    return { success: true, id: docRef.id }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating blog post:', error)
    return { error: error.message || 'Failed to create the blog post.' }
  }
}