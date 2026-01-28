// app/category/page.tsx
"use client";
import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardBody, CardFooter, Skeleton, Input } from "@heroui/react";
import { Search } from "lucide-react";

// Category type definition
type Category = {
  _id: string;
  img: string;
  title: string;
  slug: string;
  description: string;
};

export default function Categories() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchValue, setSearchValue] = useState(
    searchParams?.get("search") || "",
  );

  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchCategories = useCallback(
    async (pageNum: number, replace = false) => {
      try {
        setLoading(true);
        const searchQuery = searchParams?.get("search") || "";

        const response = await axios.get("/api/category", {
          params: {
            page: pageNum,
            limit: "12",
            ...(searchQuery && { search: searchQuery }),
          },
        });

        const newCategories = response.data.data || [];
        if (replace) {
          setCategories(newCategories);
        } else {
          setCategories((prev) => [...prev, ...newCategories]);
        }

        setHasMore(pageNum < response.data.totalPages);
      } catch (error) {
        console.error("Error fetching categories:", error);
        if (replace) setCategories([]);
      } finally {
        setLoading(false);
      }
    },
    [searchParams],
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  // Update URL when search changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString());

      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      } else {
        params.delete("search");
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.push(`/category${newUrl}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, router]);

  // Reset and fetch when search params change
  useEffect(() => {
    setPage(1);
    setCategories([]);
    fetchCategories(1, true);
  }, [searchParams, fetchCategories]);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Fetch when page increments
  useEffect(() => {
    if (page > 1) {
      fetchCategories(page);
    }
  }, [page, fetchCategories]);

  // Clear search
  const handleClearSearch = () => {
    setSearchValue("");
  };

  return (
    <div className="min-h-screen p-4 text-[black] dark:text-[#ffff] lg:px-24">
      <div className="my-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl md:text-5xl">Categories</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Explore courses by category
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-8 max-w-md">
        <Input
          isClearable
          radius="lg"
          classNames={{
            label: "text-black/50 dark:text-white/90",
            input: [
              "bg-transparent",
              "text-black/90 dark:text-white/90",
              "placeholder:text-default-700/50 dark:placeholder:text-white/60",
            ],
            innerWrapper: "bg-transparent",
            inputWrapper: [
              "shadow-xl",
              "bg-default-200/50",
              "dark:bg-default/60",
              "backdrop-blur-xl",
              "backdrop-saturate-200",
              "hover:bg-default-200/70",
              "dark:hover:bg-default/70",
              "group-data-[focus=true]:bg-default-200/50",
              "dark:group-data-[focus=true]:bg-default/60",
              "!cursor-text",
            ],
          }}
          placeholder="Search categories..."
          startContent={
            <Search
              className="pointer-events-none flex-shrink-0 text-black/50 text-slate-400 dark:text-white/90"
              size={18}
            />
          }
          value={searchValue}
          onClear={handleClearSearch}
          onValueChange={handleSearchChange}
        />
      </div>

      <div className="mb-8">
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.length > 0 &&
            categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}

          {/* Skeleton loader */}
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <CategoryCardSkeleton key={`loading-${i}`} />
            ))}
        </div>

        {/* No results message */}
        {!loading && categories.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
            <Search className="text-gray-400" size={48} />
            <p className="text-lg text-gray-500">No categories found</p>
            {searchValue && (
              <p className="text-sm text-gray-400">
                Try adjusting your search terms
              </p>
            )}
          </div>
        )}

        {/* Invisible trigger for infinite scroll */}
        <div ref={observerRef} className="h-10"></div>
      </div>
    </div>
  );
}

// Category Card Component
function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/category/${category.slug}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:scale-105">
        <div className="relative h-full w-full">
          <Image
            src={category.img}
            alt={category.title}
            width={800}
            height={600}
            className="h-full w-full object-fill transition-transform duration-300"
          />
        </div>
        <CardFooter className="flex-col items-start gap-2 p-4">
          <h3 className="text-lg font-semibold">{category.title}</h3>
          <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {category.description}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}

// Skeleton Loader Component
function CategoryCardSkeleton() {
  return (
    <Card className="w-full">
      <CardBody className="p-0">
        <Skeleton className="aspect-video w-full rounded-lg" />
      </CardBody>
      <CardFooter className="flex-col items-start gap-2 p-4">
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-5/6 rounded-lg" />
      </CardFooter>
    </Card>
  );
}
