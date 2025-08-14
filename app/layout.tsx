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
    default: "wscrape - Social Media Comment Analytics Tool",
    template: "%s | wscrape"
  },
  description: "Scrape, sort, and analyze social media comments instantly from TikTok, Instagram, and YouTube. Perfect for creators, marketers, and researchers seeking audience insights.",
  keywords: [
    "social media analytics", "comment scraping", "TikTok comments", "Instagram comments", 
    "YouTube comments", "social media insights", "content analysis", "audience research",
    "social listening", "engagement analytics", "comment analysis", "social media data",
    "creator tools", "marketing analytics", "social media monitoring"
  ],
  authors: [{ name: "wscrape", url: "https://wscrape.com" }],
  creator: "wscrape",
  publisher: "wscrape",
  category: "Business Software",
  classification: "Social Media Analytics Tool",
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
    title: "wscrape - Social Media Comment Analytics Tool",
    description: "Scrape, sort, and analyze social media comments instantly from TikTok, Instagram, and YouTube. Perfect for creators, marketers, and researchers seeking audience insights.",
    url: 'https://wscrape.com',
    siteName: 'wscrape',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'wscrape - Social Media Comment Analytics Tool',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "wscrape - Social Media Comment Analytics Tool",
    description: "Scrape, sort, and analyze social media comments instantly from TikTok, Instagram, and YouTube.",
    creator: '@wscrape',
    site: '@wscrape',
    images: {
      url: '/android-chrome-512x512.png',
      alt: 'wscrape - Social Media Comment Analytics Tool',
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
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "wscrape",
                "alternateName": "wscrape - Social Media Comment Analytics",
                "description": "Scrape, sort, and analyze social media comments instantly from TikTok, Instagram, and YouTube. Perfect for creators, marketers, and researchers seeking audience insights.",
                "url": "https://wscrape.com",
                "applicationCategory": ["BusinessApplication", "AnalyticsApplication", "SocialMediaApplication"],
                "operatingSystem": ["Web Browser", "All"],
                "browserRequirements": "Requires JavaScript. Requires HTML5.",
                "softwareVersion": "1.0",
                "releaseNotes": "Initial release with TikTok, Instagram, and YouTube comment analysis.",
                "datePublished": "2024-12-14",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/ComingSoon",
                  "validFrom": "2024-12-14"
                },
                "creator": {
                  "@type": "Organization",
                  "name": "wscrape",
                  "url": "https://wscrape.com"
                },
                "featureList": [
                  "Social media comment scraping from TikTok, Instagram, and YouTube",
                  "Comment sorting by popularity (likes) and recency (date)",
                  "Data export and analysis tools",
                  "Real-time comment insights",
                  "Audience engagement analytics"
                ],
                "screenshot": "/android-chrome-512x512.png",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "5.0",
                  "ratingCount": "1"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "wscrape",
                "url": "https://wscrape.com",
                "description": "Social Media Comment Analytics Tool",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://wscrape.com/?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "wscrape",
                "url": "https://wscrape.com",
                "logo": "https://wscrape.com/android-chrome-512x512.png",
                "sameAs": [
                  "https://twitter.com/wscrape"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "availableLanguage": "English"
                }
              }
            ])
          }}
        />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//formspree.io" />
        
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
