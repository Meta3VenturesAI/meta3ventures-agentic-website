import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { rssService } from '../../services/rss-service';

// This component handles RSS feed routes
export const RSSFeed: React.FC = () => {
  const { format } = useParams<{ format: string }>();

  useEffect(() => {
    const generateFeed = async () => {
      let content = '';
      let contentType = '';

      try {
        switch (format) {
          case 'rss':
          case 'rss.xml':
            content = await rssService.generateRSSFeed();
            contentType = 'application/rss+xml';
            break;
          case 'atom':
          case 'atom.xml':
            content = await rssService.generateAtomFeed();
            contentType = 'application/atom+xml';
            break;
          case 'json':
          case 'feed.json':
            content = await rssService.generateJSONFeed();
            contentType = 'application/json';
            break;
          default:
            content = await rssService.generateRSSFeed();
            contentType = 'application/rss+xml';
        }

        // Create a blob and trigger download
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        // Set proper headers by redirecting to the blob URL
        window.location.href = url;
      } catch (error) {
        console.error('Error generating feed:', error);
      }
    };

    generateFeed();
  }, [format]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Generating RSS feed...</p>
      </div>
    </div>
  );
};

// API handler for server-side RSS generation (for Next.js or similar)
export async function generateRSSHandler(format: string = 'rss'): Promise<Response> {
  let content = '';
  let contentType = '';

  try {
    switch (format) {
      case 'rss':
        content = await rssService.generateRSSFeed();
        contentType = 'application/rss+xml; charset=utf-8';
        break;
      case 'atom':
        content = await rssService.generateAtomFeed();
        contentType = 'application/atom+xml; charset=utf-8';
        break;
      case 'json':
        content = await rssService.generateJSONFeed();
        contentType = 'application/feed+json; charset=utf-8';
        break;
      default:
        content = await rssService.generateRSSFeed();
        contentType = 'application/rss+xml; charset=utf-8';
    }

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('RSS generation error:', error);
    return new Response('Error generating feed', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

export default RSSFeed;