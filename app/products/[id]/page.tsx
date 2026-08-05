"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Star, ShoppingCart, ArrowLeft, Send } from "lucide-react";
import { toast, Toaster } from "sonner";
import { getImageSrc } from "@/lib/image";

interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface ProductDetail {
  id: string;
  name: string;
  description?: string;
  price: string;
  stock: number;
  image?: string;
  rating?: string;
  reviews: number;
  archived: boolean;
  category: { id: string; name: string };
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch(`/api/reviews?productId=${id}`),
        ]);
        const prodData = await prodRes.json();
        const revData = await revRes.json();
        if (prodData.success) setProduct(prodData.data);
        if (revData.success) setReviews(revData.data);
      } catch {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          name: reviewName,
          rating: reviewRating,
          comment: reviewComment || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Review submitted!");
        setReviews((prev) => [data.data, ...prev]);
        setReviewName("");
        setReviewRating(5);
        setReviewComment("");
        if (product) {
          setProduct({
            ...product,
            reviews: (product.reviews || 0) + 1,
            rating: data.data.rating || product.rating,
          });
        }
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          onMouseEnter={() => interactive && setHoveredStar(star)}
          onMouseLeave={() => interactive && setHoveredStar(0)}
          onClick={() => interactive && setReviewRating(star)}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (interactive ? hoveredStar || reviewRating : rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-500">Product not found</p>
        <Link href="/products" className="text-pink-600 hover:text-pink-700 font-semibold">
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Menu
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gray-100 flex items-center justify-center min-h-[300px]">
              {product.image ? (
                <img
                  src={getImageSrc(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-8xl">🍰</span>
              )}
            </div>
            <div className="md:w-1/2 p-8">
              <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold mb-3">
                {product.category.name}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-pink-600">
                  ₱{product.price}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-6">
                {renderStars(Number(product.rating) || 0)}
                <span className="text-sm text-gray-500">
                  ({product.reviews || 0} reviews)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <span className="text-sm text-green-600 font-medium">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-sm text-red-500 font-medium">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews ({reviews.length})
          </h2>

          <form
            onSubmit={handleSubmitReview}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Write a Review
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                placeholder="Enter your name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              {renderStars(reviewRating, true)}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment (optional)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                placeholder="Tell us about your experience..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-linear-to-r from-pink-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to review this product!
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl shadow-md p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {review.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-PH",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
