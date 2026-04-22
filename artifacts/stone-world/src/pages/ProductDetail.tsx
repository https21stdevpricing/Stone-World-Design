import { useRoute } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/discover/:id");
  const id = params?.id ? parseInt(params.id) : 0;

  const { data: product, isLoading } = useGetProduct(id, {
    query: {
      enabled: !!id,
      queryKey: getGetProductQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center gap-4">
          <h2 className="text-2xl font-serif">Product Not Found</h2>
          <Button asChild variant="outline">
            <Link href="/discover">Back to Collection</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Button asChild variant="ghost" className="mb-8 -ml-4 text-muted-foreground">
          <Link href="/discover"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Discover</Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
              )}
            </div>
            {product.images && product.images.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <div key={i} className="h-24 w-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                    <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-8 py-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {product.categoryName}
                </span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full uppercase tracking-wider">
                  {product.origin}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">{product.name}</h1>
              {product.price && (
                <p className="text-2xl font-light">₹{product.price} <span className="text-base text-muted-foreground">/ {product.priceUnit || 'sq.ft'}</span></p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {product.available ? (
                  <><CheckCircle2 className="h-5 w-5 text-green-500" /> <span className="text-sm">In Stock</span></>
                ) : (
                  <><XCircle className="h-5 w-5 text-red-500" /> <span className="text-sm text-red-500">Currently Unavailable</span></>
                )}
              </div>
              <div className="flex items-center gap-2">
                {product.deliveryAvailable ? (
                  <><CheckCircle2 className="h-5 w-5 text-primary" /> <span className="text-sm">Nationwide Delivery Available</span></>
                ) : (
                  <><XCircle className="h-5 w-5 text-muted-foreground" /> <span className="text-sm text-muted-foreground">Store Pickup Only</span></>
                )}
              </div>
            </div>

            {product.description && (
              <div className="prose prose-sm md:prose-base text-muted-foreground">
                <p>{product.description}</p>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-8 border-t">
              <Button asChild size="lg" className="w-full md:w-auto rounded-full px-12 py-6 text-lg">
                <Link href={`/contact?interest=${encodeURIComponent(product.name)}`}>
                  ENQUIRE ABOUT THIS PRODUCT
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
