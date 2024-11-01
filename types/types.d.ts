export type BlogPost = {
    id: string
    title: string
    desc: string
    content: string
    createdAt: Timestamp
    imageUrl: string
    authorId: string
    authorName: string
    authorPhotoURL?: string
    tags?: string[]
    views?: number
    readTime: number
    authorImage: string
  }
  

