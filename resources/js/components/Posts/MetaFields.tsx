import React, { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import debounce from 'lodash/debounce';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ImagePlus, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MediaItem {
  id: number;
  url: string;
  name: string;
  created_at: string;
  thumb_url?: string;
  mime_type?: string;
}

interface MediaLibraryResponse {
  data: MediaItem[];
  current_page: number;
  last_page: number;
  total: number;
}

interface MetaFieldsProps {
  title?: string;
  metaDescription: string;
  metaKeywords: string;
  featuredImage: { id: number; url: string } | null;
  onMetaDescriptionChange: (value: string) => void;
  onMetaKeywordsChange: (value: string) => void;
  onFeaturedImageChange: (value: { id: number; url: string } | null) => void;
  featuredImagePreview?: string;
  errors?: {
    meta_description?: string;
    meta_keywords?: string;
    featured_image?: string;
  };
}

interface SEOScore {
  score: number;
  color: string;
  suggestions: string[];
}

const OPTIMAL_META_DESCRIPTION_LENGTH = 155;
const MAX_META_DESCRIPTION_LENGTH = 160;

const MetaFields: React.FC<MetaFieldsProps> = ({
  title = '',
  metaDescription,
  metaKeywords,
  featuredImage,
  onMetaDescriptionChange,
  onMetaKeywordsChange,
  onFeaturedImageChange,
  featuredImagePreview,
  errors,
}) => {
  const [seoScore, setSeoScore] = useState<SEOScore>({
    score: 0,
    color: 'gray',
    suggestions: []
  });

  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      await fetchMedia(1, query, false);
    }, 300),
    []
  );

  const fetchMedia = async (page: number, search: string = '', append: boolean = false) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        route('media.meta-fields', { page, search }),
        { headers: { 'Accept': 'application/json' } }
      );

      if (!res.ok) {
        throw new Error('Failed to fetch media');
      }

      const data: MediaLibraryResponse = await res.json();
      
      // Only append if explicitly requested (infinite scroll)
      if (append && page > 1) {
        setMediaList(prev => [...prev, ...(data.data || [])]);
      } else {
        setMediaList(data.data || []);
      }
      
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
      setTotalItems(data.total);
    } catch (error) {
      console.error('Error fetching media:', error);
      setMediaList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mediaModalOpen) {
      setMediaList([]);
      setCurrentPage(1);
      setLastPage(1);
      setTotalItems(0);
      fetchMedia(1, searchQuery, false);
    }
  }, [mediaModalOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      const res = await fetch(route('media.upload'), {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken
        },
        body: formData,
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to upload file');
      }

      const media = await res.json();

      // Update media library list
      setMediaList(prev => [media, ...prev]);
      // Set the file as featured image (pakai url langsung, tidak fetch ulang)
      onFeaturedImageChange({ id: media.id, url: media.url }); 
    } catch (error) {
      console.error('Error uploading file:', error);
      // Show error in UI
      if (errors && typeof errors === 'object') {
        errors.featured_image = error instanceof Error ? error.message : 'Failed to upload file';
      }
    }
  };

  const calculateSEOScore = () => {
    const suggestions: string[] = [];
    let score = 0;

    // Check meta description length
    if (metaDescription.length === 0) {
      suggestions.push('Meta description is missing');
    } else if (metaDescription.length < 120) {
      suggestions.push('Meta description is too short (min. 120 characters)');
      score += 33;
    } else if (metaDescription.length <= MAX_META_DESCRIPTION_LENGTH) {
      score += 100;
    } else {
      suggestions.push('Meta description is too long (max. 160 characters)');
      score += 66;
    }

    // Check meta keywords
    if (metaKeywords.length === 0) {
      suggestions.push('Meta keywords are missing');
    } else {
      const keywordCount = metaKeywords.split(',').filter(k => k.trim()).length;
      if (keywordCount < 3) {
        suggestions.push('Add more meta keywords (min. 3 recommended)');
        score += 33;
      } else {
        score += 100;
      }
    }

    // Check featured image
    if (!featuredImage) {
      suggestions.push('Featured image is missing');
    } else {
      score += 100;
    }

    // Calculate final score
    const finalScore = Math.floor(score / 3);

    return {
      score: finalScore,
      color: finalScore < 33 ? 'red' : finalScore < 66 ? 'yellow' : 'green',
      suggestions
    };
  };

  useEffect(() => {
    const score = calculateSEOScore();
    setSeoScore(score);
  }, [metaDescription, metaKeywords, featuredImage]);

  const getScoreIcon = (color: string) => {
    switch (color) {
      case 'green':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'yellow':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'red':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getGoogleSnippetPreview = () => {
    const displayTitle = title || 'Page Title';
    const displayUrl = 'example.com › page';
    const displayDescription = metaDescription || 'No meta description provided...';

    return (
      <div className="max-w-2xl font-arial">
        <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer">
          {displayTitle}
        </div>
        <div className="text-[#006621] text-sm">
          {displayUrl}
        </div>
        <div className="text-sm text-[#545454] line-clamp-2">
          {displayDescription}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="general" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">SEO & Media</h2>
          <div className="flex items-center gap-2">
            {getScoreIcon(seoScore.color)}
            <span className="text-sm font-medium">SEO Score: {seoScore.score}%</span>
          </div>
        </div>

        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={metaDescription}
                onChange={(e) => onMetaDescriptionChange(e.target.value)}
                placeholder="Enter meta description for SEO"
                className="mt-1"
                maxLength={MAX_META_DESCRIPTION_LENGTH}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-500">
                  {metaDescription.length} / {MAX_META_DESCRIPTION_LENGTH} characters
                </span>
                <Progress
                  value={(metaDescription.length / OPTIMAL_META_DESCRIPTION_LENGTH) * 100}
                  className="w-1/2"
                  indicatorClassName={
                    metaDescription.length > MAX_META_DESCRIPTION_LENGTH
                      ? "bg-red-500"
                      : metaDescription.length > OPTIMAL_META_DESCRIPTION_LENGTH
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }
                />
              </div>
              {errors?.meta_description && (
                <p className="text-red-500 text-sm mt-1">{errors.meta_description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="meta_keywords">Focus Keywords</Label>
              <Input
                id="meta_keywords"
                value={metaKeywords}
                onChange={(e) => onMetaKeywordsChange(e.target.value)}
                placeholder="Enter keywords, separated by commas"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Add your main keywords, separated by commas
              </p>
              {errors?.meta_keywords && (
                <p className="text-red-500 text-sm mt-1">{errors.meta_keywords}</p>
              )}
            </div>

            <div>
              <Label htmlFor="featured_image">Featured Image</Label>
              <div className="mt-1 flex items-center space-x-4">
                <div
                  className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('featured_image')?.click()}
                >
                  {featuredImagePreview ? (
                    <img
                      src={featuredImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="w-8 h-8 mx-auto text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2">Upload Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="featured_image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                {featuredImagePreview && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onFeaturedImageChange(null);
                    }}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              {errors?.featured_image && (
                <p className="text-red-500 text-sm mt-1">{errors.featured_image}</p>
              )}
              <button
                type="button"
                className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                onClick={async () => {
                  setMediaModalOpen(true);
                  if (mediaList.length === 0) {
                    fetchMedia(1, searchQuery, false);
                  }
                }}
              >
                Pilih dari Media Library
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Google Preview</h3>
            <div className="p-4 border rounded-lg bg-white">
              {getGoogleSnippetPreview()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">SEO Analysis</h3>
            <ul className="space-y-2">
              {seoScore.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  {suggestion}
                </li>
              ))}
              {seoScore.suggestions.length === 0 && (
                <li className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  All SEO checks passed!
                </li>
              )}
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      {mediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full h-[80vh] shadow-lg relative flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Media Library ({totalItems} items)</h3>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                onClick={() => setMediaModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="flex-grow">
                <Input
                  type="search"
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  className="w-full"
                />
              </div>

              <label htmlFor="modal-file-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                <ImagePlus className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  id="modal-file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div
              className="flex-grow overflow-y-auto"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                if (
                  target.scrollHeight - target.scrollTop === target.clientHeight &&
                  currentPage < lastPage &&
                  !isLoading
                ) {
                  fetchMedia(currentPage + 1, searchQuery, true); // Set append to true for infinite scroll
                }
              }}
            >
              <div className="grid grid-cols-4 gap-4 p-2">
                {mediaList.length === 0 && !isLoading ? (
                  <div className="col-span-4 text-center py-8 text-gray-500">
                    No images found
                  </div>
                ) : (
                  mediaList.filter(media => media.thumb_url && media.thumb_url.endsWith('.webp') && media.mime_type && media.mime_type.startsWith('image/')).map((media) => (
                    <div
                      key={media.id}
                      className="group relative aspect-square border rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500 transition-all"
                      onClick={() => {
                        onFeaturedImageChange({ id: media.id, url: media.thumb_url || media.url });
                        setMediaModalOpen(false);
                      }}
                    >
                      <img
                        src={media.thumb_url}
                        alt={media.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs">
                          {media.name}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {isLoading && (
                <div className="text-center py-4">
                  Loading...
                </div>
              )}
            </div>

            <div>
              {/* Pagination controls */}
              <div className="flex justify-center gap-2 mt-4">
                <button
                  disabled={currentPage === 1 || isLoading}
                  onClick={() => {
                    if (currentPage > 1) fetchMedia(currentPage - 1, searchQuery, false);
                  }}
                  className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  &laquo; Sebelumnya
                </button>
                <span className="px-2 py-1">{currentPage} / {lastPage}</span>
                <button
                  disabled={currentPage === lastPage || isLoading}
                  onClick={() => {
                    if (currentPage < lastPage) fetchMedia(currentPage + 1, searchQuery, false);
                  }}
                  className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  Berikutnya &raquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MetaFields;