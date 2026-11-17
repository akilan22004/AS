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
import { api } from '../../services/api';
import { Category, ProductImage } from '../../types';

const MAX_IMAGES_PER_UPLOAD = 20;

export const AdminAddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [modelCode, setModelCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('Solid Teak Wood');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [dimensionUnit, setDimensionUnit] = useState('cm');
  const [specifications, setSpecifications] = useState('');
  const [isPublished, setIsPublished] = useState(true);
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

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: api.getAdminCategories,
  });

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
    setExistingImages(product.images);
  }, [productQuery.data]);

  useEffect(() => {
    if (!id && !categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [id, categoryId, categories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
      const newUrls = files.map((f) => URL.createObjectURL(f));
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
      formData.append('isPublished', String(id ? publish : false));

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
        if (publish && !createdProduct.isPublished) {
          await api.updateProduct(createdProduct.id, { isPublished: true });
        }
      }
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
    <div className="min-w-[320px] max-w-[480px] mx-auto min-h-screen bg-[#F7F3EC] shadow-2xl flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Mobile Bar */}
      <div className="bg-[#241B16] text-[#F7F3EC] px-4 py-2 flex items-center justify-between border-b border-[#3D2C22]">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="p-1 hover:text-[#C8A77D]">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-1.5">
            <img src="/assets/tree-logo.png" alt="Logo" className="h-6 w-auto object-contain" />
            <div>
              <span className="font-serif tracking-widest text-[11px] font-bold uppercase block leading-none">
                ANNAMALAI
              </span>
              <span className="font-serif tracking-[0.2em] text-[7px] text-[#C8A77D] uppercase block mt-0.5 leading-none">
                FURNITURE
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <button className="p-1 hover:text-white" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button className="p-1 hover:text-white" aria-label="Profile">
            <User size={18} />
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative px-5 pt-4 pb-3 flex items-center justify-between overflow-hidden bg-gradient-to-b from-[#F2ECE1] to-[#F7F3EC]">
        <div className="relative z-10 max-w-[260px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#EFE9DF] text-[#493326] flex items-center justify-center flex-shrink-0">
              <PackagePlus size={18} />
            </div>
            <div>
              <h1 className="font-serif text-[18px] font-bold text-[#241B16] leading-none">
                {id ? 'Edit Furniture' : 'Add New Furniture'}
              </h1>
              <p className="text-[9.5px] text-[#695446] mt-0.5">
                {id ? 'Update product details and gallery' : 'Add a new product to your collection'}
              </p>
            </div>
          </div>
          {/* Leaf flourish */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#B69764]">
            <span className="w-8 h-[1px] bg-[#C8A77D]"></span>
            <span>🍃</span>
            <span className="w-8 h-[1px] bg-[#C8A77D]"></span>
          </div>
        </div>

        {/* Right Armchair Crop */}
        <div className="w-28 h-20 overflow-hidden flex-shrink-0 rounded-xl opacity-90">
          <img
            src="/assets/admin-add-armchair.jpg"
            alt="Handcrafted Armchair"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Form Card */}
      <main className="flex-1 px-4 pb-6">
        <div className="bg-[#FCFAF7] border border-[#DDD1C0] rounded-[28px] p-4 shadow-md space-y-4">
          {/* Product Images Section */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[#8A7569]">🖼</span>
              <label className="text-[11px] font-bold text-[#241B16]">Product Gallery</label>
            </div>
            <p className="text-[9px] text-[#7A675B] mb-2">
              Add any number of product photos. Large selections upload in ordered batches.
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
              <p className="mb-3 rounded-xl border border-dashed border-[#DDD1C0] px-3 py-4 text-center text-[9px] text-[#7A675B]">
                No product photos saved yet. Add images now or save and add them later.
              </p>
            )}

            {existingImages.length > 0 && (
              <div className="mb-3 space-y-2">
                {existingImages.map((image, index) => (
                  <div key={image.id} className="flex items-center gap-2 rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] p-2">
                    <img
                      src={image.thumbUrl || image.url || image.filePath}
                      alt={image.altText || `${name} view ${index + 1}`}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[9px] font-medium text-[#241B16]">
                        {image.altText || `Product view ${index + 1}`}
                      </p>
                      <p className="text-[8px] text-[#7A675B]">Image {index + 1} of {existingImages.length}</p>
                    </div>
                    {id && (
                      <>
                        <button
                          type="button"
                          aria-label={`Move image ${index + 1} up`}
                          disabled={index === 0}
                          onClick={() => moveImage(index, -1)}
                          className="rounded p-1 text-[#493326] disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move image ${index + 1} down`}
                          disabled={index === existingImages.length - 1}
                          onClick={() => moveImage(index, 1)}
                          className="rounded p-1 text-[#493326] disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <label className="cursor-pointer rounded px-1.5 py-1 text-[8px] text-[#493326] hover:bg-[#EFE9DF]">
                          Replace
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={event => {
                              const file = event.target.files?.[0];
                              event.target.value = '';
                              if (file) manageImage(
                                () => api.replaceProductImage(id, image.id, file),
                                'Product image replaced.'
                              );
                            }}
                          />
                        </label>
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
                          className="rounded p-1 text-red-700"
                          aria-label={`Delete image ${index + 1}`}
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tap to Upload Box */}
            <label className="border-2 border-dashed border-[#C8A77D]/70 bg-[#FAF7F2] hover:bg-[#F4EEE3] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center mb-3">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud size={24} className="text-[#B69764] mb-1" />
              <span className="font-serif text-[12px] font-bold text-[#241B16]">
                Tap to Upload Images
              </span>
              <span className="text-[9px] text-[#8A7569] mt-0.5">
                JPG, PNG, WebP • Up to 10 MB each • No gallery image-count limit
              </span>
            </label>

            {/* Uploaded Images Preview Strip */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#D9CEBF] flex-shrink-0 bg-[#E2D8C9]">
                  <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[#C8A77D] flex flex-col items-center justify-center text-[#8A7569] hover:bg-[#FAF7F2] cursor-pointer flex-shrink-0 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Plus size={16} />
                <span className="text-[7.5px] mt-0.5 font-medium">Add More</span>
              </label>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-[#241B16]">
              <Tag size={13} className="text-[#8A7569]" />
              <label className="text-[11px] font-bold">
                Product Name <span className="text-red-600">*</span>
              </label>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Handcrafted Wooden Sofa"
              className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl px-3 py-2 text-xs text-[#241B16] focus:outline-none focus:border-[#493326]"
            />
          </div>

          {/* Model Code & Category Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-[#241B16]">
                <Barcode size={13} className="text-[#8A7569]" />
                <label className="text-[11px] font-bold">
                  Model Code <span className="text-red-600">*</span>
                </label>
              </div>
              <input
                type="text"
                required
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
                placeholder="e.g. AF-SF001"
                className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl px-3 py-2 text-xs text-[#241B16] font-mono focus:outline-none focus:border-[#493326]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-[#241B16]">
                <Layers size={13} className="text-[#8A7569]" />
                <label className="text-[11px] font-bold">
                  Category <span className="text-red-600">*</span>
                </label>
              </div>
              <select
                value={categoryId || categories[0]?.id || ''}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={categories.length === 0}
                className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl px-3 py-2 text-xs text-[#241B16] focus:outline-none focus:border-[#493326] disabled:opacity-60"
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
              {categories.length === 0 && (
                <p className="mt-1 text-[9px] text-amber-800">
                  ⚠️ No categories exist yet.{' '}
                  <Link to="/admin/categories" className="underline font-bold text-[#493326]">
                    Create category
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-[#241B16]">
              <FileText size={13} className="text-[#8A7569]" />
              <label className="text-[11px] font-bold">
                Description <span className="text-red-600">*</span>
              </label>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#241B16]">Material</label>
              <input
                type="text"
                maxLength={500}
                value={material}
                onChange={event => setMaterial(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3 py-2 text-xs text-[#241B16]"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[['Length', length, setLength], ['Width', width, setWidth], ['Height', height, setHeight]].map(([label, value, setter]) => (
                <label key={label as string} className="text-[10px] text-[#7A675B]">
                  {label as string} ({dimensionUnit})
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={value as string}
                    onChange={event => (setter as (value: string) => void)(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#DDD1C0] bg-[#FAF7F2] px-2 py-1.5 text-xs text-[#241B16]"
                  />
                </label>
              ))}
              <label className="text-[10px] text-[#7A675B]">
                Unit
                <select
                  value={dimensionUnit}
                  onChange={event => setDimensionUnit(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#DDD1C0] bg-[#FAF7F2] px-2 py-1.5 text-xs text-[#241B16]"
                >
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                  <option value="in">in</option>
                </select>
              </label>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#241B16]">Specifications</label>
              <textarea
                rows={3}
                maxLength={10000}
                value={specifications}
                onChange={event => setSpecifications(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DDD1C0] bg-[#FAF7F2] px-3 py-2 text-xs text-[#241B16]"
              />
            </div>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter handcrafted specifications and features..."
              className="w-full bg-[#FAF7F2] border border-[#DDD1C0] rounded-xl px-3 py-2 text-xs text-[#241B16] focus:outline-none focus:border-[#493326] leading-relaxed"
            />
          </div>

          {/* Publish Status Toggle */}
          <div>
            <label className="block text-[11px] font-bold text-[#241B16] mb-1.5">
              Publish Status
            </label>
            <div className="bg-[#EFE9DF] p-1 rounded-2xl flex items-center border border-[#DDD1C0]">
              <button
                type="button"
                onClick={() => setIsPublished(false)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-serif flex items-center justify-center gap-1.5 transition-all ${
                  !isPublished
                    ? 'bg-[#493326] text-[#F7F3EC] shadow-sm'
                    : 'text-[#695446] hover:text-[#241B16]'
                }`}
              >
                <Save size={13} />
                <span>Draft</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublished(true)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-serif flex items-center justify-center gap-1.5 transition-all ${
                  isPublished
                    ? 'bg-[#493326] text-[#F7F3EC] shadow-sm'
                    : 'text-[#695446] hover:text-[#241B16]'
                }`}
              >
                <Check size={13} />
                <span>Publish</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="border border-[#493326] text-[#493326] hover:bg-[#F2ECE1] py-2.5 rounded-2xl font-serif text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Save size={14} />
              <span>Save as Draft</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="bg-[#493326] hover:bg-[#38251C] text-[#F7F3EC] py-2.5 rounded-2xl font-serif text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <UploadCloud size={14} />
              <span>{submitting ? 'Publishing...' : 'Publish Product'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
