import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  getListCategoriesQueryKey, type Category,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminCategories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useListCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setName("");
      setDescription("");
      setSortOrder(0);
    }
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setSortOrder(cat.sortOrder ?? 0);
    setIsDialogOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, description: description || null, sortOrder };

    if (editingId) {
      updateCat.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          toast({ title: "Category updated" });
          setIsDialogOpen(false);
        }
      });
    } else {
      createCat.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          toast({ title: "Category created" });
          setIsDialogOpen(false);
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure? This might fail if products are linked to this category.")) {
      deleteCat.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          toast({ title: "Category deleted" });
        },
        onError: () => {
          toast({ title: "Cannot delete category", description: "It may have associated products.", variant: "destructive" });
        }
      });
    }
  };

  const reorder = (cat: Category, direction: "up" | "down") => {
    const sorted = [...(categories ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(c => c.id === cat.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const swap = sorted[swapIdx];
    updateCat.mutate({ id: cat.id, data: { name: cat.name, sortOrder: swap.sortOrder } }, {
      onSuccess: () => {
        updateCat.mutate({ id: swap.id, data: { name: swap.name, sortOrder: cat.sortOrder } }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          }
        });
      }
    });
  };

  const sorted = [...(categories ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif" data-testid="admin-categories-title">Categories</h1>
          <p className="text-muted-foreground">Manage product categories and their display order.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-category"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required data-testid="input-category-name" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Sort Order</label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  data-testid="input-category-sort-order"
                />
                <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first. Use the arrows in the list to quickly reorder.</p>
              </div>
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : sorted.map((cat, idx) => (
              <TableRow key={cat.id} data-testid={`row-category-${cat.id}`}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground w-6">{cat.sortOrder}</span>
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        disabled={idx === 0 || updateCat.isPending}
                        onClick={() => reorder(cat, "up")}
                        data-testid={`button-category-up-${cat.id}`}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        disabled={idx === sorted.length - 1 || updateCat.isPending}
                        onClick={() => reorder(cat, "down")}
                        data-testid={`button-category-down-${cat.id}`}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{cat.slug}</TableCell>
                <TableCell>{cat.productCount}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(cat)} data-testid={`button-edit-category-${cat.id}`}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(cat.id)} data-testid={`button-delete-category-${cat.id}`}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
