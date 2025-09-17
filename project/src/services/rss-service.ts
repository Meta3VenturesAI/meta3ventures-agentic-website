import { blogService } from './blog-service';
import type { BlogPost } from '../types/blog-enhanced';

export class RSSService {
  private siteUrl = 'https://meta3ventures.com';
  private feedUrl = `${this.siteUrl}/rss.xml`;
  
  async generateRSSFeed(): Promise<string> {
    const { data: posts } = await blogService.getPosts({
      status: 'published',
      sort_by: 'date',
      sort_order: 'desc',
      limit: 20
    });
    
    const rssItems = posts.map(post => this.generateRSSItem(post)).join('\n');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Meta3Ventures Blog</title>
    <link>${this.siteUrl}/blog</link>
    <description>AI Innovation & Digital Transformation - Insights from Meta3Ventures</description>
    <language>en-US</language>
    <copyright>Copyright ${new Date().getFullYear()} Meta3Ventures</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${this.feedUrl}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${this.siteUrl}/og-image.jpg</url>
      <title>Meta3Ventures</title>
      <link>${this.siteUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;
  }
  
  private generateRSSItem(post: BlogPost): string {
    const postUrl = `${this.siteUrl}/blog/${post.slug}`;
    const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString();
    
    return `<item>
      <title><![CDATA[${this.escapeXml(post.title)}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${this.escapeXml(post.excerpt)}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <dc:creator><![CDATA[${post.author?.name || 'Meta3Ventures Team'}]]></dc:creator>
      <pubDate>${pubDate}</pubDate>
      ${post.category ? `<category><![CDATA[${post.category.name}]]></category>` : ''}
      ${post.tags?.map(tag => `<category><![CDATA[${tag.name}]]></category>`).join('\n') || ''}
      ${post.featured_image ? `<enclosure url="${post.featured_image}" type="image/jpeg"/>` : ''}
    </item>`;
  }
  
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  async generateAtomFeed(): Promise<string> {
    const { data: posts } = await blogService.getPosts({
      status: 'published',
      sort_by: 'date',
      sort_order: 'desc',
      limit: 20
    });
    
    const atomEntries = posts.map(post => this.generateAtomEntry(post)).join('\n');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Meta3Ventures Blog</title>
  <link href="${this.siteUrl}/blog" />
  <link href="${this.siteUrl}/atom.xml" rel="self" />
  <updated>${new Date().toISOString()}</updated>
  <id>${this.siteUrl}/blog</id>
  <author>
    <name>Meta3Ventures</name>
    <email>info@meta3ventures.com</email>
  </author>
  ${atomEntries}
</feed>`;
  }
  
  private generateAtomEntry(post: BlogPost): string {
    const postUrl = `${this.siteUrl}/blog/${post.slug}`;
    const updated = post.updated_at || post.created_at;
    
    return `<entry>
      <title>${this.escapeXml(post.title)}</title>
      <link href="${postUrl}" />
      <id>${postUrl}</id>
      <updated>${new Date(updated).toISOString()}</updated>
      <summary>${this.escapeXml(post.excerpt)}</summary>
      <content type="html"><![CDATA[${post.content}]]></content>
      <author>
        <name>${post.author?.name || 'Meta3Ventures Team'}</name>
      </author>
      ${post.tags?.map(tag => `<category term="${this.escapeXml(tag.name)}" />`).join('\n') || ''}
    </entry>`;
  }
  
  async generateJSONFeed(): Promise<string> {
    const { data: posts } = await blogService.getPosts({
      status: 'published',
      sort_by: 'date',
      sort_order: 'desc',
      limit: 20
    });
    
    const feed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: 'Meta3Ventures Blog',
      home_page_url: `${this.siteUrl}/blog`,
      feed_url: `${this.siteUrl}/feed.json`,
      description: 'AI Innovation & Digital Transformation',
      icon: `${this.siteUrl}/favicon.ico`,
      favicon: `${this.siteUrl}/favicon.ico`,
      authors: [{
        name: 'Meta3Ventures',
        url: this.siteUrl,
        avatar: `${this.siteUrl}/og-image.jpg`
      }],
      language: 'en-US',
      items: posts.map(post => ({
        id: `${this.siteUrl}/blog/${post.slug}`,
        url: `${this.siteUrl}/blog/${post.slug}`,
        title: post.title,
        summary: post.excerpt,
        content_html: post.content,
        date_published: post.published_at,
        date_modified: post.updated_at,
        authors: [{
          name: post.author?.name || 'Meta3Ventures Team',
          avatar: post.author?.avatar_url
        }],
        tags: post.tags?.map(tag => tag.name),
        image: post.featured_image
      }))
    };
    
    return JSON.stringify(feed, null, 2);
  }
}

export const rssService = new RSSService();