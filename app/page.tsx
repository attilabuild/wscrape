'use client';

import { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';

export default function Home() {
  const [state, handleSubmit] = useForm("mblkbgqv");

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
                <a href="#benefits" className="text-gray-300 hover:text-white transition-colors">Benefits</a>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r  text-black bg-white  px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-all"
              >
                Join Waitlist
              </button>
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
            <span className="font-medium">Coming Soon, Join the Beta</span>
          </div>

          {/* Main Heading - Single cohesive block */}
          <h1 className="mb-6 text-3xl font-bold leading-[1.1] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Scrape, Sort, and Analyze{" "}
            <span className="text-gray-300">
              Social Media Comments
            </span>{" "}
            Instantly
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-300">
            Wscrape helps you uncover the most-liked and most-recent comments on TikTok, Instagram, and YouTube: perfect for creators, marketers, and researchers.
          </p>

          {/* Waitlist Form */}
          {state.succeeded ? (
            <div className="mx-auto max-w-lg rounded-lg border border-green-600/20 bg-green-900/20 p-6 backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-center text-xl font-semibold text-green-400">
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You're on the list!
              </div>
              <p className="text-green-300">We'll notify you as soon as wscrape is ready.</p>
            </div>
          ) : (
            <div className="mx-auto max-w-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name (optional)"
                    className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all focus:border-white focus:bg-white/10 focus:outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    required
                    className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all focus:border-white focus:bg-white/10 focus:outline-none"
                  />
                </div>
                <ValidationError 
                  prefix="Email" 
                  field="email"
                  errors={state.errors}
                  className="text-red-400 text-sm"
                />
                <button
                  type="submit"
                  disabled={state.submitting}
                  className="group relative inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-lg bg-white px-8 font-semibold text-black transition-all duration-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative">
                    {state.submitting ? 'Joining...' : 'Join the Waitlist'}
                  </span>
                </button>
              </form>
              <p className="mt-4 text-sm text-gray-500">
                We'll only email you about the launch. No spam.
              </p>
            </div>
          )}
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
              How wscrape Works
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-gray-300">
              Powerful tools to extract, analyze, and understand social media engagement
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Scrape Any Video or Post</h3>
              <p className="text-gray-400 leading-relaxed">
                Pull comments from TikTok, Instagram, or YouTube instantly. Just paste the link and let wscrape do the work.
              </p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Sort by Likes or Date</h3>
              <p className="text-gray-400 leading-relaxed">
                Quickly find the most engaging conversations by sorting comments by popularity or recency.
              </p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Export and Analyze</h3>
              <p className="text-gray-400 leading-relaxed">
                Save comments for research, marketing, or insights. Export to CSV or analyze trends directly in wscrape.
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
                Why wscrape?
              </h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">Save time by seeing top comments instantly</h3>
                    <p className="text-gray-400">No more endless scrolling through thousands of comments. Get the best insights in seconds.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">Understand what resonates with your audience</h3>
                    <p className="text-gray-400">Discover the types of content and conversations that generate the most engagement.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">Plan content and campaigns smarter</h3>
                    <p className="text-gray-400">Use real engagement data to inform your content strategy and marketing decisions.</p>
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
                    <h3 className="mb-2 text-2xl font-bold text-white">Data-Driven Insights</h3>
                    <p className="text-gray-400">Transform social media noise into actionable intelligence</p>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="text-2xl font-bold text-white">85%</div>
                      <div className="text-sm text-gray-400">Faster Analysis</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="text-2xl font-bold text-white">10k+</div>
                      <div className="text-sm text-gray-400">Comments/Min</div>
                    </div>
                  </div>
                </div>
              </div>
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
            <span className="font-medium">Early Access</span>
          </div>
          <h2 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">
            Join the Early Beta
          </h2>
          <p className="mb-12 text-xl text-gray-300">
            Sign up now to be among the first to access wscrape. Spaces are limited!
          </p>
          
          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold text-white">500+</div>
              <p className="text-gray-400">Creators on waitlist</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold text-white">3</div>
              <p className="text-gray-400">Major platforms supported</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-2 text-3xl font-bold text-white">Late 2025</div>
              <p className="text-gray-400">Launch date</p>
            </div>
          </div>

          {!state.succeeded && (
            <button
              onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-white px-8 font-medium text-black transition-all duration-300 hover:bg-gray-200"
            >
              <span className="relative">Join the Waitlist</span>
            </button>
          )}
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
                Scrape, sort, and analyze social media comments instantly.
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
              wscrape is not affiliated with TikTok, Instagram, or YouTube.
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