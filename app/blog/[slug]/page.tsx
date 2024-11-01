"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Eye } from "lucide-react";
import { BlogPost } from "@/types/types";
import Image from "next/image";
import incrementViewCount from '@/components/ViewCount'

export default function ShowPost({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", params.slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const postData = docSnap.data() as BlogPost;
          setPost(postData);

          // Increment the view count
          incrementViewCount(params.slug)
        } else {
          setError("No such post found!");
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Error fetching post");
      }
    };

    fetchPost();
  }, [params.slug]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-4">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-lg text-muted-foreground mb-6">{post.desc}</p>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            {post.createdAt.toDate().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <p className="text-sm text-muted-foreground">
              6 min read
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <p className="text-sm text-muted-foreground">{post.views} views</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.authorImage} alt={post.authorName} />
            <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium">{post.authorName}</p>
        </div>
      </div>

      <Image
        src={post.imageUrl}
        alt={post.title}
        width={500}
        height={500}
        className="w-full h-auto rounded-lg shadow-md mb-8"
      />

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
