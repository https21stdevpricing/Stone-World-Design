import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Loader2, BookOpen, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-white">

      {/* Dark hero header */}
      <div className="pt-16 bg-gray-950">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-20 space-y-4">
          <p className="text-teal-400 text-[11px] tracking-[0.35em] font-semibold uppercase">Insights &amp; Ideas</p>
          <h1
            className="font-black tracking-tight text-white leading-[1.05]"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)" }}
          >
            The Journal.
          </h1>
          <p className="text-gray-400 max-w-xl leading-relaxed">
            Design perspectives, material deep-dives, and architectural inspiration curated by our team.
          </p>
        </div>
      </div>

      {/* Sticky label */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-semibold text-gray-600">Journal</span>
        </div>
      </div>

      <main className="flex-1 pb-32">
        <div className="max-w-5xl mx-auto px-6 py-16">
          {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-gray-400 font-semibold">No articles published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-20">

              {/* Featured Hero Post */}
              {heroPost && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <Link href={`/blog/${heroPost.slug}`} className="group grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                      {heroPost.coverImageUrl ? (
                        <img src={heroPost.coverImageUrl} alt={heroPost.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-100 to-gray-200" />
                      )}
                    </div>
                    <div className="space-y-5 py-4">
                      <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        {format(new Date(heroPost.createdAt), 'MMMM d, yyyy')} · {heroPost.readTimeMinutes} min read
                      </p>
                      <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 leading-[1.1] group-hover:text-teal-600 transition-colors">
                        {heroPost.title}
                      </h2>
                      {heroPost.excerpt && (
                        <p className="text-base text-gray-500 leading-relaxed line-clamp-3">
                          {heroPost.excerpt}
                        </p>
                      )}
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal-500 group-hover:text-teal-700 transition-colors">
                        Read article <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Grid Posts */}
              {gridPosts.length > 0 && (
                <div className="pt-10 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {gridPosts.map((post, i) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.07 }}
                      >
                        <Link href={`/blog/${post.slug}`} className="group block">
                          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 mb-5">
                            {post.coverImageUrl ? (
                              <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-teal-100 to-gray-200" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase mb-2">
                            {format(new Date(post.createdAt), 'MMM d, yyyy')}
                          </p>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors leading-snug line-clamp-2 mb-2">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                              {post.excerpt}
                            </p>
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
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
