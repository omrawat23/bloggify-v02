import { doc, increment, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default async function incrementViews(postId: string) {
  try {
    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, {
      views: increment(1/2) // Atomic increment by 1
    })
    console.log(`Views incremented for post ${postId}`)
  } catch (error) {
    console.error('Error incrementing views:', error)
  }
}
