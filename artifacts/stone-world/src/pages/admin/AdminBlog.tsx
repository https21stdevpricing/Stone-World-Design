import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, useGenerateBlogPost, getListBlogPostsQueryKey, type BlogPost } from "@workspace/api-client-react";
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
import { Plus, Pencil, Trash2, Wand2, Eye, PenLine } from "lucide-react";
import { format } from "date-fns";
import { marked } from "marked";
import DOMPurify from "dompurify";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  coverImageUrl: z.string().optional(),
  published: z.boolean(),
});

export default function AdminBlog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
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
    generatePost.mutate({ 
      data: { 
        topic: aiTopic, 
        keywords: aiKeywords ? aiKeywords.split(',').map(k => k.trim()) : [],
        publish: false
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
        toast({ title: "AI Post generated successfully!" });
        setIsAIOpen(false);
        setAiTopic("");
        setAiKeywords("");
      },
      onError: () => {
        toast({ title: "Generation failed", variant: "destructive" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your journal content.</p>
        </div>
        <div className="flex gap-4">
          <Dialog open={isAIOpen} onOpenChange={setIsAIOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary"><Wand2 className="mr-2 h-4 w-4" /> AI Writer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Generate Blog Post</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Topic</label>
                  <Input placeholder="e.g. Benefits of Italian Marble" value={aiTopic} onChange={e => setAiTopic(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Keywords (comma separated)</label>
                  <Input placeholder="luxury, interior design, marble" value={aiKeywords} onChange={e => setAiKeywords(e.target.value)} />
                </div>
                <Button className="w-full" onClick={handleGenerate} disabled={!aiTopic || generatePost.isPending}>
                  {generatePost.isPending ? "Generating..." : "Generate Post"}
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
                  <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Cover Image URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
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
              <TableHead>Status</TableHead>
              <TableHead>AI Generated</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : data?.posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  {post.published ? <span className="text-green-600 text-xs font-medium">Published</span> : <span className="text-orange-600 text-xs font-medium">Draft</span>}
                </TableCell>
                <TableCell>{post.aiGenerated ? 'Yes' : 'No'}</TableCell>
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
