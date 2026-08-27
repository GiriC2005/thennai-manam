
import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

import {
  getAllProductsWithCategory,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/api';

import type { Product, Category } from '@/lib/types';
import { formatPrice, slugify } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import Loader from '@/components/Loader';

import { supabase } from '@/lib/supabase';

export default function AdminProducts() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [uploadingImages, setUploadingImages] = useState(false);

  // Existing Supabase image URLs
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Newly selected files
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Preview URLs
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    category_id: '',
    price: '',
    mrp: '',
    stock: '',
    ingredients: '',
    benefits: '',
    how_to_use: '',
    storage_instructions: '',
    featured: false,
    best_seller: false,
  });

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const [productsData, categoriesData] =
        await Promise.all([
          getAllProductsWithCategory(),
          getCategories(),
        ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error(
        'LOAD PRODUCTS ERROR:',
        error
      );

      showToast(
        'Failed to load products',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     CLEAR IMAGE STATES
  ===================================================== */

  function clearImageStates() {
    imagePreviews.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setExistingImages([]);
    setImageFiles([]);
    setImagePreviews([]);
  }

  /* =====================================================
     OPEN ADD
  ===================================================== */

  function openAdd() {
    setEditing(null);

    clearImageStates();

    setForm({
      name: '',
      slug: '',
      short_description: '',
      description: '',
      category_id: '',
      price: '',
      mrp: '',
      stock: '',
      ingredients: '',
      benefits: '',
      how_to_use: '',
      storage_instructions: '',
      featured: false,
      best_seller: false,
    });

    setShowForm(true);
  }

  /* =====================================================
     OPEN EDIT
  ===================================================== */

  function openEdit(product: Product) {
    setEditing(product);

    // Existing images
    setExistingImages(
      Array.isArray(product.images)
        ? product.images.filter(Boolean)
        : []
    );

    // Clear old previews
    imagePreviews.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setImageFiles([]);
    setImagePreviews([]);

    setForm({
      name: product.name,
      slug: product.slug,
      short_description:
        product.short_description ?? '',
      description:
        product.description ?? '',
      category_id:
        product.category_id ?? '',
      price:
        String(product.price ?? ''),
      mrp:
        String(product.mrp ?? ''),
      stock:
        String(product.stock ?? ''),
      ingredients:
        product.ingredients ?? '',
      benefits:
        product.benefits ?? '',
      how_to_use:
        product.how_to_use ?? '',
      storage_instructions:
        product.storage_instructions ?? '',
      featured:
        Boolean(product.featured),
      best_seller:
        Boolean(product.best_seller),
    });

    setShowForm(true);
  }

  /* =====================================================
     IMAGE SELECT
  ===================================================== */

  function handleImageSelect(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    // Validate files
    const validFiles = selectedFiles.filter(
      (file) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
        ];

        const maxSize =
          5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
          showToast(
            `${file.name}: JPG, PNG or WebP only`,
            'error'
          );

          return false;
        }

        if (file.size > maxSize) {
          showToast(
            `${file.name}: Maximum 5MB allowed`,
            'error'
          );

          return false;
        }

        return true;
      }
    );

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    // Maximum 6 total images
    const currentCount =
      existingImages.length +
      imageFiles.length;

    const remainingSlots =
      6 - currentCount;

    if (remainingSlots <= 0) {
      showToast(
        'Maximum 6 product images allowed',
        'error'
      );

      e.target.value = '';
      return;
    }

    const filesToAdd =
      validFiles.slice(
        0,
        remainingSlots
      );

    if (
      validFiles.length >
      remainingSlots
    ) {
      showToast(
        `Only ${remainingSlots} more image(s) can be added`,
        'info'
      );
    }

    const newPreviews =
      filesToAdd.map((file) =>
        URL.createObjectURL(file)
      );

    setImageFiles((prev) => [
      ...prev,
      ...filesToAdd,
    ]);

    setImagePreviews((prev) => [
      ...prev,
      ...newPreviews,
    ]);

    // Allow selecting same file again
    e.target.value = '';
  }

  /* =====================================================
     REMOVE EXISTING IMAGE
  ===================================================== */

  function removeExistingImage(
    index: number
  ) {
    setExistingImages((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  }

  /* =====================================================
     REMOVE NEW IMAGE
  ===================================================== */

  function removeNewImage(
    index: number
  ) {
    const preview =
      imagePreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImageFiles((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    setImagePreviews((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  }

  /* =====================================================
     UPLOAD IMAGES TO SUPABASE
  ===================================================== */

  async function uploadImages(
    files: File[]
  ): Promise<string[]> {
    if (files.length === 0) {
      return [];
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const extension =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase() || 'jpg';

      const fileName =
        `${crypto.randomUUID()}.${extension}`;

      const filePath =
        `products/${fileName}`;

      console.log(
        'Uploading image:',
        filePath
      );

      const { error: uploadError } =
        await supabase.storage
          .from('product-images')
          .upload(
            filePath,
            file,
            {
              cacheControl: '3600',
              upsert: false,
              contentType:
                file.type,
            }
          );

      if (uploadError) {
        console.error(
          'SUPABASE IMAGE UPLOAD ERROR:',
          uploadError
        );

        throw uploadError;
      }

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from('product-images')
          .getPublicUrl(
            filePath
          );

      if (
        !publicUrlData?.publicUrl
      ) {
        throw new Error(
          'Failed to generate image URL'
        );
      }

      uploadedUrls.push(
        publicUrlData.publicUrl
      );
    }

    return uploadedUrls;
  }

  /* =====================================================
     SUBMIT PRODUCT
  ===================================================== */

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast(
        'Product name is required',
        'error'
      );
      return;
    }

    if (!form.price) {
      showToast(
        'Product price is required',
        'error'
      );
      return;
    }

    if (!form.stock) {
      showToast(
        'Product stock is required',
        'error'
      );
      return;
    }

    try {
      setUploadingImages(true);

      /* ---------------------------------------------
         UPLOAD NEW IMAGES
      --------------------------------------------- */

      const uploadedUrls =
        await uploadImages(
          imageFiles
        );

      /* ---------------------------------------------
         FINAL IMAGE ARRAY
      --------------------------------------------- */

      const finalImages = [
        ...existingImages,
        ...uploadedUrls,
      ];

      /* ---------------------------------------------
         PRODUCT DATA
      --------------------------------------------- */

      const productData = {
        name:
          form.name.trim(),

        slug:
          form.slug.trim() ||
          slugify(form.name),

        short_description:
          form.short_description.trim(),

        description:
          form.description.trim(),

        category_id:
          form.category_id || null,

        price:
          Number(form.price),

        mrp:
          Number(form.mrp) || null,

        stock:
          Number(form.stock),

        images:
          finalImages,

        // Size option removed
        sizes: [],

        ingredients:
          form.ingredients.trim(),

        benefits:
          form.benefits.trim(),

        how_to_use:
          form.how_to_use.trim(),

        storage_instructions:
          form.storage_instructions.trim(),

        featured:
          form.featured,

        best_seller:
          form.best_seller,
      };

      console.log(
        'FINAL PRODUCT DATA:',
        productData
      );

      /* ---------------------------------------------
         UPDATE
      --------------------------------------------- */

      if (editing) {
        await updateProduct(
          editing.id,
          productData
        );

        showToast(
          'Product updated successfully',
          'success'
        );
      }

      /* ---------------------------------------------
         CREATE
      --------------------------------------------- */

      else {
        await createProduct(
          productData
        );

        showToast(
          'Product created successfully',
          'success'
        );
      }

      /* ---------------------------------------------
         CLOSE
      --------------------------------------------- */

      closeForm();

      /* ---------------------------------------------
         REFRESH
      --------------------------------------------- */

      const freshProducts =
        await getAllProductsWithCategory();

      setProducts(
        freshProducts
      );
    } catch (error) {
      console.error(
        'SAVE PRODUCT ERROR:',
        error
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to save product';

      console.error(
        'ERROR MESSAGE:',
        errorMessage
      );

      showToast(
        'Failed to save product',
        'error'
      );
    } finally {
      setUploadingImages(false);
    }
  }

  /* =====================================================
     DELETE PRODUCT
  ===================================================== */

  async function handleDelete(
    id: string
  ) {
    const confirmed =
      confirm(
        'Delete this product?'
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(id);

      showToast(
        'Product deleted',
        'info'
      );

      setProducts((prev) =>
        prev.filter(
          (product) =>
            product.id !== id
        )
      );
    } catch (error) {
      console.error(
        'DELETE PRODUCT ERROR:',
        error
      );

      showToast(
        'Failed to delete product',
        'error'
      );
    }
  }

  /* =====================================================
     CLOSE FORM
  ===================================================== */

  function closeForm() {
    imagePreviews.forEach(
      (url) => {
        URL.revokeObjectURL(url);
      }
    );

    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setEditing(null);
    setShowForm(false);
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <Loader
        label="Loading products..."
      />
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between mb-6">

        <h1 className="font-heading text-2xl lg:text-3xl text-ink">
          Products
        </h1>

        <button
          type="button"
          onClick={openAdd}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>

      </div>

      {/* =================================================
          PRODUCT TABLE
      ================================================= */}

      <div className="card overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>

              <tr className="border-b border-ink/10 text-left text-ink-soft">

                <th className="p-4 font-medium">
                  Product
                </th>

                <th className="p-4 font-medium">
                  Category
                </th>

                <th className="p-4 font-medium">
                  Price
                </th>

                <th className="p-4 font-medium">
                  Stock
                </th>

                <th className="p-4 font-medium">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {products.map(
                (product) => (

                  <tr
                    key={product.id}
                    className="border-b border-ink/5 last:border-0"
                  >

                    {/* PRODUCT */}

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-bg-warm shrink-0">

                          {product.images?.[0] ? (

                            <img
                              src={
                                product.images[0]
                              }
                              alt={
                                product.name
                              }
                              className="w-full h-full object-cover"
                            />

                          ) : (

                            <div className="w-full h-full flex items-center justify-center">

                              <ImageIcon className="w-4 h-4 text-ink/30" />

                            </div>

                          )}

                        </div>

                        <span className="font-medium text-ink line-clamp-1">
                          {product.name}
                        </span>

                      </div>

                    </td>

                    {/* CATEGORY */}

                    <td className="p-4 text-ink-soft">
                      {product.category?.name ??
                        '—'}
                    </td>

                    {/* PRICE */}

                    <td className="p-4 font-mono text-ink">
                      {formatPrice(
                        product.price
                      )}
                    </td>

                    {/* STOCK */}

                    <td className="p-4">

                      <span
                        className={
                          product.stock <= 10
                            ? 'text-copper font-medium'
                            : 'text-ink-soft'
                        }
                      >
                        {product.stock}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td className="p-4">

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEdit(
                              product
                            )
                          }
                          className="p-2 rounded-lg hover:bg-ink/5 text-ink-soft hover:text-ink"
                          title="Edit Product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              product.id
                            )
                          }
                          className="p-2 rounded-lg hover:bg-copper/10 text-ink-soft hover:text-copper"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          FORM MODAL
      ================================================= */}

      {showForm && (

        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">

          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={
              uploadingImages
                ? undefined
                : closeForm
            }
          />

          {/* MODAL */}

          <div className="relative bg-bg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in">

            {/* HEADER */}

            <div className="flex items-center justify-between mb-6">

              <h2 className="font-heading text-xl text-ink">

                {editing
                  ? 'Edit Product'
                  : 'Add Product'}

              </h2>

              <button
                type="button"
                onClick={closeForm}
                disabled={
                  uploadingImages
                }
                className="p-2 rounded-full hover:bg-ink/5 disabled:opacity-50"
              >
                <X className="w-5 h-5 text-ink" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >

              {/* NAME + SLUG */}

              <div className="grid sm:grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-medium text-ink mb-1">
                    Name
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      form.name
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          name:
                            e.target
                              .value,
                        })
                      )
                    }
                    className="input-field"
                    placeholder="Pure Wood Pressed Coconut Oil"
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-ink mb-1">
                    Slug
                  </label>

                  <input
                    type="text"
                    value={
                      form.slug
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          slug:
                            e.target
                              .value,
                        })
                      )
                    }
                    className="input-field"
                    placeholder="Auto-generated"
                  />

                </div>

              </div>

              {/* SHORT DESCRIPTION */}

              <div>

                <label className="block text-sm font-medium text-ink mb-1">
                  Short Description
                </label>

                <input
                  type="text"
                  value={
                    form.short_description
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        short_description:
                          e.target
                            .value,
                      })
                    )
                  }
                  className="input-field"
                  placeholder="100% pure wood pressed coconut oil"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block text-sm font-medium text-ink mb-1">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        description:
                          e.target
                            .value,
                      })
                    )
                  }
                  className="input-field"
                  placeholder="Product description..."
                />

              </div>

              {/* PRICE / MRP / STOCK */}

              <div className="grid sm:grid-cols-3 gap-4">

                <div>

                  <label className="block text-sm font-medium text-ink mb-1">
                    Price (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    required
                    value={
                      form.price
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          price:
                            e.target
                              .value,
                        })
                      )
                    }
                    className="input-field"
                    placeholder="499"
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-ink mb-1">
                    MRP (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.mrp
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          mrp:
                            e.target
                              .value,
                        })
                      )
                    }
                    className="input-field"
                    placeholder="599"
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-ink mb-1">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    required
                    value={
                      form.stock
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          stock:
                            e.target
                              .value,
                        })
                      )
                    }
                    className="input-field"
                    placeholder="100"
                  />

                </div>

              </div>

              {/* CATEGORY */}

              <div>

                <label className="block text-sm font-medium text-ink mb-1">
                  Category
                </label>

                <select
                  value={
                    form.category_id
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        category_id:
                          e.target
                            .value,
                      })
                    )
                  }
                  className="input-field"
                >

                  <option value="">
                    Select category
                  </option>

                  {categories.map(
                    (category) => (

                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* =================================================
                  PRODUCT IMAGES
              ================================================= */}

              <div>

                <label className="block text-sm font-medium text-ink mb-2">
                  Product Images
                </label>

                {/* UPLOAD BOX */}

                <label
                  htmlFor="product-images"
                  className="group flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed border-ink/15 rounded-2xl bg-card hover:border-palm/50 hover:bg-palm/5 cursor-pointer transition-all"
                >

                  <div className="w-12 h-12 rounded-full bg-palm/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">

                    <Upload className="w-5 h-5 text-palm" />

                  </div>

                  <p className="text-sm font-medium text-ink">
                    Choose Product Images
                  </p>

                  <p className="text-xs text-ink-soft mt-1">
                    JPG, PNG or WebP
                  </p>

                  <p className="text-xs text-ink-soft">
                    Maximum 5MB each • Maximum 6 images
                  </p>

                  <input
                    id="product-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={
                      handleImageSelect
                    }
                    disabled={
                      uploadingImages
                    }
                    className="hidden"
                  />

                </label>

                {/* CURRENT IMAGES */}

                {existingImages.length >
                  0 && (

                  <div className="mt-4">

                    <p className="text-xs font-medium text-ink-soft mb-2">
                      Current Images
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                      {existingImages.map(
                        (
                          src,
                          index
                        ) => (

                          <div
                            key={`${src}-${index}`}
                            className="relative aspect-square rounded-xl overflow-hidden border border-ink/10 bg-bg-warm"
                          >

                            <img
                              src={src}
                              alt={`Product ${
                                index +
                                1
                              }`}
                              className="w-full h-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeExistingImage(
                                  index
                                )
                              }
                              disabled={
                                uploadingImages
                              }
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-copper transition-colors disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            {index ===
                              0 && (

                              <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/70 text-white text-[10px]">
                                Main
                              </span>

                            )}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

                {/* NEW IMAGES */}

                {imagePreviews.length >
                  0 && (

                  <div className="mt-4">

                    <p className="text-xs font-medium text-ink-soft mb-2">
                      New Images
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                      {imagePreviews.map(
                        (
                          src,
                          index
                        ) => (

                          <div
                            key={`${src}-${index}`}
                            className="relative aspect-square rounded-xl overflow-hidden border border-palm/30 bg-bg-warm"
                          >

                            <img
                              src={src}
                              alt={`New image ${
                                index +
                                1
                              }`}
                              className="w-full h-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeNewImage(
                                  index
                                )
                              }
                              disabled={
                                uploadingImages
                              }
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-copper transition-colors disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-palm text-white text-[10px]">
                              New
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

                {/* IMAGE COUNT */}

                <div className="flex items-center justify-between mt-3">

                  <p className="text-xs text-ink-soft">

                    {existingImages.length +
                      imageFiles.length}{' '}
                    / 6 images selected

                  </p>

                  {uploadingImages && (

                    <p className="text-xs text-palm font-medium">
                      Uploading images...
                    </p>

                  )}

                </div>

              </div>

              {/* INGREDIENTS */}

              <div>

                <label className="block text-sm font-medium text-ink mb-1">
                  Ingredients
                </label>

                <textarea
                  rows={2}
                  value={
                    form.ingredients
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        ingredients:
                          e.target
                            .value,
                      })
                    )
                  }
                  className="input-field"
                  placeholder="100% pure coconut oil"
                />

              </div>

              {/* BENEFITS */}

              <div>

                <label className="block text-sm font-medium text-ink mb-1">
                  Benefits
                </label>

                <textarea
                  rows={2}
                  value={
                    form.benefits
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        benefits:
                          e.target
                            .value,
                      })
                    )
                  }
                  className="input-field"
                  placeholder="Natural nourishment for hair, skin and cooking..."
                />

              </div>

              {/* HOW TO USE */}

              <div>

                <label className="block text-sm font-medium text-ink mb-1">
                  How to Use
                </label>

                <textarea
                  rows={2}
                  value={
                    form.how_to_use
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        how_to_use:
                          e.target
                            .value,
                      })
                    )
                  }
                  className="input-field"
                  placeholder="Use as required..."
                />

              </div>

              {/* STORAGE */}

              <div>

                <label className="block text-sm font-medium text-ink mb-1">
                  Storage Instructions
                </label>

                <textarea
                  rows={2}
                  value={
                    form.storage_instructions
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        storage_instructions:
                          e.target
                            .value,
                      })
                    )
                  }
                  className="input-field"
                  placeholder="Store in a cool, dry place away from direct sunlight."
                />

              </div>

              {/* FEATURED / BEST SELLER */}

              <div className="flex gap-6">

                <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">

                  <input
                    type="checkbox"
                    checked={
                      form.featured
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          featured:
                            e.target
                              .checked,
                        })
                      )
                    }
                    className="accent-palm w-4 h-4"
                  />

                  Featured

                </label>

                <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">

                  <input
                    type="checkbox"
                    checked={
                      form.best_seller
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          best_seller:
                            e.target
                              .checked,
                        })
                      )
                    }
                    className="accent-palm w-4 h-4"
                  />

                  Best Seller

                </label>

              </div>

              {/* ACTIONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="submit"
                  disabled={
                    uploadingImages
                  }
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >

                  {uploadingImages
                    ? 'Uploading...'
                    : editing
                    ? 'Update Product'
                    : 'Create Product'}

                </button>

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    uploadingImages
                  }
                  className="btn-secondary disabled:opacity-50"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

