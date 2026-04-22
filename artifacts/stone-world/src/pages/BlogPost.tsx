import { useRoute } from "wouter";
import { Footer } from "@/components/Footer";
import { useGetBlogPostBySlug } from "@workspace/api-client-react";
import { Loader2, ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen flex flex-col bg-white pt-[50px]">
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  if (!post || isError) {
    return (
      <div className="min-h-screen flex flex-col bg-white pt-[50px]">
        <div className="flex-1 flex flex-col justify-center items-center gap-5 text-center px-6">
          <h2 className="text-3xl font-black text-gray-950">Article Not Found</h2>
          <Link href="/blog" className="text-sm font-semibold text-teal-500 hover:text-teal-700 transition-colors">
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 pt-[50px] pb-32">

        {/* Breadcrumb bar — flush under the shrunken navbar */}
        <div className="sticky top-[50px] z-30 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 h-10 flex items-center gap-2 min-w-0">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Journal
            </Link>
            <span className="text-gray-200 select-none text-xs">›</span>
            <span className="text-xs font-medium text-gray-600 truncate">{post.title}</span>
          </div>
        </div>

        <article className="max-w-4xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center space-y-6 mb-14"
          >
            <div className="flex justify-center items-center gap-3 text-[11px] font-semibold tracking-widest uppercase text-gray-400">
              <span>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</span>
              <span>·</span>
              <span>{post.readTimeMinutes} min read</span>
            </div>
            <h1
              className="font-black tracking-tight text-gray-950 leading-[1.08]"
              style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}
            >
              {post.title}
            </h1>
          </motion.div>

          {post.coverImageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="aspect-[21/9] w-full overflow-hidden rounded-2xl bg-gray-100 mb-16"
            >
              <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="prose prose-lg max-w-3xl mx-auto prose-headings:font-black prose-headings:tracking-tight prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(post.content) as string) }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="max-w-3xl mx-auto mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-2 items-center">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mr-2">Tags</span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full"
                >
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
