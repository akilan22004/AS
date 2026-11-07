export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  displayOrder: number;
  isVisible: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  filePath: string;
  thumbPath?: string | null;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
  url?: string;
  thumbUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  modelCode: string;
  slug: string;
  categoryId: string;
  description?: string | null;
  material?: string | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  dimensionUnit?: string | null;
  specifications?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images: ProductImage[];
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalCategories: number;
  totalImages: number;
  totalPromo: number;
  recentProducts: Product[];
}
