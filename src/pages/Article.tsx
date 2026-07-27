import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Calendar, Share2, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import { ArticleToolbar } from '@/components/ArticleToolbar';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

export default function Article() {
  const { '*': slugPath } = useParams();
  const slug = slugPath || '';
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  // Update meta tags when article loads
  useEffect(() => {
    if (article) {
      const plainTextContent = article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const description = plainTextContent.substring(0, 155) + (plainTextContent.length > 155 ? '...' : '');
      const url = window.location.href;

      // Update document title
      document.title = `${article.title} | JerinMR`;

      // Helper to set or create meta tag
      const setMetaTag = (property: string, content: string, isName = false) => {
        const attr = isName ? 'name' : 'property';
        let tag = document.querySelector(`meta[${attr}="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attr, property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      // Open Graph tags
      setMetaTag('og:title', article.title);
      setMetaTag('og:description', description);
      setMetaTag('og:url', url);
      setMetaTag('og:type', 'article');
      
      // Twitter Card tags
      setMetaTag('twitter:card', 'summary', true);
      setMetaTag('twitter:title', article.title, true);
      setMetaTag('twitter:description', description, true);
      
      // Standard meta description
      setMetaTag('description', description, true);

      // Article structured data
      let ld = document.getElementById('article-jsonld');
      if (!ld) {
        ld = document.createElement('script');
        ld.setAttribute('type', 'application/ld+json');
        ld.id = 'article-jsonld';
        document.head.appendChild(ld);
      }
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description,
        datePublished: article.created_at,
        dateModified: article.created_at,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: {
          '@type': 'Person',
          name: 'Jerin M R',
          url: 'https://www.jerinmr.com',
        },
        publisher: {
          '@type': 'Person',
          name: 'Jerin M R',
          url: 'https://www.jerinmr.com',
        },
      });
    }

    return () => {
      // Reset title on unmount
      document.title = 'JerinMR';
      document.getElementById('article-jsonld')?.remove();
    };
  }, [article]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;
      setArticle(data);

      // Fetch related articles (excluding current)
      if (data) {
        const { data: related } = await supabase
          .from('articles')
          .select('*')
          .eq('published', true)
          .neq('id', data.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        setRelatedArticles(related || []);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          url: url,
        });
      } catch (err) {
        // User cancelled or error - fall back to copy
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-terminal-green/20 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-terminal-green border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="font-mono text-sm text-muted-foreground animate-pulse">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-mono text-2xl text-terminal-green">Article not found</h1>
          <p className="font-mono text-sm text-muted-foreground">
            The article you're looking for doesn't exist or has been unpublished.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="font-mono"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const wordCount = article.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="font-mono text-xs sm:text-sm px-2 sm:px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <ArticleToolbar />
            <Button 
              variant="outline" 
              onClick={handleShare}
              className="font-mono text-xs sm:text-sm border-terminal-green/50 hover:bg-terminal-green/10 px-2 sm:px-4"
            >
              {copied ? (
                <Check className="w-4 h-4 sm:mr-2" />
              ) : (
                <Share2 className="w-4 h-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
            </Button>
          </div>
        </div>

        <article className="space-y-4 sm:space-y-6">
          <header className="border-b border-terminal-green/30 pb-4 sm:pb-6">
            <h1 className="font-mono text-xl sm:text-2xl md:text-4xl text-terminal-green leading-tight mb-3 sm:mb-4">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-mono text-muted-foreground">
              <span className="flex items-center gap-1 sm:gap-1.5">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                {new Date(article.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <span className="w-1 h-1 rounded-full bg-terminal-green/50" />
              <span>{wordCount} words</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-terminal-green/50" />
              <span className="hidden sm:inline">~{Math.ceil(wordCount / 200)} min read</span>
            </div>
          </header>

          <div 
            className="prose prose-sm max-w-none text-foreground prose-headings:text-terminal-green prose-a:text-terminal-green prose-p:text-sm sm:prose-p:text-base prose-headings:text-base sm:prose-headings:text-lg md:prose-headings:text-xl"
            style={{ fontSize: 'var(--article-font-scale, 100%)' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
          />
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-terminal-green/30">
            <h2 className="font-mono text-lg sm:text-xl text-terminal-green mb-4 sm:mb-6">
              Related Articles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => {
                const excerpt = related.content.replace(/<[^>]*>/g, ' ').substring(0, 100) + '...';
                return (
                  <Link key={related.id} to={`/article/${related.slug}`}>
                    <Card className="h-full border-terminal-green/20 hover:border-terminal-green/50 hover:bg-terminal-green/5 transition-all duration-200 cursor-pointer">
                      <CardHeader className="p-4">
                        <CardTitle className="font-mono text-sm sm:text-base text-terminal-green line-clamp-2">
                          {related.title}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs text-muted-foreground line-clamp-2 mt-2">
                          {excerpt}
                        </CardDescription>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                          <span className="font-mono text-xs text-muted-foreground">
                            {new Date(related.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <ArrowRight className="w-4 h-4 text-terminal-green" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <footer className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-border">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="font-mono text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
            Back to Home
          </Button>
        </footer>
      </div>
    </div>
  );
}
