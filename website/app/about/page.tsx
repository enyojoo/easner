'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main style={{ paddingTop: '4.5rem' }}>
        <section className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-unbounded">
                About Easner
              </h1>

              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Easner is building cross-border stablecoin banking for businesses and individuals. We believe money should move globally like SMS: instant, low-cost, and compliant.
                </p>
                <p>
                  Our infrastructure combines stablecoin rails with built-in KYC/AML, licensed partner networks, and API-first design — so fintechs, businesses, and individuals can move money between the US, Europe, Africa, and Asia without the friction of traditional banking.
                </p>
                <p>
                  We are building toward institutional backing and are excited to partner with investors who share our vision for the future of global payments.
                </p>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
                <p className="text-lg text-gray-600">
                  Have questions? Reach us at{" "}
                  <a href="mailto:hello@easner.com" className="text-easner-primary hover:underline font-medium">
                    hello@easner.com
                  </a>
                </p>
              </div>

            </motion.div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
