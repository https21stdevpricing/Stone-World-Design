import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Blog() {
  const { data, isLoading } = useListBlogPosts({
    published: true,
    limit: 20
  });

  const posts = data?.posts || [];
  const heroPost = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      
      <main className="flex-1 pt-16 pb-32">
        <div className="py-16 sm:py-20 bg-gray-950">
          <div className="max-w-5xl mx-auto px-6 space-y-4">
            <p className="text-teal-400 text-xs tracking-[0.4em] font-bold uppercase">Insights & Ideas</p>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">The Journal</h1>
            <p className="text-base text-gray-400 max-w-xl">
              Design perspectives, material deep-dives, and architectural inspiration curated by our team.
            </p>
          </div>
        </div>

        <div className="sticky top-16 z-30 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <span className="text-sm font-semibold text-gray-600">Journal</span>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl mt-16">
          {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-32 border-t border-border">
              <p className="text-xl font-bold text-muted-foreground">No articles published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-24">
              
              {/* Featured Hero Post */}
              {heroPost && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Link href={`/blog/${heroPost.slug}`} className="group grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                    <div className="aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-muted order-2 md:order-1">
                      {heroPost.coverImageUrl ? (
                        <img src={heroPost.coverImageUrl} alt={heroPost.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>
                    <div className="space-y-6 order-1 md:order-2 py-8">
                      <div className="flex gap-4 text-xs font-bold tracking-widest uppercase text-muted-foreground">
                        <span>{format(new Date(heroPost.createdAt), 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span>{heroPost.readTimeMinutes} Min Read</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {heroPost.title}
                      </h2>
                      {heroPost.excerpt && (
                        <p className="text-lg text-muted-foreground font-medium leading-relaxed line-clamp-3">
                          {heroPost.excerpt}
                        </p>
                      )}
                      <div className="pt-4 text-sm font-bold tracking-widest uppercase text-foreground group-hover:text-primary transition-colors flex items-center">
                        Read Article <span className="ml-2">→</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Grid Posts */}
              {gridPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 pt-16 border-t border-border/40">
                  {gridPosts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                    >
                      <Link href={`/blog/${post.slug}`} className="group block h-full flex flex-col">
                        <div className="aspect-[4/3] overflow-hidden bg-muted mb-6">
                          {post.coverImageUrl ? (
                            <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div className="flex gap-4 text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4">
                            <span>{format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
                          </div>
                          <h3 className="text-2xl font-bold tracking-tight mb-4 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-muted-foreground font-medium line-clamp-3 mb-6">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="mt-auto pt-4 border-t border-border/40">
                            <span className="text-xs font-bold tracking-widest uppercase text-foreground group-hover:text-primary transition-colors">Read Article</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
