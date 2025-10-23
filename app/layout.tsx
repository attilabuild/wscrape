import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "wscrape - Complete Social Media Intelligence Platform",
    template: "%s | wscrape"
  },
  description: "Complete AI-powered social media intelligence platform. Scrape viral content, analyze comments, generate AI scripts, predict viral potential, and manage your content library. Professional tools for serious creators.",
  keywords: [
    "AI content creation", "viral content generator", "social media scraper", "TikTok scraper", 
    "Instagram analysis", "YouTube analytics", "comment analysis", "viral prediction", 
    "AI script generator", "content intelligence", "social media automation", "creator tools",
    "content marketing", "viral marketing", "social media growth", "AI content assistant",
    "content optimization", "engagement analytics", "social listening", "competitor analysis"
  ],
  authors: [{ name: "wscrape", url: "https://wscrape.com" }],
  creator: "wscrape",
  publisher: "wscrape",
  category: "Business Software",
  classification: "AI Content Creation Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://wscrape.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "wscrape - Complete Social Media Intelligence Platform",
    description: "Complete AI-powered social media intelligence platform. Scrape viral content, analyze comments, generate AI scripts, predict viral potential, and manage your content library.",
    url: 'https://wscrape.com',
    siteName: 'wscrape',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'wscrape - AI-Powered Social Media Intelligence Platform',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "wscrape - Complete Social Media Intelligence Platform",
    description: "AI-powered platform for viral content creation. Scrape content, analyze comments, generate scripts, predict viral potential.",
    creator: '@wscrape',
    site: '@wscrape',
    images: {
      url: '/android-chrome-512x512.png',
      alt: 'wscrape - AI-Powered Social Media Intelligence Platform',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2' },
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-touch-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-touch-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-touch-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#000000',
      },
    ],
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional SEO Meta Tags */}
        <meta name="application-name" content="wscrape" />
        <meta name="apple-mobile-web-app-title" content="wscrape" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#000000" />
        
        {/* Enhanced SEO Meta Tags */}
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="language" content="en" />
        <meta name="revisit-after" content="7 days" />
        <meta name="expires" content="never" />
        <meta name="cache-control" content="public" />
        
        {/* Business Information */}
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="ICBM" content="39.7392, -104.9903" />
        
        {/* Content Classification */}
        <meta name="subject" content="AI Content Creation, Social Media Analytics, Viral Marketing" />
        <meta name="abstract" content="AI-powered social media intelligence platform for content creators and marketers" />
        <meta name="topic" content="Social Media Marketing Tools" />
        <meta name="summary" content="Complete platform for viral content creation, social media scraping, comment analysis, and AI-powered script generation" />
        <meta name="Classification" content="Business Software" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "wscrape",
              "alternateName": "wscrape - AI-Powered Social Media Intelligence Platform",
              "description": "Complete AI-powered social media intelligence platform. Scrape viral content, analyze comments, generate AI scripts, predict viral potential, and manage your content library. Professional tools for serious creators.",
              "url": "https://wscrape.com",
              "applicationCategory": ["BusinessApplication", "AnalyticsApplication", "SocialMediaApplication", "ContentManagementApplication"],
              "operatingSystem": ["Web Browser", "All"],
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "softwareVersion": "2.0",
              "releaseNotes": "Complete platform with AI content generation, viral prediction, comment analysis, and content management.",
              "datePublished": "2024-12-14",
              "dateModified": "2025-01-01",
              "offers": {
                "@type": "Offer",
                "price": "20",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "validFrom": "2024-12-14",
                "priceSpecification": {
                  "@type": "RecurringCharge",
                  "frequency": "Monthly",
                  "billingDuration": "P1M"
                }
              },
              "creator": {
                "@type": "Organization",
                "name": "wscrape",
                "url": "https://wscrape.com"
              },
              "featureList": [
                "AI-powered viral content generation and script creation",
                "Social media content scraping from TikTok, Instagram, YouTube",
                "Comment analysis and sentiment tracking",
                "Viral potential prediction using AI algorithms",
                "Content library management and organization",
                "Performance analytics and engagement metrics",
                "Competitor analysis and content intelligence",
                "Automated content variations and templates"
              ],
              "screenshot": "/android-chrome-512x512.png",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150",
                "bestRating": "5",
                "worstRating": "1"
              },
              "review": [
                {
                  "@type": "Review",
                  "author": {
                    "@type": "Person",
                    "name": "Content Creator"
                  },
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "reviewBody": "Game-changer for content creators. The AI script generation is incredibly accurate and the viral prediction helps me focus on content that actually performs."
                }
              ]
            })
          }}
        />
        
        {/* Additional Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "wscrape",
              "legalName": "wscrape LLC",
              "url": "https://wscrape.com",
              "logo": "https://wscrape.com/android-chrome-512x512.png",
              "description": "AI-powered social media intelligence platform for content creators",
              "foundingDate": "2024",
              "sameAs": [
                "https://twitter.com/wscrape",
                "https://linkedin.com/company/wscrape"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "email": "support@wscrape.com",
                "availableLanguage": ["English"]
              }
            })
          }}
        />
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "wscrape",
              "url": "https://wscrape.com",
              "description": "Complete AI-powered social media intelligence platform",
              "publisher": {
                "@type": "Organization",
                "name": "wscrape"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://wscrape.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is wscrape?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "wscrape is a complete AI-powered social media intelligence platform that helps creators scrape viral content, analyze comments, generate AI scripts, predict viral potential, and manage their content library."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How much does wscrape cost?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "wscrape costs $20 per month and includes all features: content scraping, comment analysis, AI script generation, viral prediction, and content management tools."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Which platforms does wscrape support?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "wscrape supports TikTok, Instagram, YouTube, and Twitter for content scraping and comment analysis."
                  }
                }
              ]
            })
          }}
        />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//formspree.io" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/android-chrome-512x512.png" as="image" type="image/png" />
        <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
        
        {/* Additional favicon links for better browser support */}
        <link rel="shortcut icon" href="/favicon.ico?v=2" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.png?v=2" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png?v=2" sizes="16x16" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
