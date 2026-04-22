import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListCategories, getListProductsQueryKey, useBulkDeleteProducts, useBulkToggleProductAvailability,
  useListMedia,
  type Product,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight, Image } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.string().optional(),
  priceUnit: z.string().optional(),
  origin: z.enum(["imported", "national"]),
  available: z.boolean(),
  featured: z.boolean(),
  imageUrl: z.string().optional(),
  deliveryAvailable: z.boolean(),
});

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useListCategories();
  const { data, isLoading } = useListProducts({ search, limit: 50 });
  const { data: mediaItems } = useListMedia();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const bulkDelete = useBulkDeleteProducts();
  const bulkToggle = useBulkToggleProductAvailability();

  const products = data?.products ?? [];
  const allSelected = products.length > 0 && selectedIds.size === products.length;

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      price: "",
      priceUnit: "sq.ft",
      origin: "imported",
      available: true,
      featured: false,
      imageUrl: "",
      deliveryAvailable: true,
    }
  });

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    form.reset({
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId?.toString() || "",
      price: product.price?.toString() || "",
      priceUnit: product.priceUnit || "sq.ft",
      origin: product.origin as "imported" | "national",
      available: product.available,
      featured: product.featured,
      imageUrl: product.imageUrl || "",
      deliveryAvailable: product.deliveryAvailable,
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

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    const payload = {
      ...values,
      categoryId: values.categoryId ? parseInt(values.categoryId) : undefined,
      price: values.price ? parseFloat(values.price) : undefined,
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "Product updated" });
          setIsDialogOpen(false);
        }
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "Product created" });
          setIsDialogOpen(false);
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "Product deleted" });
        }
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} selected product(s)?`)) {
      bulkDelete.mutate({ data: { ids: Array.from(selectedIds) } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setSelectedIds(new Set());
          toast({ title: `${selectedIds.size} product(s) deleted` });
        }
      });
    }
  };

  const handleBulkToggle = (available: boolean) => {
    if (selectedIds.size === 0) return;
    bulkToggle.mutate({ data: { ids: Array.from(selectedIds), available } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        setSelectedIds(new Set());
        toast({ title: `${selectedIds.size} product(s) marked ${available ? "available" : "unavailable"}` });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif" data-testid="admin-products-title">Products</h1>
          <p className="text-muted-foreground">Manage your catalog.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-product"><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} data-testid="input-product-name" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="categoryId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="origin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="imported">Imported</SelectItem>
                          <SelectItem value="national">National</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="priceUnit" render={({ field }) => (
                    <FormItem><FormLabel>Price Unit</FormLabel><FormControl><Input placeholder="sq.ft" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} placeholder="https://... or pick from media library" data-testid="input-product-image-url" />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsMediaPickerOpen(true)}
                        title="Pick from Media Library"
                        data-testid="button-pick-media"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                    {field.value && (
                      <img src={field.value} alt="Preview" className="mt-2 h-24 w-auto rounded-md object-cover border" />
                    )}
                    <FormMessage />
                    <Dialog open={isMediaPickerOpen} onOpenChange={setIsMediaPickerOpen}>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Pick from Media Library</DialogTitle>
                        </DialogHeader>
                        {(!mediaItems || mediaItems.length === 0) ? (
                          <p className="text-center text-muted-foreground py-8">No media uploaded yet. Go to Media Library to upload images.</p>
                        ) : (
                          <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                            {mediaItems.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className={`relative rounded-lg overflow-hidden border-2 aspect-square hover:border-primary transition-colors ${field.value === item.url ? "border-primary" : "border-transparent"}`}
                                onClick={() => { field.onChange(item.url); setIsMediaPickerOpen(false); }}
                                data-testid={`button-media-item-${item.id}`}
                              >
                                <img
                                  src={item.url}
                                  alt={item.filename}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                                  {item.filename}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </FormItem>
                )} />
                <div className="flex gap-8">
                  <FormField control={form.control} name="available" render={({ field }) => (
                    <FormItem className="flex items-center gap-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">Available</FormLabel></FormItem>
                  )} />
                  <FormField control={form.control} name="featured" render={({ field }) => (
                    <FormItem className="flex items-center gap-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">Featured</FormLabel></FormItem>
                  )} />
                  <FormField control={form.control} name="deliveryAvailable" render={({ field }) => (
                    <FormItem className="flex items-center gap-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0">Delivery</FormLabel></FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full">Save Product</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b flex items-center gap-4 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-products" />
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkToggle(true)}
                disabled={bulkToggle.isPending}
                data-testid="button-bulk-enable"
              >
                <ToggleRight className="mr-2 h-4 w-4" /> Mark Available
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkToggle(false)}
                disabled={bulkToggle.isPending}
                data-testid="button-bulk-disable"
              >
                <ToggleLeft className="mr-2 h-4 w-4" /> Mark Unavailable
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={bulkDelete.isPending}
                data-testid="button-bulk-delete"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
              </Button>
            </div>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  data-testid="checkbox-select-all"
                />
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
            ) : products.map((product) => (
              <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={() => toggleSelectOne(product.id)}
                    data-testid={`checkbox-product-${product.id}`}
                  />
                </TableCell>
                <TableCell>
                  {product.imageUrl ? <img src={product.imageUrl} className="h-10 w-10 rounded object-cover" alt={product.name} /> : <div className="h-10 w-10 bg-muted rounded" />}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.categoryName}</TableCell>
                <TableCell className="capitalize">{product.origin}</TableCell>
                <TableCell>{product.price ? `₹${product.price}/${product.priceUnit}` : '-'}</TableCell>
                <TableCell>
                  {product.available ? <span className="text-green-600 text-xs font-medium">In Stock</span> : <span className="text-red-600 text-xs font-medium">Out of Stock</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(product)} data-testid={`button-edit-product-${product.id}`}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)} data-testid={`button-delete-product-${product.id}`}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
