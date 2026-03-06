import React from 'react';
import { Helmet } from 'react-helmet-async';
import heroBanner from '../assets/Hero-banner.jpg';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    type?: string;
    name?: string;
    image?: string;
    url?: string;
    robots?: string;
    jsonLd?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    type = 'website',
    name = 'Авторозбірка Стадники',
    image,
    url,
    robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    jsonLd
}) => {
    const defaultTitle = 'Авторозбірка Стадники | Б/В Запчастини Ford, Renault та інші';
    const defaultOgTitle = 'Авторозбірка Стадники | Б/В Запчастини';
    const defaultDescription = 'Оригінальні та перевірені Б/В запчастини для Ford, Renault та інших авто. Швидка доставка по всій Україні.';
    const defaultKeywords = 'розбірка авто, Б/В запчастини, авторозбірка, запчастини Ford, запчастини Renault, оригінальні запчастини, купити запчастини Україна, Авторозбірка Стадники';

    const seoTitle = title ? `${title} | ${name}` : defaultTitle;
    const ogTitle = title ? seoTitle : defaultOgTitle;
    const seoDescription = description || defaultDescription;
    const seoKeywords = keywords || defaultKeywords;
    const seoImage = image || heroBanner;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{seoTitle}</title>
            <meta name="description" content={seoDescription} />
            <meta name="keywords" content={seoKeywords} />
            <meta name="author" content={name} />
            <meta name="publisher" content={name} />
            <meta name="robots" content={robots} />

            {/* Open Graph tags (Facebook, LinkedIn, etc.) */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={ogTitle} />
            <meta property="og:description" content={seoDescription} />
            <meta property="og:site_name" content={name} />
            {url && <meta property="og:url" content={url} />}
            <meta property="og:image" content={seoImage} />

            {/* Twitter tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={ogTitle} />
            <meta name="twitter:description" content={seoDescription} />
            <meta name="twitter:image" content={seoImage} />

            {/* Itemprop metadata (Google+, etc.) */}
            <meta itemProp="name" content={seoTitle} />
            <meta itemProp="description" content={seoDescription} />
            <meta itemProp="image" content={seoImage} />

            {/* Canonical */}
            {url && <link rel="canonical" href={url} />}

            {/* JSON-LD Schema */}
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
        </Helmet>
    );
};

export default SEO;