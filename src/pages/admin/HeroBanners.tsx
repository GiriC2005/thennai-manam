import { useEffect, useState } from 'react';

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

import {
  getAllHeroBanners,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  uploadHeroBannerImage,
  deleteHeroBannerImage,
} from '@/services/api';

import type {
  HeroBanner,
  HeroBannerInput,
} from '@/services/api';

import { useToast } from '@/context/ToastContext';
import Loader from '@/components/Loader';


const emptyForm: HeroBannerInput = {
  title: '',
  subtitle: '',
  offer_text: '',

  desktop_image_url: '',
  mobile_image_url: '',

  button_text: 'Shop Now',
  button_link: '/shop',

  sort_order: 0,
  is_active: true,
};


export default function HeroBanners() {
  const { showToast } = useToast();

  const [banners, setBanners] =
    useState<HeroBanner[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editing, setEditing] =
    useState<HeroBanner | null>(null);

  const [form, setForm] =
    useState<HeroBannerInput>(
      emptyForm
    );

  const [desktopFile, setDesktopFile] =
    useState<File | null>(null);

  const [mobileFile, setMobileFile] =
    useState<File | null>(null);

  const [desktopPreview, setDesktopPreview] =
    useState('');

  const [mobilePreview, setMobilePreview] =
    useState('');


  // =====================================================
  // LOAD
  // =====================================================

  async function loadBanners() {
    try {
      setLoading(true);

      const data =
        await getAllHeroBanners();

      setBanners(data);
    } catch (error) {
      console.error(
        'LOAD HERO BANNERS ERROR:',
        error
      );

      showToast(
        'Failed to load hero banners',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadBanners();
  }, []);


  // =====================================================
  // OPEN ADD
  // =====================================================

  function openAdd() {
    setEditing(null);

    setForm({
      ...emptyForm,
      sort_order:
        banners.length,
    });

    setDesktopFile(null);
    setMobileFile(null);

    setDesktopPreview('');
    setMobilePreview('');

    setShowForm(true);
  }


  // =====================================================
  // OPEN EDIT
  // =====================================================

  function openEdit(
    banner: HeroBanner
  ) {
    setEditing(banner);

    setForm({
      title:
        banner.title || '',

      subtitle:
        banner.subtitle || '',

      offer_text:
        banner.offer_text || '',

      desktop_image_url:
        banner.desktop_image_url,

      mobile_image_url:
        banner.mobile_image_url || '',

      button_text:
        banner.button_text || 'Shop Now',

      button_link:
        banner.button_link || '/shop',

      sort_order:
        banner.sort_order,

      is_active:
        banner.is_active,
    });

    setDesktopFile(null);
    setMobileFile(null);

    setDesktopPreview(
      banner.desktop_image_url
    );

    setMobilePreview(
      banner.mobile_image_url || ''
    );

    setShowForm(true);
  }


  // =====================================================
  // FILE CHANGE
  // =====================================================

  function handleDesktopFile(
    file: File | undefined
  ) {
    if (!file) return;

    setDesktopFile(file);

    setDesktopPreview(
      URL.createObjectURL(file)
    );
  }


  function handleMobileFile(
    file: File | undefined
  ) {
    if (!file) return;

    setMobileFile(file);

    setMobilePreview(
      URL.createObjectURL(file)
    );
  }


  // =====================================================
  // SAVE
  // =====================================================

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!desktopFile &&
        !form.desktop_image_url) {
      showToast(
        'Desktop image is required',
        'error'
      );

      return;
    }

    try {
      setSaving(true);

      let desktopUrl =
        form.desktop_image_url;

      let mobileUrl =
        form.mobile_image_url || null;


      // ===============================================
      // DESKTOP UPLOAD
      // ===============================================

      if (desktopFile) {
        desktopUrl =
          await uploadHeroBannerImage(
            desktopFile,
            'desktop'
          );
      }


      // ===============================================
      // MOBILE UPLOAD
      // ===============================================

      if (mobileFile) {
        mobileUrl =
          await uploadHeroBannerImage(
            mobileFile,
            'mobile'
          );
      }


      const data: Omit<
        HeroBanner,
        'id' | 'created_at' | 'updated_at'
      > = {
        title:
          form.title?.trim() || null,

        subtitle:
          form.subtitle?.trim() || null,

        offer_text:
          form.offer_text?.trim() || null,

        desktop_image_url:
          desktopUrl,

        mobile_image_url:
          mobileUrl,

        button_text:
          form.button_text?.trim() ||
          'Shop Now',

        button_link:
          form.button_link?.trim() ||
          '/shop',

        sort_order:
          Number(form.sort_order) || 0,

        is_active:
          form.is_active ?? true,
      };


      // ===============================================
      // UPDATE
      // ===============================================

      if (editing) {
        await updateHeroBanner(
          editing.id,
          data
        );

        // Delete replaced desktop image
        if (
          desktopFile &&
          editing.desktop_image_url &&
          editing.desktop_image_url !==
            desktopUrl
        ) {
          await deleteHeroBannerImage(
            editing.desktop_image_url
          );
        }


        // Delete replaced mobile image
        if (
          mobileFile &&
          editing.mobile_image_url &&
          editing.mobile_image_url !==
            mobileUrl
        ) {
          await deleteHeroBannerImage(
            editing.mobile_image_url
          );
        }

        showToast(
          'Hero banner updated',
          'success'
        );
      }


      // ===============================================
      // CREATE
      // ===============================================

      else {
        await createHeroBanner(data);

        showToast(
          'Hero banner created',
          'success'
        );
      }


      setShowForm(false);
      setEditing(null);

      setDesktopFile(null);
      setMobileFile(null);

      setDesktopPreview('');
      setMobilePreview('');

      await loadBanners();

    } catch (error: any) {
      console.error(
        'SAVE HERO BANNER ERROR:',
        error
      );

      showToast(
        error?.message ||
          'Failed to save hero banner',
        'error'
      );
    } finally {
      setSaving(false);
    }
  }


  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(
    banner: HeroBanner
  ) {
    const confirmed =
      window.confirm(
        'Delete this hero banner?'
      );

    if (!confirmed) return;

    try {
      await deleteHeroBanner(
        banner.id
      );

      await deleteHeroBannerImage(
        banner.desktop_image_url
      );

      await deleteHeroBannerImage(
        banner.mobile_image_url
      );

      setBanners((prev) =>
        prev.filter(
          (item) =>
            item.id !== banner.id
        )
      );

      showToast(
        'Hero banner deleted',
        'info'
      );

    } catch (error) {
      console.error(
        'DELETE HERO BANNER ERROR:',
        error
      );

      showToast(
        'Failed to delete hero banner',
        'error'
      );
    }
  }


  // =====================================================
  // TOGGLE ACTIVE
  // =====================================================

  async function toggleActive(
    banner: HeroBanner
  ) {
    try {
      const updated =
        await updateHeroBanner(
          banner.id,
          {
            is_active:
              !banner.is_active,
          }
        );

      setBanners((prev) =>
        prev.map((item) =>
          item.id === banner.id
            ? updated
            : item
        )
      );

      showToast(
        banner.is_active
          ? 'Banner disabled'
          : 'Banner enabled',
        'success'
      );

    } catch (error) {
      console.error(
        'TOGGLE HERO BANNER ERROR:',
        error
      );

      showToast(
        'Failed to update banner',
        'error'
      );
    }
  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <Loader
        label="Loading hero banners..."
      />
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-4
      ">

        <div>
          <h1 className="
            font-heading
            text-2xl
            sm:text-3xl
            text-ink
          ">
            Hero Banners
          </h1>

          <p className="
            text-sm
            text-ink-soft
            mt-1
          ">
            Manage homepage promotional banners
          </p>
        </div>


        <div className="
          flex
          gap-2
        ">

          <button
            type="button"
            onClick={loadBanners}
            className="
              px-4
              py-2.5
              rounded-xl
              border
              border-line
              bg-card
              hover:bg-ink/5
              transition
              inline-flex
              items-center
              gap-2
            "
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>


          <button
            type="button"
            onClick={openAdd}
            className="
              btn-primary
              inline-flex
              items-center
              gap-2
            "
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </button>

        </div>

      </div>


      {/* EMPTY */}

      {banners.length === 0 && (
        <div className="
          card
          p-10
          text-center
        ">

          <ImageIcon className="
            w-12
            h-12
            mx-auto
            text-ink/20
            mb-4
          " />

          <h2 className="
            font-heading
            text-xl
            text-ink
          ">
            No Hero Banners
          </h2>

          <p className="
            text-sm
            text-ink-soft
            mt-2
            mb-5
          ">
            Add your first homepage banner.
          </p>

          <button
            type="button"
            onClick={openAdd}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </button>

        </div>
      )}


      {/* BANNERS */}

      <div className="
        grid
        gap-5
      ">

        {banners.map((banner) => (

          <div
            key={banner.id}
            className="
              card
              overflow-hidden
            "
          >

            <div className="
              grid
              lg:grid-cols-[280px_1fr_auto]
              gap-5
              p-4
              sm:p-5
            ">

              {/* IMAGE */}

              <div className="
                aspect-[16/8]
                lg:aspect-[16/9]
                rounded-xl
                overflow-hidden
                bg-bg-warm
              ">

                <img
                  src={
                    banner.desktop_image_url
                  }
                  alt={
                    banner.title ||
                    'Hero banner'
                  }
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

              </div>


              {/* INFO */}

              <div className="
                min-w-0
                flex
                flex-col
                justify-center
              ">

                <div className="
                  flex
                  items-center
                  gap-2
                  flex-wrap
                ">

                  <h2 className="
                    font-heading
                    text-xl
                    text-ink
                  ">
                    {banner.title ||
                      'Untitled Banner'}
                  </h2>

                  <span className={`
                    px-2.5
                    py-1
                    rounded-full
                    text-xs
                    font-medium
                    ${
                      banner.is_active
                        ? 'bg-palm/10 text-palm'
                        : 'bg-ink/5 text-ink-soft'
                    }
                  `}>
                    {banner.is_active
                      ? 'Active'
                      : 'Inactive'}
                  </span>

                </div>


                {banner.offer_text && (
                  <p className="
                    text-sm
                    text-gold
                    font-medium
                    mt-1
                  ">
                    {banner.offer_text}
                  </p>
                )}


                {banner.subtitle && (
                  <p className="
                    text-sm
                    text-ink-soft
                    mt-2
                    line-clamp-2
                  ">
                    {banner.subtitle}
                  </p>
                )}


                <div className="
                  flex
                  items-center
                  gap-3
                  mt-3
                  text-xs
                  text-ink-soft
                ">
                  <span>
                    Order: {banner.sort_order}
                  </span>

                  <span>
                    Button: {banner.button_text}
                  </span>
                </div>

              </div>


              {/* ACTIONS */}

              <div className="
                flex
                lg:flex-col
                items-center
                lg:items-stretch
                gap-2
              ">

                <button
                  type="button"
                  onClick={() =>
                    toggleActive(banner)
                  }
                  className="
                    p-2.5
                    rounded-xl
                    border
                    border-line
                    hover:bg-ink/5
                    transition
                  "
                  title={
                    banner.is_active
                      ? 'Disable'
                      : 'Enable'
                  }
                >
                  {banner.is_active ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>


                <button
                  type="button"
                  onClick={() =>
                    openEdit(banner)
                  }
                  className="
                    p-2.5
                    rounded-xl
                    border
                    border-line
                    hover:bg-ink/5
                    transition
                  "
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleDelete(banner)
                  }
                  className="
                    p-2.5
                    rounded-xl
                    border
                    border-red-200
                    text-red-600
                    hover:bg-red-50
                    transition
                  "
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>


      {/* =================================================
          FORM MODAL
      ================================================= */}

      {showForm && (
        <div className="
          fixed
          inset-0
          z-50
          bg-black/50
          backdrop-blur-sm
          p-4
          overflow-y-auto
        ">

          <div className="
            min-h-full
            flex
            items-center
            justify-center
          ">

            <div className="
              w-full
              max-w-4xl
              bg-card
              rounded-2xl
              shadow-2xl
              overflow-hidden
            ">

              {/* MODAL HEADER */}

              <div className="
                flex
                items-center
                justify-between
                p-5
                border-b
                border-line
              ">

                <div>
                  <h2 className="
                    font-heading
                    text-xl
                    sm:text-2xl
                    text-ink
                  ">
                    {editing
                      ? 'Edit Hero Banner'
                      : 'Add Hero Banner'}
                  </h2>

                  <p className="
                    text-xs
                    sm:text-sm
                    text-ink-soft
                    mt-1
                  ">
                    Upload desktop and mobile
                    promotional images.
                  </p>
                </div>


                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="
                    p-2
                    rounded-lg
                    hover:bg-ink/5
                  "
                >
                  <X className="w-5 h-5" />
                </button>

              </div>


              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="p-5 space-y-5"
              >

                {/* TEXT */}

                <div className="
                  grid
                  sm:grid-cols-2
                  gap-4
                ">

                  <div>
                    <label className="label">
                      Title
                    </label>

                    <input
                      value={
                        form.title || ''
                      }
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          title:
                            e.target.value,
                        }))
                      }
                      className="input"
                      placeholder="Pure Coconut Oil"
                    />
                  </div>


                  <div>
                    <label className="label">
                      Offer Text
                    </label>

                    <input
                      value={
                        form.offer_text || ''
                      }
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          offer_text:
                            e.target.value,
                        }))
                      }
                      className="input"
                      placeholder="20% OFF"
                    />
                  </div>

                </div>


                <div>
                  <label className="label">
                    Subtitle
                  </label>

                  <textarea
                    value={
                      form.subtitle || ''
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        subtitle:
                          e.target.value,
                      }))
                    }
                    className="
                      input
                      min-h-[90px]
                      resize-none
                    "
                    placeholder="Cold pressed • Traditional marachekku • Pure"
                  />
                </div>


                {/* DESKTOP IMAGE */}

                <div>
                  <label className="label">
                    Desktop Banner
                  </label>

                  <label className="
                    block
                    cursor-pointer
                  ">

                    <div className="
                      aspect-[16/6]
                      rounded-xl
                      border-2
                      border-dashed
                      border-line
                      overflow-hidden
                      bg-bg-warm
                      flex
                      items-center
                      justify-center
                    ">

                      {desktopPreview ? (
                        <img
                          src={desktopPreview}
                          alt="Desktop preview"
                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />
                      ) : (
                        <div className="
                          text-center
                          text-ink-soft
                        ">
                          <Upload className="
                            w-8
                            h-8
                            mx-auto
                            mb-2
                          " />

                          <p className="text-sm">
                            Click to upload
                          </p>

                          <p className="
                            text-xs
                            mt-1
                          ">
                            Recommended 1920 × 700
                          </p>
                        </div>
                      )}

                    </div>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        handleDesktopFile(
                          e.target.files?.[0]
                        )
                      }
                    />

                  </label>
                </div>


                {/* MOBILE IMAGE */}

                <div>
                  <label className="label">
                    Mobile Banner
                    <span className="
                      text-xs
                      text-ink-soft
                      font-normal
                      ml-1
                    ">
                      (Optional)
                    </span>
                  </label>

                  <label className="
                    block
                    cursor-pointer
                    max-w-md
                  ">

                    <div className="
                      aspect-[4/5]
                      sm:aspect-[4/3]
                      rounded-xl
                      border-2
                      border-dashed
                      border-line
                      overflow-hidden
                      bg-bg-warm
                      flex
                      items-center
                      justify-center
                    ">

                      {mobilePreview ? (
                        <img
                          src={mobilePreview}
                          alt="Mobile preview"
                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />
                      ) : (
                        <div className="
                          text-center
                          text-ink-soft
                          p-5
                        ">
                          <Upload className="
                            w-8
                            h-8
                            mx-auto
                            mb-2
                          " />

                          <p className="text-sm">
                            Click to upload
                          </p>

                          <p className="
                            text-xs
                            mt-1
                          ">
                            Recommended 900 × 1100
                          </p>
                        </div>
                      )}

                    </div>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        handleMobileFile(
                          e.target.files?.[0]
                        )
                      }
                    />

                  </label>
                </div>


                {/* BUTTON */}

                <div className="
                  grid
                  sm:grid-cols-3
                  gap-4
                ">

                  <div>
                    <label className="label">
                      Button Text
                    </label>

                    <input
                      value={
                        form.button_text ||
                        ''
                      }
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          button_text:
                            e.target.value,
                        }))
                      }
                      className="input"
                      placeholder="Shop Now"
                    />
                  </div>


                  <div>
                    <label className="label">
                      Button Link
                    </label>

                    <input
                      value={
                        form.button_link ||
                        ''
                      }
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          button_link:
                            e.target.value,
                        }))
                      }
                      className="input"
                      placeholder="/shop"
                    />
                  </div>


                  <div>
                    <label className="label">
                      Sort Order
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.sort_order ?? 0
                      }
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          sort_order:
                            Number(
                              e.target.value
                            ),
                        }))
                      }
                      className="input"
                    />
                  </div>

                </div>


                {/* ACTIVE */}

                <label className="
                  flex
                  items-center
                  gap-3
                  cursor-pointer
                  p-4
                  rounded-xl
                  bg-bg-warm
                ">

                  <input
                    type="checkbox"
                    checked={
                      form.is_active ?? true
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        is_active:
                          e.target.checked,
                      }))
                    }
                    className="
                      w-4
                      h-4
                      accent-palm
                    "
                  />

                  <div>
                    <p className="
                      text-sm
                      font-medium
                      text-ink
                    ">
                      Active Banner
                    </p>

                    <p className="
                      text-xs
                      text-ink-soft
                    ">
                      Show this banner on homepage
                    </p>
                  </div>

                </label>


                {/* ACTIONS */}

                <div className="
                  flex
                  justify-end
                  gap-3
                  pt-2
                  border-t
                  border-line
                ">

                  <button
                    type="button"
                    onClick={() =>
                      setShowForm(false)
                    }
                    className="
                      px-5
                      py-2.5
                      rounded-xl
                      border
                      border-line
                      hover:bg-ink/5
                    "
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={saving}
                    className="
                      btn-primary
                      min-w-[130px]
                      justify-center
                    "
                  >
                    {saving ? (
                      'Saving...'
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {editing
                          ? 'Update Banner'
                          : 'Save Banner'}
                      </>
                    )}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}