import { useRoute } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Clock, Calendar } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  
  // We don't have a getBlogPostBySlug endpoint, so we fetch all and filter locally for simplicity in this demo.
  // In a real app, there should be a `useGetBlogPostBySlug`.
  const { data, isLoading } = useListBlogPosts({ published: true, limit: 100 });
  const post = data?.posts.find(p => p.slug === params?.slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center gap-4">
          <h2 className="text-2xl font-serif">Article Not Found</h2>
          <Button asChild variant="outline">
            <Link href="/blog">Back to Journal</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <Button asChild variant="ghost" className="mb-8 -ml-4 text-muted-foreground">
          <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Journal</Link>
        </Button>

        <article>
          <header className="mb-12 text-center space-y-6">
            <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {format(new Date(post.createdAt), 'MMMM d, yyyy')}</span>
              <span>•</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {post.readTimeMinutes} min read</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif text-foreground leading-tight">
              {post.title}
            </h1>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex justify-center flex-wrap gap-2 pt-4">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-muted px-3 py-1 rounded-full text-xs uppercase tracking-wider text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {post.coverImageUrl && (
            <div className="aspect-video bg-muted rounded-2xl overflow-hidden mb-16">
              <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-lg md:prose-xl max-w-none prose-headings:font-serif prose-a:text-primary hover:prose-a:text-primary/80">
            {/* Very simple markdown/newline rendering since we only have raw text */}
            {post.content.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
