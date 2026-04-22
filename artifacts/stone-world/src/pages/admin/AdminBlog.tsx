import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, useGenerateBlogPost, useListMedia, getListBlogPostsQueryKey, type BlogPost } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Wand2, Eye, PenLine, ImageIcon, X, Sparkles, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  coverImageUrl: z.string().optional(),
  published: z.boolean(),
});

const AI_STEPS = [
  { id: 1, label: "Researching topic", detail: "Analysing material expertise & context..." },
  { id: 2, label: "Crafting narrative", detail: "Writing editorial-quality content..." },
  { id: 3, label: "Polishing article", detail: "Refining tone, structure & headlines..." },
  { id: 4, label: "Selecting cover image", detail: "Matching a cinematic hero photo..." },
];

function DottedSpinner({ size = 48 }: { size?: number }) {
  const dots = 10;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      {Array.from({ length: dots }).map((_, i) => {
        const angle = (i / dots) * 2 * Math.PI - Math.PI / 2;
        const x = 24 + 18 * Math.cos(angle);
        const y = 24 + 18 * Math.sin(angle);
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={2.5}
            fill="#00B4B4"
            animate={{ opacity: [0.15, 1, 0.15] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: (i / dots) * 1.2,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </svg>
  );
}

function AIGenerationOverlay({
  topic,
  onClose,
}: {
  topic: string;
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayTitle, setDisplayTitle] = useState("");

  const sampleTitle = `The Art of Choosing ${topic || "Premium Materials"} for Your Space`;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    AI_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setCurrentStep(i), i * 1800));
    });
    // Typewriter effect for title preview
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= sampleTitle.length) {
        setDisplayTitle(sampleTitle.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 45);
    timers.push(setTimeout(() => clearInterval(typeInterval), 10000));
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(typeInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg text-center space-y-10"
      >
        {/* Spinner */}
        <div className="flex justify-center">
          <DottedSpinner size={64} />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-950 tracking-tight">
            Writing your article...
          </h2>
          <p className="text-sm text-gray-400">
            Our AI is crafting a cinematic, expert-level piece on <strong className="text-gray-700">{topic}</strong>
          </p>
        </div>

        {/* Step indicators */}
        <div className="space-y-3 text-left max-w-xs mx-auto">
          {AI_STEPS.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 shrink-0">
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  ) : active ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-4 h-4 rounded-full bg-teal-500"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${done || active ? "text-gray-900" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  {active && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-400 mt-0.5"
                    >
                      {step.detail}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Preview title typewriter */}
        {displayTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-gray-100 bg-gray-50 rounded-2xl p-5 text-left space-y-2"
          >
            <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-semibold">Article Title Preview</p>
            <p className="text-sm font-bold text-gray-800 leading-snug">
              {displayTitle}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-0.5 h-4 bg-teal-500 ml-0.5 align-middle"
              />
            </p>
          </motion.div>
        )}

        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
        >
          Cancel generation
        </button>
      </motion.div>
    </div>
  );
}

function MediaPickerDialog({ onSelect }: { onSelect: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const { data: media } = useListMedia();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <ImageIcon className="h-4 w-4" />
        Pick from Media
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Cover Image</DialogTitle>
          </DialogHeader>
          {!media || (media as any[]).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No media files yet. Upload images in the Media section.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
              {(media as any[]).map((item: any) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onSelect(item.url); setOpen(false); }}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-teal-500 transition-all"
                >
                  {item.mimeType?.startsWith("image/") ? (
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminBlog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showGenerating, setShowGenerating] = useState(false);

  const [aiTopic, setAiTopic] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListBlogPosts({ limit: 50 });
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const generatePost = useGenerateBlogPost();

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", excerpt: "", content: "", coverImageUrl: "", published: false }
  });

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    form.reset({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      coverImageUrl: post.coverImageUrl || "",
      published: post.published,
    });
    setIsDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingId(null);
      form.reset();
    }
  };

  const onSubmit = (values: z.infer<typeof postSchema>) => {
    if (editingId) {
      updatePost.mutate({ id: editingId, data: values }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
          toast({ title: "Post updated" });
          setIsDialogOpen(false);
        }
      });
    } else {
      createPost.mutate({ data: values }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
          toast({ title: "Post created" });
          setIsDialogOpen(false);
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure?")) {
      deletePost.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
          toast({ title: "Post deleted" });
        }
      });
    }
  };

  const handleGenerate = () => {
    if (!aiTopic) return;
    setIsAIOpen(false);
    setShowGenerating(true);
    generatePost.mutate({
      data: {
        topic: aiTopic,
        keywords: aiKeywords ? aiKeywords.split(',').map(k => k.trim()) : [],
        publish: false
      }
    }, {
      onSuccess: (post) => {
        queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
        setShowGenerating(false);
        setAiTopic("");
        setAiKeywords("");
        toast({
          title: "✨ Article generated!",
          description: `"${post.title}" has been saved as a draft.`,
        });
      },
      onError: () => {
        setShowGenerating(false);
        toast({ title: "Generation failed", variant: "destructive" });
      }
    });
  };

  const cancelGeneration = () => {
    setShowGenerating(false);
    toast({ title: "Generation cancelled" });
  };

  return (
    <AdminLayout>
      <AnimatePresence>
        {showGenerating && (
          <AIGenerationOverlay topic={aiTopic} onClose={cancelGeneration} />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your journal content.</p>
        </div>
        <div className="flex gap-4">
          {/* AI Writer Dialog */}
          <Dialog open={isAIOpen} onOpenChange={setIsAIOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="gap-2 bg-gradient-to-r from-teal-50 to-teal-100/60 border border-teal-200 text-teal-700 hover:from-teal-100 hover:to-teal-100">
                <Sparkles className="h-4 w-4" />
                AI Writer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-500" />
                  Generate with AI
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-2">
                <div className="p-4 bg-teal-50/60 border border-teal-100 rounded-xl text-sm text-teal-800 leading-relaxed">
                  Our AI writes a full 800–1100 word editorial article with Markdown formatting, an expert Stone World voice, and an auto-matched cinematic cover image.
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Topic *</label>
                  <Input
                    placeholder="e.g. Choosing the right marble for Indian homes"
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-400">Be specific — the more context, the better the article.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Keywords <span className="font-normal text-gray-400">(optional, comma separated)</span></label>
                  <Input
                    placeholder="Italian marble, durability, monsoon, vastu"
                    value={aiKeywords}
                    onChange={e => setAiKeywords(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button
                  className="w-full bg-teal-500 hover:bg-teal-600 gap-2"
                  onClick={handleGenerate}
                  disabled={!aiTopic.trim()}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Full Article
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Post</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingId ? "Edit Post" : "Create Post"}</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="excerpt" render={({ field }) => (
                    <FormItem><FormLabel>Excerpt</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <Tabs defaultValue="edit" className="w-full">
                        <TabsList className="mb-2">
                          <TabsTrigger value="edit" data-testid="tab-blog-edit"><PenLine className="h-3 w-3 mr-1" /> Write</TabsTrigger>
                          <TabsTrigger value="preview" data-testid="tab-blog-preview"><Eye className="h-3 w-3 mr-1" /> Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit">
                          <FormControl>
                            <Textarea
                              className="min-h-[300px] font-mono text-sm"
                              placeholder="Write your article in Markdown..."
                              {...field}
                              data-testid="textarea-blog-content"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">Supports Markdown: **bold**, *italic*, ## headings, - lists</p>
                        </TabsContent>
                        <TabsContent value="preview">
                          <div
                            className="min-h-[300px] border rounded-md p-4 prose prose-sm max-w-none overflow-auto"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(field.value || "") as string) }}
                          />
                        </TabsContent>
                      </Tabs>
                    </FormItem>
                  )} />

                  {/* Cover Image with media picker */}
                  <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <div className="space-y-2">
                        {field.value && (
                          <div className="relative w-full aspect-[16/7] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            <img
                              src={field.value}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <button
                              type="button"
                              onClick={() => field.onChange("")}
                              className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                            >
                              <X className="h-3.5 w-3.5 text-gray-600" />
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2 items-center">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Paste image URL or pick from media library"
                              className="flex-1"
                            />
                          </FormControl>
                          <MediaPickerDialog onSelect={(url) => field.onChange(url)} />
                        </div>
                      </div>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="published" render={({ field }) => (
                    <FormItem className="flex items-center gap-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">Published</FormLabel></FormItem>
                  )} />
                  <Button type="submit" className="w-full">Save Post</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Cover</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AI Generated</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : data?.posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
                <TableCell>
                  {post.coverImageUrl ? (
                    <img src={post.coverImageUrl} alt="" className="w-12 h-8 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {post.published
                    ? <span className="text-green-600 text-xs font-medium">Published</span>
                    : <span className="text-orange-600 text-xs font-medium">Draft</span>}
                </TableCell>
                <TableCell>
                  {post.aiGenerated
                    ? <span className="inline-flex items-center gap-1 text-xs text-teal-600 font-medium"><Sparkles className="w-3 h-3" /> AI</span>
                    : <span className="text-gray-400 text-xs">Manual</span>}
                </TableCell>
                <TableCell>{format(new Date(post.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
