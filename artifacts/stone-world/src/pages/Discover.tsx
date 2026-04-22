import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useListCategories, useListProducts } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { ListProductsOrigin } from "@workspace/api-client-react";

export default function Discover() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [origin, setOrigin] = useState<ListProductsOrigin | undefined>(undefined);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: categories } = useListCategories();
  
  const { data, isLoading } = useListProducts({
    search: search || undefined,
    categoryId,
    origin: origin === "all" ? undefined : origin,
    available: availableOnly ? true : undefined,
    limit,
    offset: (page - 1) * limit
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <div className="bg-muted py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Discover Perfection</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our curated collection of the world's finest materials.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 space-y-8 flex-shrink-0">
            <div>
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Category</Label>
              <div className="space-y-2">
                <Button 
                  variant={categoryId === undefined ? "default" : "ghost"} 
                  className="w-full justify-start font-normal"
                  onClick={() => { setCategoryId(undefined); setPage(1); }}
                >
                  All Categories
                </Button>
                {categories?.map((cat) => (
                  <Button 
                    key={cat.id}
                    variant={categoryId === cat.id ? "default" : "ghost"} 
                    className="w-full justify-start font-normal"
                    onClick={() => { setCategoryId(cat.id); setPage(1); }}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Origin</Label>
              <Select value={origin || "all"} onValueChange={(val) => { setOrigin(val === "all" ? undefined : val as ListProductsOrigin); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Origin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Origins</SelectItem>
                  <SelectItem value="imported">Imported</SelectItem>
                  <SelectItem value="national">National (Indian)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="available" checked={availableOnly} onCheckedChange={(v) => { setAvailableOnly(v); setPage(1); }} />
              <Label htmlFor="available">In Stock Only</Label>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : data?.products.length === 0 ? (
              <div className="text-center py-24 bg-muted/50 rounded-xl">
                <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
                <Button variant="link" onClick={() => { setSearch(""); setCategoryId(undefined); setOrigin(undefined); setAvailableOnly(false); }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.products.map((product) => (
                    <Link key={product.id} href={`/discover/${product.id}`}>
                      <div className="group cursor-pointer rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                          )}
                          {!product.available && (
                            <div className="absolute top-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                              Out of Stock
                            </div>
                          )}
                          {product.origin && (
                            <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded backdrop-blur-sm capitalize">
                              {product.origin}
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.categoryName}</p>
                          <h3 className="font-serif text-xl text-foreground mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                          {product.price && (
                            <p className="text-sm font-medium">₹{product.price} / {product.priceUnit || 'sq.ft'}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {data && data.total > limit && (
                  <div className="flex justify-center gap-2 mt-12">
                    <Button 
                      variant="outline" 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {page} of {Math.ceil(data.total / limit)}
                    </div>
                    <Button 
                      variant="outline" 
                      disabled={page >= Math.ceil(data.total / limit)}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
