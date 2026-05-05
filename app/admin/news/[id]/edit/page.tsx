"use client";
import { use, useEffect, useState } from "react";
import NewsForm from "../../_form";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<null | Record<string, unknown>>(null);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((d) => setPost(d.post));
  }, [id]);

  if (!post) return <div className="py-20 text-center text-slate-400 text-sm">Loading...</div>;

  return (
    <NewsForm
      postId={Number(id)}
      initial={{
        title:    post.title    as string,
        slug:     post.slug     as string,
        category: post.category as string,
        excerpt:  post.excerpt  as string,
        content:  post.content  as string,
        image:    post.image    as string,
        status:   post.status   as string,
      }}
    />
  );
}
