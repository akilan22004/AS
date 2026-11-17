import { Category, Product, AdminUser, DashboardStats, ProductImage } from '../types';
import { supabase, getSupabaseAuthorizationHeader } from './supabase';

const configuredApiOrigin = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '') || '';
const API_BASE = `${configuredApiOrigin}/api`;

const hasBackendApi = Boolean(configuredApiOrigin);

function assertProductionApiConfigured(): void {
  if (!hasBackendApi) {
    throw new Error(
      'This Vercel deployment serves the frontend only. No VITE_API_BASE_URL configured.'
    );
  }
}

// Always throws — ensures Supabase errors surface immediately instead of
// falling through to the backend fetch which does not exist on Vercel.
function surfaceSupabaseError(
  operation: string,
  error: { message: string; code?: string }
): never {
  const code = error.code ? ` (${error.code})` : '';
  throw new Error(`Supabase ${operation} failed${code}: ${error.message}`);
}

// Always re-throws — prevents silent swallow-and-fallback in production.
function preserveProductionError(error: unknown): never {
  throw error;
}

async function readApiResponse<T>(res: Response, url: string, method: string): Promise<T> {
  const responseText = await res.text();
  let responseBody: {
    success?: boolean;
    data?: T;
    error?: string;
    message?: string;
  } | null = null;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = null;
    }
  }

  if (!res.ok) {
    const detail = responseBody?.error || responseBody?.message;
    const responseType = res.headers.get('content-type') || 'unknown content type';
    throw new Error(
      `${method} ${url} returned HTTP ${res.status}${detail ? `: ${detail}` : ` with a non-JSON response (${responseType})`}`
    );
  }

  if (!responseBody || responseBody.success !== true) {
    throw new Error(`${method} ${url} returned an invalid or unsuccessful API response.`);
  }

  return responseBody.data as T;
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  assertProductionApiConfigured();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  for (const [name, value] of Object.entries(await getSupabaseAuthorizationHeader())) {
    if (!headers.has(name)) headers.set(name, value);
  }
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
  return readApiResponse<T>(res, url, options.method || 'GET');
}

async function fetchFormData<T>(url: string, body: FormData, method: 'POST' | 'PUT'): Promise<T> {
  assertProductionApiConfigured();
  const headers = await getSupabaseAuthorizationHeader();
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers,
    body,
  });
  return readApiResponse<T>(res, url, method);
}

function extractStoragePath(filePath: string | null | undefined): string {
  if (!filePath) return '';
  let p = filePath.replace(/\\/g, '/');
  const marker = '/furniture_image/';
  const idx = p.indexOf(marker);
  if (idx !== -1) {
    p = p.substring(idx + marker.length);
  }
  return p.replace(/^\/+/, '');
}

export function resolveImageUrl(filePath: string | null | undefined): string {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const normalized = filePath.replace(/\\/g, '/');
  const cleanPath = normalized.replace(/^\/+/, '');

  if (cleanPath.startsWith('assets/')) {
    return '/' + cleanPath;
  }

  if (supabase) {
    const { data } = supabase.storage.from('furniture_image').getPublicUrl(cleanPath);
    if (data?.publicUrl) {
      return data.publicUrl;
    }
  }

  const uploadsIdx = normalized.indexOf('uploads/');
  if (uploadsIdx !== -1) {
    return '/' + normalized.substring(uploadsIdx);
  }

  return '/' + cleanPath;
}

function mapSupabaseProduct(p: any): Product {
  const rawImages = Array.isArray(p.images) ? p.images : Array.isArray(p.product_images) ? p.product_images : [];
  const images: ProductImage[] = rawImages.map((img: any) => {
    const rawPath = img.file_path || img.filePath || '';
    const rawThumb = img.thumb_path || img.thumbPath || rawPath;
    const url = img.url || resolveImageUrl(rawPath);
    const thumbUrl = img.thumbUrl || resolveImageUrl(rawThumb) || url;

    return {
      id: img.id,
      productId: img.product_id || img.productId || p.id,
      filePath: rawPath,
      thumbPath: rawThumb,
      altText: img.alt_text || img.altText || p.name,
      displayOrder: img.display_order ?? img.displayOrder ?? 0,
      isPrimary: Boolean(img.is_primary ?? img.isPrimary),
      url,
      thumbUrl,
    };
  }).sort((a: ProductImage, b: ProductImage) => a.displayOrder - b.displayOrder);

  return {
    id: p.id,
    name: p.name,
    modelCode: p.model_code || p.modelCode || '',
    slug: p.slug,
    categoryId: p.category_id || p.categoryId,
    description: p.description,
    material: p.material,
    length: p.length,
    width: p.width,
    height: p.height,
    dimensionUnit: p.dimension_unit || p.dimensionUnit || 'cm',
    specifications: p.specifications,
    isFeatured: Boolean(p.is_featured ?? p.isFeatured),
    isPublished: Boolean(p.is_published ?? p.isPublished),
    createdAt: p.created_at || p.createdAt,
    updatedAt: p.updated_at || p.updatedAt,
    category: p.category ? {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
    } : undefined,
    images,
  };
}

function mapSupabaseCategory(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    coverImage: c.cover_image,
    displayOrder: c.display_order ?? 0,
    isVisible: Boolean(c.is_visible),
  };
}

export const api = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_visible', true)
          .order('display_order', { ascending: true });

        if (error) surfaceSupabaseError('loading categories', error);
        if (!error && data) {
          return data.map(mapSupabaseCategory);
        }
      } catch (error) {
        preserveProductionError(error);
        // Fallback to API proxy
      }
    }
    return fetchJson<Category[]>(`${API_BASE}/categories`);
  },

  getAdminCategories: async (): Promise<Category[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) surfaceSupabaseError('loading admin categories', error);
        if (!error && data) {
          return data.map(mapSupabaseCategory);
        }
      } catch (error) {
        preserveProductionError(error);
        // Fallback to API proxy
      }
    }
    return fetchJson<Category[]>(`${API_BASE}/categories/admin/all`);
  },

  createCategory: async (category: Pick<Category, 'name' | 'slug'> & Partial<Category>): Promise<Category> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: category.name,
            slug: category.slug,
            description: category.description,
            cover_image: category.coverImage,
            display_order: category.displayOrder ?? 0,
            is_visible: category.isVisible ?? true,
          })
          .select()
          .single();

        if (error) surfaceSupabaseError('creating category', error);
        if (!error && data) {
          return mapSupabaseCategory(data);
        }
      } catch (error) {
        preserveProductionError(error);
        // Fallback
      }
    }
    return fetchJson<Category>(`${API_BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  updateCategory: async (id: string, updates: Partial<Category>): Promise<Category> => {
    if (supabase) {
      try {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.slug !== undefined) payload.slug = updates.slug;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;
        if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
        if (updates.isVisible !== undefined) payload.is_visible = updates.isVisible;
        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) surfaceSupabaseError('updating category', error);
        if (!error && data) {
          return mapSupabaseCategory(data);
        }
      } catch (error) {
        preserveProductionError(error);
        // Fallback
      }
    }
    return fetchJson<Category>(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteCategory: async (id: string): Promise<void> => {
    if (supabase) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) surfaceSupabaseError('deleting category', error);
        if (!error) return;
      } catch (error) {
        preserveProductionError(error);
        // Fallback
      }
    }
    await fetchJson<void>(`${API_BASE}/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  // Products
  getProducts: async (params?: { category?: string; search?: string; featured?: boolean }): Promise<{ items: Product[]; total: number }> => {
    if (supabase) {
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            category:categories(id, name, slug),
            images:product_images(*)
          `, { count: 'exact' })
          .eq('is_published', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (params?.featured !== undefined) {
          query = query.eq('is_featured', params.featured);
        }
        if (params?.category) {
          // Find category id by slug
          const { data: catData, error: categoryError } = await supabase.from('categories').select('id').eq('slug', params.category).maybeSingle();
          if (categoryError) surfaceSupabaseError('looking up a product category', categoryError);
          if (catData?.id) {
            query = query.eq('category_id', catData.id);
          }
        }
        if (params?.search) {
          const s = params.search.trim();
          query = query.or(`name.ilike.%${s}%,model_code.ilike.%${s}%,description.ilike.%${s}%`);
        }

        const { data, error, count } = await query;
        if (error) surfaceSupabaseError('loading products', error);
        if (!error && data) {
          return {
            items: data.map(mapSupabaseProduct),
            total: count ?? data.length,
          };
        }
      } catch (error) {
        preserveProductionError(error);
        // Fallback to API proxy
      }
    }

    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.featured !== undefined) searchParams.set('featured', String(params.featured));
    return fetchJson<{ items: Product[]; total: number }>(`${API_BASE}/products?${searchParams.toString()}`);
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(id, name, slug),
            images:product_images(*)
          `)
          .eq('is_published', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false });

        if (error) surfaceSupabaseError('loading featured products', error);
        if (!error && data) {
          return data.map(mapSupabaseProduct);
        }
      } catch (error) {
        preserveProductionError(error);
        // Fallback
      }
    }
    return fetchJson<Product[]>(`${API_BASE}/products/featured`);
  },

  getProductBySlug: async (slug: string): Promise<{ product: Product; related: Product[] }> => {
    if (supabase) {
      try {
        const { data: product, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(id, name, slug),
            images:product_images(*)
          `)
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error) surfaceSupabaseError('loading a product', error);
        if (!error && product) {
          const mapped = mapSupabaseProduct(product);
          // Fetch related
          const { data: relatedData, error: relatedError } = await supabase
            .from('products')
            .select(`
              *,
              category:categories(id, name, slug),
              images:product_images(*)
            `)
            .eq('category_id', mapped.categoryId)
            .neq('id', mapped.id)
            .eq('is_published', true)
            .limit(4);

          if (relatedError) surfaceSupabaseError('loading related products', relatedError);
          const related = (relatedData || []).map(mapSupabaseProduct);
          return { product: mapped, related };
        }
      } catch (error) {
        preserveProductionError(error);
        // Fallback
      }
    }
    return fetchJson<{ product: Product; related: Product[] }>(`${API_BASE}/products/${encodeURIComponent(slug)}`);
  },

  // Settings
  getPublicSettings: async (): Promise<Record<string, string>> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('website_settings')
          .select('key, value');
        // Gracefully return empty object if table doesn't exist yet
        if (error) {
          const ignoredCodes = ['PGRST204', 'PGRST205', '42P01'];
          if (ignoredCodes.includes(error.code || '')) return {};
          surfaceSupabaseError('loading public website settings', error);
        }
        if (!error && data) {
          const res: Record<string, string> = {};
          data.forEach((item: { key: string; value: string }) => {
            res[item.key] = item.value;
          });
          return res;
        }
      } catch (error) {
        // Non-critical — settings just won't load
        console.warn('[api] getPublicSettings error (non-fatal):', error);
        return {};
      }
    }
    if (!hasBackendApi) return {};
    return fetchJson<Record<string, string>>(`${API_BASE}/settings/public`);
  },

  // Admin Auth
  logout: async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    if (hasBackendApi) {
      await fetchJson<void>(`${API_BASE}/auth/logout`, { method: 'POST' }).catch(() => {});
    }
  },

  getMe: async (): Promise<AdminUser> => {
    if (!hasBackendApi) {
      throw new Error('getMe() requires a backend API (VITE_API_BASE_URL not configured).');
    }
    return fetchJson<AdminUser>(`${API_BASE}/auth/me`);
  },

  // Admin Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    if (supabase) {
      try {
        const [pCount, pubCount, draftCount, cCount, iCount, recentRes] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', false),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('product_images').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*, category:categories(id, name, slug), images:product_images(*)').order('created_at', { ascending: false }).limit(5),
        ]);

        const queryError = pCount.error || pubCount.error || draftCount.error ||
          cCount.error || iCount.error || recentRes.error;
        if (queryError) surfaceSupabaseError('loading admin dashboard statistics', queryError);
        if (pCount.count !== null && !pCount.error) {
          return {
            totalProducts: pCount.count ?? 0,
            publishedProducts: pubCount.count ?? 0,
            draftProducts: draftCount.count ?? 0,
            totalCategories: cCount.count ?? 0,
            totalImages: iCount.count ?? 0,
            totalPromo: 0,
            recentProducts: (recentRes.data || []).map(mapSupabaseProduct),
          };
        }
      } catch (error) {
        preserveProductionError(error);
        // Fallback
      }
    }
    return fetchJson<DashboardStats>(`${API_BASE}/admin/dashboard`);
  },

  // Admin Product CRUD
  getAllProductsAdmin: async (): Promise<{ items: Product[]; total: number }> => {
    if (supabase) {
      try {
        const { data, error, count } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(id, name, slug),
            images:product_images(*)
          `, { count: 'exact' })
          .order('created_at', { ascending: false });

        if (error) surfaceSupabaseError('loading admin products', error);
        if (!error && data) {
          return {
            items: data.map(mapSupabaseProduct),
            total: count ?? data.length,
          };
        }
      } catch (error) {
        preserveProductionError(error);
        // Fallback
      }
    }
    return fetchJson<{ items: Product[]; total: number }>(`${API_BASE}/products/admin/all`);
  },

  getAdminProduct: async (id: string): Promise<Product> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(id, name, slug),
            images:product_images(*)
          `)
          .eq('id', id)
          .single();

        if (error) surfaceSupabaseError('loading an admin product', error);
        if (!error && data) {
          return mapSupabaseProduct(data);
        }
      } catch (error) {
        preserveProductionError(error);
        // Fallback
      }
    }
    return fetchJson<Product>(`${API_BASE}/products/admin/${encodeURIComponent(id)}`);
  },

  createProduct: async (formData: FormData): Promise<Product> => {
    let supabaseProductCreated = false;
    if (supabase) {
      try {
        const name = String(formData.get('name') || '').trim();
        const modelCode = String(formData.get('modelCode') || '').trim();
        const categoryId = String(formData.get('categoryId') || '').trim();
        if (!categoryId) {
          throw new Error('A valid Category is required to create a product. Please select or add a category first.');
        }
        const description = formData.get('description') ? String(formData.get('description')) : null;
        const material = formData.get('material') ? String(formData.get('material')) : null;
        const length = formData.get('length') ? Number(formData.get('length')) : null;
        const width = formData.get('width') ? Number(formData.get('width')) : null;
        const height = formData.get('height') ? Number(formData.get('height')) : null;
        const dimensionUnit = formData.get('dimensionUnit') ? String(formData.get('dimensionUnit')) : 'cm';
        const specifications = formData.get('specifications') ? String(formData.get('specifications')) : null;
        const isPublished = formData.get('isPublished') === 'true';
        const isFeatured = formData.get('isFeatured') === 'true';
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // 1. Insert product into Supabase
        const { data: newProd, error: prodErr } = await supabase
          .from('products')
          .insert({
            name,
            model_code: modelCode,
            slug,
            category_id: categoryId,
            description,
            material,
            length,
            width,
            height,
            dimension_unit: dimensionUnit,
            specifications,
            is_published: isPublished,
            is_featured: isFeatured,
          })
          .select()
          .single();

        if (prodErr) {
          surfaceSupabaseError('creating product', prodErr);
        } else if (newProd) {
          supabaseProductCreated = true;
          // 2. Upload images to Supabase Storage 'furniture_image'
          const files = formData.getAll('images') as File[];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file && file.size > 0 && typeof file !== 'string') {
              const ext = file.name.split('.').pop() || 'jpg';
              const storagePath = `products/${newProd.id}/${Date.now()}-${i}.${ext}`;
              const { data: storageData, error: uploadErr } = await supabase.storage
                .from('furniture_image')
                .upload(storagePath, file, { contentType: file.type, upsert: true });

              if (uploadErr) {
                console.error('[Supabase Storage] upload failed:', uploadErr);
                throw uploadErr;
              }

              if (storageData) {
                const { error: imageInsertError } = await supabase.from('product_images').insert({
                  product_id: newProd.id,
                  file_path: storageData.path,
                  display_order: i,
                  is_primary: i === 0,
                });
                if (imageInsertError) throw imageInsertError;
              }
            }
          }
          return api.getAdminProduct(newProd.id);
        }
      } catch (err) {
        if (supabaseProductCreated) throw err;
        preserveProductionError(err);
        console.warn('[Supabase] createProduct caught error, falling back to local API:', err);
      }
    }
    return fetchFormData<Product>(`${API_BASE}/products`, formData, 'POST');
  },

  updateProduct: async (id: string, updates: Partial<Product>, images: File[] = []): Promise<Product> => {
    if (supabase) {
      try {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.modelCode !== undefined) payload.model_code = updates.modelCode;
        if (updates.slug !== undefined) payload.slug = updates.slug;
        if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.material !== undefined) payload.material = updates.material;
        if (updates.length !== undefined) payload.length = updates.length;
        if (updates.width !== undefined) payload.width = updates.width;
        if (updates.height !== undefined) payload.height = updates.height;
        if (updates.dimensionUnit !== undefined) payload.dimension_unit = updates.dimensionUnit;
        if (updates.specifications !== undefined) payload.specifications = updates.specifications;
        if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;
        if (updates.isPublished !== undefined) payload.is_published = updates.isPublished;
        payload.updated_at = new Date().toISOString();

        const { error: updateErr } = await supabase
          .from('products')
          .update(payload)
          .eq('id', id)
          .select('id')
          .single();
        if (updateErr) throw updateErr;

        // Upload any newly attached images to Supabase Storage
        if (images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            const file = images[i];
            if (file && file.size > 0 && typeof file !== 'string') {
              const ext = file.name.split('.').pop() || 'jpg';
              const storagePath = `products/${id}/${Date.now()}-${i}.${ext}`;
              const { data: storageData, error: uploadErr } = await supabase.storage
                .from('furniture_image')
                .upload(storagePath, file, { contentType: file.type, upsert: true });

              if (uploadErr) {
                console.error('Storage upload failed:', uploadErr);
                throw uploadErr;
              }

              if (storageData) {
                const { error: imageInsertError } = await supabase.from('product_images').insert({
                  product_id: id,
                  file_path: storageData.path,
                  display_order: 10 + i,
                  is_primary: i === 0,
                });
                if (imageInsertError) throw imageInsertError;
              }
            }
          }
        }
        return api.getAdminProduct(id);
      } catch (error) {
        preserveProductionError(error);
        // Fallback
      }
    }

    const formData = new FormData();
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    images.forEach(image => formData.append('images', image));
    return fetchFormData<Product>(`${API_BASE}/products/${encodeURIComponent(id)}`, formData, 'PUT');
  },

  deleteProductImage: async (productId: string, imageId: string, knownPath?: string): Promise<void> => {
    let supabaseDeleted = false;
    if (supabase) {
      try {
        const pathsToDelete = new Set<string>();
        if (knownPath) {
          const clean = extractStoragePath(knownPath);
          if (clean) pathsToDelete.add(clean);
        }

        const { data: img, error: readError } = await supabase
          .from('product_images')
          .select('file_path')
          .eq('id', imageId)
          .maybeSingle();
        if (readError) throw readError;
        if (img?.file_path) {
          const cleanPath = extractStoragePath(img.file_path);
          if (cleanPath) pathsToDelete.add(cleanPath);
        }

        const { data: deletedImage, error: dbErr } = await supabase
          .from('product_images')
          .delete()
          .eq('id', imageId)
          .select('id')
          .maybeSingle();
        if (dbErr) throw dbErr;
        if (!deletedImage) throw new Error('Product image was not found or could not be deleted.');

        supabaseDeleted = true;
        if (pathsToDelete.size > 0) {
          const { error: removeError } = await supabase.storage
            .from('furniture_image')
            .remove(Array.from(pathsToDelete));
          if (removeError) {
            throw new Error(`Image record deleted, but Supabase Storage cleanup failed: ${removeError.message}`);
          }
        }
        return;
      } catch (error) {
        if (supabaseDeleted) throw error;
        preserveProductionError(error);
        console.warn('[Supabase] deleteProductImage caught warning, proceeding to backend API:', error);
      }
    }
    await fetchJson<void>(`${API_BASE}/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`, {
      method: 'DELETE',
    }).catch(err => {
      if (!supabaseDeleted) throw err;
    });
  },

  replaceProductImage: async (productId: string, imageId: string, image: File): Promise<void> => {
    let replacedInSupabase = false;
    let oldStoragePath: string | null = null;
    let newStoragePath: string | null = null;

    if (supabase) {
      try {
        const { data: oldImg, error: readError } = await supabase
          .from('product_images')
          .select('file_path')
          .eq('id', imageId)
          .maybeSingle();
        if (readError) throw readError;
        if (!oldImg) throw new Error('Product image was not found.');
        if (oldImg?.file_path) {
          oldStoragePath = extractStoragePath(oldImg.file_path);
        }

        const ext = image.name.split('.').pop() || 'jpg';
        const storagePath = `products/${productId}/${Date.now()}-replaced.${ext}`;
        const { data: storageData, error: uploadErr } = await supabase.storage
          .from('furniture_image')
          .upload(storagePath, image, { contentType: image.type, upsert: true });

        if (uploadErr) throw uploadErr;
        newStoragePath = storageData.path;
        const { error: dbErr } = await supabase
          .from('product_images')
          .update({ file_path: storageData.path })
          .eq('id', imageId)
          .select('id')
          .single();
        if (dbErr) {
          await supabase.storage.from('furniture_image').remove([newStoragePath]);
          throw dbErr;
        }
        replacedInSupabase = true;
      } catch (error) {
        preserveProductionError(error);
        console.warn('[Supabase] replaceProductImage caught warning, proceeding to backend API:', error);
      }
    }

    if (replacedInSupabase && supabase) {
      if (oldStoragePath && oldStoragePath !== newStoragePath) {
        const { error } = await supabase.storage.from('furniture_image').remove([oldStoragePath]);
        if (error) throw new Error(`Image replaced, but the previous file could not be removed: ${error.message}`);
      }
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    await fetchFormData<void>(
      `${API_BASE}/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
      formData,
      'PUT'
    );
  },

  reorderProductImages: async (
    productId: string,
    orders: Array<{ id: string; order: number }>
  ): Promise<void> => {
    if (supabase) {
      try {
        const client = supabase;
        const results = await Promise.all(
          orders.map(o => client
            .from('product_images')
            .update({ display_order: o.order })
            .eq('id', o.id)
            .select('id')
            .single())
        );
        const failedUpdate = results.find(result => result.error);
        if (failedUpdate?.error) throw failedUpdate.error;
        return;
      } catch (error) {
        preserveProductionError(error);
      }
    }
    await fetchJson<void>(`${API_BASE}/products/${encodeURIComponent(productId)}/images/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ orders }),
    });
  },

  deleteProduct: async (id: string, knownImagePaths: string[] = []): Promise<void> => {
    let supabaseDeleted = false;
    if (supabase) {
      try {
        const pathsToDelete = new Set<string>();

        // 1. Known image paths passed from caller
        knownImagePaths.forEach(p => {
          const clean = extractStoragePath(p);
          if (clean) pathsToDelete.add(clean);
        });

        const { data: images, error: readError } = await supabase
          .from('product_images')
          .select('file_path')
          .eq('product_id', id);
        if (readError) throw readError;
        if (images && images.length > 0) {
          images.forEach(i => {
            const clean = extractStoragePath(i.file_path);
            if (clean) pathsToDelete.add(clean);
          });
        }

        const { data: deletedProduct, error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
          .select('id')
          .maybeSingle();
        if (deleteError) throw deleteError;
        if (!deletedProduct) throw new Error('Product was not found or could not be deleted.');

        supabaseDeleted = true;
        if (pathsToDelete.size > 0) {
          const { error: removeError } = await supabase.storage
            .from('furniture_image')
            .remove(Array.from(pathsToDelete));
          if (removeError) {
            throw new Error(`Product deleted, but Supabase Storage cleanup failed: ${removeError.message}`);
          }
        }
        return;
      } catch (error) {
        if (supabaseDeleted) throw error;
        preserveProductionError(error);
        console.warn('[Supabase] deleteProduct warning, proceeding to backend API:', error);
      }
    }
    await fetchJson<void>(`${API_BASE}/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  // Realtime Subscriptions
  subscribeToCatalogChanges: (onUpdate: () => void): (() => void) => {
    if (!supabase) return () => {};
    const channel = supabase
      .channel('public:catalog_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        onUpdate();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        onUpdate();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_images' }, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel).catch(() => {});
    };
  },
};
