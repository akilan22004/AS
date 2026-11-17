import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  Bell,
  User,
  PackagePlus,
  UploadCloud,
  X,
  Plus,
  Tag,
  Barcode,
  Layers,
  FileText,
  Save,
  Check,
} from 'lucide-react';
import { api, DEFAULT_CATEGORIES } from '../../services/api';
import { Category, ProductImage } from '../../types';
import { optimizeImage } from '../../utils/imageOptimizer';
import { CategoryDropdown } from '../../components/admin/CategoryDropdown';

const MAX_IMAGES_PER_UPLOAD = 20;

export const AdminAddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [modelCode, setModelCode] = useState('');
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORIES[0]?.id || '');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('Solid Teak Wood');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [dimensionUnit, setDimensionUnit] = useState('cm');
  const [specifications, setSpecifications] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const state = location.state as { pendingUploads?: File[] } | null;
    if (!state?.pendingUploads?.length) return;
    setSelectedFiles(state.pendingUploads);
    setPreviewUrls(state.pendingUploads.map(file => URL.createObjectURL(file)));
  }, [location.key, location.state]);

  const productQuery = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => api.getAdminProduct(id || ''),
    enabled: !!id,
    staleTime: Infinity,
    refetchInterval: false,
  });

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: api.getAdminCategories,
    initialData: DEFAULT_CATEGORIES,
  });

  const categories = categoriesQuery.data || DEFAULT_CATEGORIES;

  useEffect(() => {
    const product = productQuery.data;
    if (!product) return;
    setName(product.name);
    setModelCode(product.modelCode);
    setCategoryId(product.categoryId);
    setDescription(product.description || '');
    setMaterial(product.material || '');
    setLength(product.length?.toString() || '');
    setWidth(product.width?.toString() || '');
    setHeight(product.height?.toString() || '');
    setDimensionUnit(product.dimensionUnit || 'cm');
    setSpecifications(product.specifications || '');
    setIsPublished(product.isPublished);
    setIsFeatured(Boolean(product.isFeatured));
    setExistingImages(product.images);
  }, [productQuery.data]);

  useEffect(() => {
    if (!id && categories.length > 0) {
      if (!categoryId || !categories.some(c => c.id === categoryId)) {
        setCategoryId(categories[0].id);
      }
    }
  }, [id, categoryId, categories]);

  const handleQuickAddCategory = async (catName: string): Promise<Category | void> => {
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = await api.createCategory({
      name: catName,
      slug,
      description: `Handcrafted ${catName}`,
      isVisible: true,
    });
    await queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
    setCategoryId(newCat.id);
    return newCat;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const rawFiles = Array.from(e.target.files);
      const optimizedFiles = await Promise.all(rawFiles.map((file) => optimizeImage(file)));
      setSelectedFiles((prev) => [...prev, ...optimizedFiles]);
      const newUrls = optimizedFiles.map((f) => URL.createObjectURL(f));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number) => {
    const removed = previewUrls[idx];
    if (removed) URL.revokeObjectURL(removed);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const refreshProductImages = async () => {
    if (!id) return;
    const product = await api.getAdminProduct(id);
    setExistingImages(product.images);
    await queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    await queryClient.invalidateQueries();
  };

  const manageImage = async (operation: () => Promise<void>, successMessage: string) => {
    try {
      await operation();
      await refreshProductImages();
      alert(successMessage);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update product image.');
    }
  };

  const moveImage = async (index: number, offset: -1 | 1) => {
    const nextIndex = index + offset;
    if (!id || nextIndex < 0 || nextIndex >= existingImages.length) return;
    const reordered = [...existingImages];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    await manageImage(
      async () => api.reorderProductImages(id, reordered.map((image, order) => ({ id: image.id, order }))),
      'Image order saved.'
    );
  };

  const handleSubmit = async (publish: boolean) => {
    setSubmitting(true);
    let savedProductId = id;
    let uploadedFileCount = 0;
    try {
      const effectiveCategoryId = (categoryId || categories[0]?.id || '').trim();
      if (!effectiveCategoryId) {
        alert('Please create or select a category in Category Management before saving a product.');
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('modelCode', modelCode);
      formData.append('slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
      formData.append('categoryId', effectiveCategoryId);
      formData.append('description', description);
      formData.append('material', material);
      if (length) formData.append('length', length);
      if (width) formData.append('width', width);
      if (height) formData.append('height', height);
      formData.append('dimensionUnit', dimensionUnit);
      formData.append('specifications', specifications);
      formData.append('isPublished', String(publish));
      formData.append('isFeatured', String(isFeatured));

      const imageBatches: File[][] = [];
      for (let index = 0; index < selectedFiles.length; index += MAX_IMAGES_PER_UPLOAD) {
        imageBatches.push(selectedFiles.slice(index, index + MAX_IMAGES_PER_UPLOAD));
      }

      if (id) {
        await api.updateProduct(id, {
          name,
          modelCode,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          categoryId: effectiveCategoryId,
          description,
          material,
          length: length ? Number(length) : null,
          width: width ? Number(width) : null,
          height: height ? Number(height) : null,
          dimensionUnit,
          specifications,
          isPublished: publish,
          isFeatured,
        });
        for (const batch of imageBatches) {
          await api.updateProduct(id, {}, batch);
          uploadedFileCount += batch.length;
          setSelectedFiles((files) => files.slice(batch.length));
          setPreviewUrls((urls) => {
            urls.slice(0, batch.length).forEach((url) => URL.revokeObjectURL(url));
            return urls.slice(batch.length);
          });
        }
      } else {
        selectedFiles.forEach((file) => formData.append('images', file));
        const createdProduct = await api.createProduct(formData);
        savedProductId = createdProduct.id;
      }
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      await queryClient.invalidateQueries();
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      alert(id ? 'Product changes saved.' : publish ? 'Product published to catalog successfully!' : 'Saved as draft!');
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected save error.';
      if (!id && savedProductId) {
        await queryClient.invalidateQueries();
        const uploadStatus = uploadedFileCount
          ? `${uploadedFileCount} image${uploadedFileCount === 1 ? '' : 's'} uploaded`
          : 'no images uploaded';
        alert(`Product was created as a draft, but could not be fully saved (${uploadStatus}): ${errorMessage} Open its editor to retry.`);
        navigate(`/admin/products/${encodeURIComponent(savedProductId)}/edit`, {
          replace: true,
          state: { pendingUploads: selectedFiles.slice(uploadedFileCount) },
        });
        return;
      }
      if (id && uploadedFileCount > 0) {
        await queryClient.invalidateQueries();
        alert(`Product saved, but an image upload batch failed after ${uploadedFileCount} images: ${errorMessage} The remaining selected images are still available to retry.`);
        return;
      }
      alert(errorMessage || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F3EC] flex flex-col font-sans">
      {/* Top Admin Bar */}
      <div className="bg-[#241B16] text-[#F7F3EC] border-b border-[#3D2C22] sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#C8A77D] transition-colors"
              aria-label="Back to Dashboard"
            >
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-white px-2.5 py-1 rounded-lg border border-[#DDD1C0] shadow-sm flex items-center justify-center">
                <img
                  src="/assets/annamalai-logo.png"
                  alt="Annamalai Furniture Logo"
                  className="h-6 sm:h-7 w-auto object-contain"
                />
              </div>
              <span className="text-[10px] sm:text-xs font-serif text-[#C8A77D] tracking-widest hidden sm:inline uppercase">
                Admin Studio
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Link
              to="/admin/categories"
              className="text-xs text-[#C8A77D] hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Manage Categories
            </Link>
            <Link
              to="/admin/dashboard"
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              aria-label="Dashboard"
            >
              <User size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-b from-[#F2ECE1] to-[#F7F3EC] border-b border-[#EAE2D5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#EFE9DF] text-[#493326] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#DDD1C0]">
                <PackagePlus size={20} />
              </div>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#241B16] leading-none">
                  {id ? 'Edit Furniture Piece' : 'Add New Furniture Piece'}
                </h1>
                <p className="text-xs text-[#695446] mt-1">
                  {id ? 'Update specifications, pricing and artisan gallery' : 'Publish a new handcrafted piece to your live website'}
                </p>
              </div>
            </div>
            {/* Flourish */}
            <div className="flex items-center gap-2 mt-2 text-xs text-[#B69764]">
              <span className="w-8 h-[1px] bg-[#C8A77D]"></span>
              <span>🍃 Solid Wood Handcraft</span>
              <span className="w-8 h-[1px] bg-[#C8A77D]"></span>
            </div>
          </div>

          {/* Right Armchair Crop (hidden on small mobile, visible on tablet+) */}
          <div className="hidden sm:block w-32 h-20 overflow-hidden rounded-xl border border-[#DDD1C0] shadow-sm">
            <img
              src="/assets/admin-add-armchair.jpg"
              alt="Handcrafted Armchair"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg space-y-5">
          {/* Product Images Section */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[#8A7569]">🖼</span>
              <label className="text-xs font-bold text-[#241B16]">Product Gallery</label>
            </div>
            <p className="text-[11px] text-[#7A675B] mb-3">
              Add photos of your handcrafted piece. Photos automatically upload to secure Supabase storage.
            </p>

            {id && productQuery.isLoading && (
              <p className="py-3 text-center text-xs text-[#8A7569]">Loading product gallery…</p>
            )}
            {id && productQuery.isError && (
              <p role="alert" className="py-3 text-xs text-red-700">
                {productQuery.error instanceof Error ? productQuery.error.message : 'Could not load this product.'}
              </p>
            )}

            {(!id || (!productQuery.isLoading && !productQuery.isError)) && existingImages.length === 0 && (
              <p className="mb-3 rounded-xl border border-dashed border-[#DDD1C0] px-3 py-4 text-center text-[10px] text-[#7A675B]">
                No product photos saved yet. Add images now or save and add them later.
              </p>
            )}

            {existingImages.length > 0 && (
              <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {existingImages.map((image, index) => (
                  <div key={image.id} className="flex items-center gap-2 rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] p-2">
                    <img
                      src={image.thumbUrl || image.url || image.filePath}
                      alt={image.altText || `${name} view ${index + 1}`}
                      className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#241B16]">
                        {image.altText || `View ${index + 1}`}
                      </p>
                      <p className="text-[10px] text-[#7A675B]">Image {index + 1} of {existingImages.length}</p>
                    </div>
                    {id && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          aria-label={`Move image ${index + 1} up`}
                          disabled={index === 0}
                          onClick={() => moveImage(index, -1)}
                          className="rounded p-1 text-[#493326] hover:bg-[#EAE2D5] disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move image ${index + 1} down`}
                          disabled={index === existingImages.length - 1}
                          onClick={() => moveImage(index, 1)}
                          className="rounded p-1 text-[#493326] hover:bg-[#EAE2D5] disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this product image?')) {
                              manageImage(
                                () => api.deleteProductImage(id, image.id, image.filePath || image.url),
                                'Product image deleted.'
                              );
                            }
                          }}
                          className="rounded p-1 text-red-700 hover:bg-red-50"
                          aria-label={`Delete image ${index + 1}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tap to Upload Box */}
            <label className="border-2 border-dashed border-[#C8A77D]/70 bg-[#FAF7F2] hover:bg-[#F4EEE3] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center mb-3">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud size={28} className="text-[#B69764] mb-1.5" />
              <span className="font-serif text-sm font-bold text-[#241B16]">
                Upload Product Images
              </span>
              <span className="text-xs text-[#8A7569] mt-0.5">
                JPG, PNG, WebP • Auto-optimized • High-resolution supported
              </span>
            </label>

            {/* Preview of newly selected files */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#DDD1C0] shadow-sm group">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/90 text-white rounded-full p-0.5 transition-colors"
                      aria-label="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Name */}
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-[#241B16]">
              <Tag size={14} className="text-[#8A7569]" />
              <label className="text-xs font-bold">
                Product Name <span className="text-red-600">*</span>
              </label>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Handcrafted Wooden Sofa"
              className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl px-3.5 py-2.5 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
            />
          </div>

          {/* Model Code & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-[#241B16]">
                <Barcode size={14} className="text-[#8A7569]" />
                <label className="text-xs font-bold">
                  Model Code <span className="text-red-600">*</span>
                </label>
              </div>
              <input
                type="text"
                required
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
                placeholder="e.g. AF-SF001"
                className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl px-3.5 py-2.5 text-xs text-[#241B16] font-mono focus:outline-none focus:border-[#493326]"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1 text-[#241B16]">
                <Layers size={14} className="text-[#8A7569]" />
                <label className="text-xs font-bold">
                  Category <span className="text-red-600">*</span>
                </label>
              </div>
              {/* Bullet-Proof Interactive Category Dropdown */}
              <CategoryDropdown
                categories={categories}
                selectedId={categoryId}
                onSelect={(id) => setCategoryId(id)}
                onQuickAdd={handleQuickAddCategory}
                isLoading={categoriesQuery.isLoading}
                error={categoriesQuery.isError ? 'Unable to load categories' : null}
                onRetry={() => categoriesQuery.refetch()}
              />
            </div>
          </div>

          {/* Material & Dimensions */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#241B16]">Solid Wood Material</label>
              <input
                type="text"
                maxLength={500}
                value={material}
                onChange={event => setMaterial(event.target.value)}
                placeholder="e.g. Solid Teak Wood & Premium Brass Fittings"
                className="mt-1 w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
              />
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[['Length', length, setLength], ['Width', width, setWidth], ['Height', height, setHeight]].map(([label, value, setter]) => (
                <label key={label as string} className="text-[11px] font-medium text-[#7A675B]">
                  {label as string} ({dimensionUnit})
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={value as string}
                    onChange={event => (setter as (value: string) => void)(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3 py-2 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
                  />
                </label>
              ))}
              <label className="text-[11px] font-medium text-[#7A675B]">
                Unit
                <select
                  value={dimensionUnit}
                  onChange={event => setDimensionUnit(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3 py-2 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
                >
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                  <option value="in">inches</option>
                </select>
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-[#241B16]">Artisan Specifications</label>
              <textarea
                rows={2}
                maxLength={10000}
                value={specifications}
                onChange={event => setSpecifications(event.target.value)}
                placeholder="e.g. Mortise and tenon joinery; natural oil hand-rubbed finish; 10-year timber guarantee."
                className="mt-1 w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3.5 py-2 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1 text-[#241B16]">
                <FileText size={14} className="text-[#8A7569]" />
                <label className="text-xs font-bold">
                  Description <span className="text-red-600">*</span>
                </label>
              </div>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter handcrafted story, comfort notes, and timber provenance..."
                className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl px-3.5 py-2.5 text-xs text-[#241B16] focus:outline-none focus:border-[#493326] leading-relaxed"
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between bg-[#FCFAF7] border border-[#DDD1C0] p-3.5 rounded-2xl">
            <div>
              <span className="text-xs font-bold text-[#241B16] block">Feature on Homepage</span>
              <span className="text-[11px] text-[#7A675B] block">Highlight in the Featured Collection on the front page</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-[#DDD1C0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#493326]"></div>
            </label>
          </div>

          {/* Publish Status Toggle */}
          <div>
            <label className="block text-xs font-bold text-[#241B16] mb-1.5">
              Publish Status
            </label>
            <div className="bg-[#EFE9DF] p-1 rounded-2xl flex items-center border border-[#DDD1C0]">
              <button
                type="button"
                onClick={() => setIsPublished(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-serif flex items-center justify-center gap-1.5 transition-all ${
                  !isPublished
                    ? 'bg-[#493326] text-[#F7F3EC] shadow-sm'
                    : 'text-[#695446] hover:text-[#241B16]'
                }`}
              >
                <Save size={13} />
                <span>Save as Draft</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublished(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-serif flex items-center justify-center gap-1.5 transition-all ${
                  isPublished
                    ? 'bg-[#493326] text-[#F7F3EC] shadow-sm'
                    : 'text-[#695446] hover:text-[#241B16]'
                }`}
              >
                <Check size={13} />
                <span>Publish to Live Website</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="border-2 border-[#493326] text-[#493326] hover:bg-[#F2ECE1] py-3 rounded-2xl font-serif text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Save size={15} />
              <span>Save as Draft</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-3 rounded-2xl font-serif text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <UploadCloud size={15} />
              <span>{submitting ? 'Publishing to Website...' : 'Publish Product to Website'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
