import { useRoute } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useGetBlogPostBySlug } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";

  const { data: post, isLoading, isError } = useGetBlogPostBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!post || isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center gap-6">
          <h2 className="text-3xl font-serif">Article Not Found</h2>
          <Link href="/blog" className="text-sm tracking-widest uppercase hover:text-primary">Back to Journal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32">
        <article className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 mb-16"
          >
            <Link href="/blog" className="inline-block text-xs tracking-widest uppercase text-muted-foreground hover:text-primary mb-8 border-b border-transparent hover:border-primary pb-1 transition-all">
              ← Back to Journal
            </Link>
            
            <div className="flex justify-center items-center gap-4 text-xs tracking-widest uppercase text-muted-foreground">
              <span>{format(new Date(post.createdAt), 'MMMM dd, yyyy')}</span>
              <span>•</span>
              <span>{post.readTimeMinutes} Min Read</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-tight max-w-4xl mx-auto">
              {post.title}
            </h1>
          </motion.div>

          {post.coverImageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="aspect-[21/9] w-full overflow-hidden bg-muted mb-20"
            >
              <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="prose prose-lg md:prose-xl max-w-3xl mx-auto prose-headings:font-serif prose-headings:font-normal prose-h2:text-3xl prose-h2:mt-16 prose-p:font-light prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-foreground prose-a:underline hover:prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(post.content) as string) }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="max-w-3xl mx-auto mt-20 pt-10 border-t border-border flex flex-wrap gap-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground self-center mr-4">Tags:</span>
              {post.tags.map((tag) => (
                <span key={tag} className="border border-border px-4 py-2 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
