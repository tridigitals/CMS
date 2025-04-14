import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ImagePlus, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface MetaFieldsProps {
  title?: string;
  metaDescription: string;
  metaKeywords: string;
  featuredImage: File | null;
  onMetaDescriptionChange: (value: string) => void;
  onMetaKeywordsChange: (value: string) => void;
  onFeaturedImageChange: (file: File | null) => void;
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
  errors
}) => {
  const [seoScore, setSeoScore] = useState<SEOScore>({
    score: 0,
    color: 'gray',
    suggestions: []
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFeaturedImageChange(file);
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
                    onClick={() => onFeaturedImageChange(null)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              {errors?.featured_image && (
                <p className="text-red-500 text-sm mt-1">{errors.featured_image}</p>
              )}
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
    </Card>
  );
};

export default MetaFields;