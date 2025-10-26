'use client';

import { useState, useEffect } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [state, handleSubmit] = useForm("mblkbgqv");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsChecking(false);
      
      if (session) {
        router.push('/dashboard');
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-white">
                wscrape
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="#benefits" className="text-gray-300 hover:text-white transition-colors">Benefits</a>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <a 
                    href="/dashboard"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="bg-gradient-to-r text-black bg-white px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-all"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <a 
                    href="/login"
                    className="text-gray-300 hover:text-white transition-colors mr-2"
                  >
                    Login
                  </a>
                  <a 
                    href="/signup"
                    className="bg-gradient-to-r text-black bg-white px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-all"
                  >
                    Get started
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black px-4 pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 h-full w-full bg-black" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex h-7 items-center justify-between rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white transition-all ease-in hover:cursor-pointer hover:bg-white/20">
            <svg className="mr-2 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">AI-Powered Content Creation</span>
          </div>

          {/* Main Heading - Single cohesive block */}
          <h1 className="mb-6 text-3xl font-bold leading-[1.1] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            The Most Powerful{" "}
            <span className="text-gray-300">
            AI App for
            </span>{" "}
          Viral Content Creation
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-300">
            Scrape viral content, analyze comments, generate AI scripts, predict viral potential, and manage your content library - all in one powerful platform.
          </p>

          {/* Hero CTAs */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-medium text-black hover:bg-gray-200 transition-colors"
            >
              Get started for $29.99/mo
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-medium text-white hover:bg-white/10 transition-colors"
            >
              View pricing
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 bg-black">
        {/* Background Grid */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <div className="mb-8 inline-flex h-7 items-center justify-between rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white">
              <span className="font-medium">Features</span>
            </div>
            <h2 className="max-w-4xl mx-auto text-center text-4xl font-bold leading-tight text-white md:text-6xl">
              Everything You Need to Go Viral
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-gray-300">
              From content scraping to AI generation, viral prediction to comment analysis - your complete social media toolkit
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Content Scraping & Analysis</h3>
              <p className="text-gray-400 leading-relaxed">
                Extract viral content from any creator on TikTok, Instagram, and more. Analyze hooks, captions, and performance metrics to understand what works.
              </p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Comment Intelligence</h3>
              <p className="text-gray-400 leading-relaxed">
                Scrape and analyze comments from viral posts. Understand audience sentiment, extract engagement patterns, and discover what resonates with viewers.
              </p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">AI Content Generation & Prediction</h3>
              <p className="text-gray-400 leading-relaxed">
                Generate viral scripts with AI, predict content performance, and create unlimited variations of winning content tailored to your niche.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative py-20 bg-black">
        {/* Background Grid */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="mb-8 inline-flex h-7 items-center justify-between rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white">
                <span className="font-medium">Benefits</span>
              </div>
              <h2 className="mb-8 text-4xl font-bold leading-tight text-white md:text-6xl">
                Why Creators Love AI?
              </h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">Never run out of content ideas again</h3>
                    <p className="text-gray-400">Generate endless viral content variations. Turn one winning post into weeks of fresh content for your brand.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">Steal from million-dollar creators instantly</h3>
                    <p className="text-gray-400">Extract winning formulas from top creators. Copy their hooks, adapt their strategies, and scale faster than ever.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">10x your content output with AI automation</h3>
                    <p className="text-gray-400">Scale your content creation to compete with big creators. Create more, post more, grow faster with AI assistance.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="relative">
                <div className="rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                  <div className="mb-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-white">AI Content Engine</h3>
                    <p className="text-gray-400">Transform viral content into endless fresh ideas</p>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="text-2xl font-bold text-white">10x</div>
                      <div className="text-sm text-gray-400">Content Speed</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="text-2xl font-bold text-white">∞</div>
                      <div className="text-sm text-gray-400">Ideas Generated</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-20 bg-black">
        {/* Background Grid */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mb-8 inline-flex h-7 items-center justify-between rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white">
            <span className="font-medium">Simple Pricing</span>
          </div>
          <h2 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">
            One Plan. Everything Included.
          </h2>
          <p className="mb-12 text-xl text-gray-300">
            No hidden fees. No complicated tiers. Just powerful tools to grow your content.
          </p>

          {/* Pricing Card */}
          <div className="mx-auto max-w-lg">
            <div className="rounded-2xl border-2 border-white/20 bg-white/5 p-8 backdrop-blur-sm hover:border-white/40 transition-all">
              {/* Price */}
              <div className="mb-8 text-center">
                <div className="text-6xl font-bold text-white mb-2">
                  $29.99
                </div>
                <div className="text-gray-400 text-lg">per month</div>
              </div>

              {/* Features Grid */}
              <div className="space-y-4 mb-8 text-left">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Unlimited Content Scraping</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">AI Content Idea Generation</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Content Calendar & Scheduling</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Export Data (CSV/JSON)</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Priority Support</span>
                </div>
              </div>

              {/* CTA */}
              <a
                href="/signup"
                className="block w-full bg-white text-black py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors text-center"
              >
                Start Creating Now
              </a>

              <p className="mt-6 text-sm text-gray-400">
                Cancel anytime. No long-term contracts. Secure payment by Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / FOMO Section */}
      <section className="relative py-20 bg-black">
        {/* Background Grid */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mb-8 inline-flex h-7 items-center justify-between rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white">
            <span className="font-medium">AI Content Creator</span>
          </div>
          <h2 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">
            Start Creating Today
          </h2>
          <p className="mb-12 text-xl text-gray-300">
            Join thousands of creators using AI to scale their content. Professional tools for serious creators.
          </p>
          
          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold text-white">1K+</div>
              <p className="text-gray-400">Content pieces generated</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold text-white">New</div>
              <p className="text-gray-400">Analysis tools</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold text-white">$29.99</div>
              <p className="text-gray-400">Per month</p>
            </div>
          </div>

          <a
            href="/login"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-white px-8 font-medium text-black transition-all duration-300 hover:bg-gray-200"
          >
            <span className="relative">Get started</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative bg-black py-12">
        {/* Background Grid */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4 text-3xl font-bold text-white">
                wscrape
              </div>
              <p className="mb-4 text-gray-400">
                AI-powered content creation and competitor analysis for social media creators.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 transition-colors hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="text-gray-400 transition-colors hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="text-gray-400 transition-colors hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="mb-4 text-lg font-semibold text-white">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 transition-colors hover:text-white">Features</a></li>
                <li><a href="#benefits" className="text-gray-400 transition-colors hover:text-white">Benefits</a></li>
                <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 text-lg font-semibold text-white">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row">
            <p className="mb-4 text-sm text-gray-400 md:mb-0">
              wscrape - AI Content Creation Assistant. Not affiliated with TikTok or Instagram.
            </p>
            <p className="text-sm text-gray-500">
              Copyright © 2025 wscrape. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}