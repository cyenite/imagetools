import { Helmet } from 'react-helmet-async';

const SEOHead = ({
    title,
    description,
    canonicalUrl,
    imageUrl = '/og-image.jpg',
    type = 'website'
}) => {
    const siteTitle = 'ImageTools.xyz - Free Online Image Utilities';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={`https://imagetools.xyz${canonicalUrl}`} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`https://imagetools.xyz${imageUrl}`} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`https://imagetools.xyz${imageUrl}`} />

            {/* Additional SEO tags */}
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
        </Helmet>
    );
};

export default SEOHead; 