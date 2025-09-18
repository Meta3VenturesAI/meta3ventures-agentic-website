import React, { useState } from 'react';
import { 
  Twitter, 
  Facebook, 
  Linkedin, 
  Link2, 
  Mail, 
  MessageCircle,
  Share2,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  via?: string;
  className?: string;
  showLabel?: boolean;
  variant?: 'inline' | 'floating' | 'modal';
}

export const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  description = '',
  tags = [],
  via = 'meta3ventures',
  className = '',
  showLabel = true,
  variant = 'inline'
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtags = tags.map(tag => tag.replace(/\s+/g, '')).join(',');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=${via}${hashtags ? `&hashtags=${hashtags}` : ''}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async (platform: string, shareUrl?: string) => {
    // Track share event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_type: 'article',
        item_id: url
      });
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const ShareButton = ({ 
    icon: Icon, 
    label, 
    color, 
    onClick 
  }: { 
    icon: React.ElementType; 
    label: string; 
    color: string; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${color}`}
      aria-label={`Share on ${label}`}
    >
      <Icon className="w-5 h-5" />
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </button>
  );

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="relative">
          <button
            onClick={handleNativeShare}
            className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
            aria-label="Share article"
          >
            <Share2 className="w-6 h-6" />
          </button>
          
          {showShareMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-900 rounded-lg shadow-xl p-2 min-w-[200px]">
              <ShareButton
                icon={Twitter}
                label="Twitter"
                color="hover:text-blue-400"
                onClick={() => handleShare('twitter', shareLinks.twitter)}
              />
              <ShareButton
                icon={Facebook}
                label="Facebook"
                color="hover:text-blue-600"
                onClick={() => handleShare('facebook', shareLinks.facebook)}
              />
              <ShareButton
                icon={Linkedin}
                label="LinkedIn"
                color="hover:text-blue-700"
                onClick={() => handleShare('linkedin', shareLinks.linkedin)}
              />
              <ShareButton
                icon={MessageCircle}
                label="WhatsApp"
                color="hover:text-green-600"
                onClick={() => handleShare('whatsapp', shareLinks.whatsapp)}
              />
              <ShareButton
                icon={Mail}
                label="Email"
                color="hover:text-gray-600"
                onClick={() => handleShare('email', shareLinks.email)}
              />
              <div className="border-t dark:border-gray-700 mt-2 pt-2">
                <ShareButton
                  icon={copied ? Check : Link2}
                  label={copied ? 'Copied!' : 'Copy Link'}
                  color="hover:text-indigo-600"
                  onClick={handleCopyLink}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Share:
        </span>
      )}
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleShare('twitter', shareLinks.twitter)}
          className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleShare('facebook', shareLinks.facebook)}
          className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleShare('linkedin', shareLinks.linkedin)}
          className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-700 transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleShare('whatsapp', shareLinks.whatsapp)}
          className="p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleShare('email', shareLinks.email)}
          className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          aria-label="Share via Email"
        >
          <Mail className="w-4 h-4" />
        </button>
        
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors"
          aria-label="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SocialShare;