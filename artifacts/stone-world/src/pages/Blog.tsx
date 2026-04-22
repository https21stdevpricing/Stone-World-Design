import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Blog() {
  const { data, isLoading } = useListBlogPosts({
    published: true,
    limit: 20
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-muted py-16 mb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">The Stone Journal</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Insights, trends, and guides for crafting beautiful spaces.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-24">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data?.posts.length === 0 ? (
            <div className="text-center py-24 bg-muted/50 rounded-xl">
              <p className="text-lg text-muted-foreground">No articles published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data?.posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="group cursor-pointer h-full flex flex-col">
                    <div className="aspect-[16/10] bg-muted rounded-2xl overflow-hidden mb-6 relative">
                      {post.coverImageUrl ? (
                        <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {post.readTimeMinutes} min read</span>
                      </div>
                      <h2 className="text-2xl font-serif mb-3 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                      {post.excerpt && (
                        <p className="text-muted-foreground line-clamp-3 mb-6 flex-1">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-auto pt-4 border-t flex flex-wrap gap-2">
                        {post.tags.slice(0,3).map(tag => (
                          <span key={tag} className="text-xs uppercase tracking-wider text-primary font-medium">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
