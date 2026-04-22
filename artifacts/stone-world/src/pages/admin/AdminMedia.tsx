import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListMedia, useUploadMedia, useDeleteMedia, getListMediaQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

export default function AdminMedia() {
  const { data, isLoading } = useListMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      uploadMedia.mutate({
        data: {
          filename: file.name,
          mimeType: file.type,
          dataUrl
        }
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMediaQueryKey() });
          toast({ title: "File uploaded successfully" });
          setIsUploading(false);
        },
        onError: () => {
          toast({ title: "Upload failed", variant: "destructive" });
          setIsUploading(false);
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this media file?")) {
      deleteMedia.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMediaQueryKey() });
          toast({ title: "File deleted" });
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif">Media Library</h1>
          <p className="text-muted-foreground">Upload and manage your images.</p>
        </div>
        <div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload Image
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading media...</div>
      ) : data?.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-lg border border-dashed">
          <p className="text-muted-foreground">No media files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data?.map((item) => (
            <div key={item.id} className="group relative aspect-square bg-muted rounded-lg overflow-hidden border">
              <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="icon" onClick={() => navigator.clipboard.writeText(item.url).then(() => toast({title: "URL copied!"}))}>
                  <Upload className="h-4 w-4 rotate-90" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-[10px] text-white truncate">
                {item.filename}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
