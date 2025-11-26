'use client';

import Link from 'next/link';

export default function OriginsOfGenAIPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <p className="text-xs uppercase text-neutral-400 tracking-wide">
          Scorpion Academy
        </p>
        <h1 className="text-2xl font-bold mt-1">
          Origins of Generative AI: From Analysis to Creation
        </h1>
        <p className="text-neutral-300 mt-2 text-sm">
          Based on internal learning material explaining how generative AI evolved
          from analytical models into creative systems.
        </p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">The Shift: From Analysis → Creation</h2>
        <p>
          Early AI focused on validation, classification, and pattern detection.
          The emergence of generative models shifted AI from a purely analytical
          tool to a creative system capable of producing new data.
        </p>
        <div className="bg-neutral-800/50 rounded p-3 mt-2">
          <p className="text-xs text-neutral-300">
            <strong>Before Generative AI:</strong> AI could analyze, classify, and predict.
            <br />
            <strong>After Generative AI:</strong> AI can create, generate, and synthesize new content.
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">2014: GANs Begin the Revolution</h2>
        <p>
          Generative Adversarial Networks (GANs) introduced adversarial training — a
          generator creates data while a discriminator evaluates authenticity.
          This sparked the first creative AI boom.
        </p>
        <div className="bg-neutral-800/50 rounded p-3 mt-2">
          <p className="text-xs text-neutral-300">
            <strong>GAN Architecture:</strong> Generator (creates) vs Discriminator (evaluates)
            <br />
            <strong>Best for:</strong> Realistic image generation, high-quality visuals
            <br />
            <strong>Example:</strong> StyleGAN for photorealistic faces, DeepFake technology
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">VAEs: Compressed Creativity</h2>
        <p>
          Variational Autoencoders (VAEs) encode data into a latent space and decode it
          to generate new outputs, ideal for producing coherent variations.
        </p>
        <div className="bg-neutral-800/50 rounded p-3 mt-2">
          <p className="text-xs text-neutral-300">
            <strong>VAE Architecture:</strong> Encoder → Latent Space → Decoder
            <br />
            <strong>Best for:</strong> Generating variations of existing images, logo remixes, style exploration
            <br />
            <strong>Example:</strong> Creating 10 variations of a logo design
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">2017-2020: Transformers & LLMs</h2>
        <p>
          The transformer architecture revolutionized natural language processing.
          Large Language Models (LLMs) rely on self-attention mechanisms, enabling
          long-context reasoning and fluid natural-language generation.
        </p>
        <div className="bg-neutral-800/50 rounded p-3 mt-2">
          <p className="text-xs text-neutral-300">
            <strong>Transformer Architecture:</strong> Self-attention, encoder-decoder
            <br />
            <strong>Best for:</strong> Text generation, conversation, reasoning, code generation
            <br />
            <strong>Examples:</strong> GPT, Claude, Gemini, ChatGPT
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">2020-2022: Diffusion Models</h2>
        <p>
          Diffusion models (like Stable Diffusion, DALL-E) generate images by
          iteratively denoising random noise. They produce high-quality, diverse
          images and have become the standard for image generation.
        </p>
        <div className="bg-neutral-800/50 rounded p-3 mt-2">
          <p className="text-xs text-neutral-300">
            <strong>Diffusion Process:</strong> Noise → Iterative Denoising → Final Image
            <br />
            <strong>Best for:</strong> High-quality image generation, text-to-image, image editing
            <br />
            <strong>Examples:</strong> Stable Diffusion, DALL-E, Midjourney
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100 border-t border-neutral-700 pt-4">
        <h2 className="text-lg font-semibold">Quick Reference: When to Use What</h2>
        <div className="space-y-2">
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">📝 Text Generation</p>
            <p className="text-xs text-neutral-300">→ Use <strong>LLM (Transformer)</strong></p>
            <p className="text-xs text-neutral-400 mt-1">Examples: GPT, Claude, Gemini</p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">🖼️ New Image Generation</p>
            <p className="text-xs text-neutral-300">→ Use <strong>Diffusion</strong> or <strong>GAN</strong></p>
            <p className="text-xs text-neutral-400 mt-1">Examples: Stable Diffusion, DALL-E, StyleGAN</p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">🔄 Image Variations</p>
            <p className="text-xs text-neutral-300">→ Use <strong>VAE</strong></p>
            <p className="text-xs text-neutral-400 mt-1">Best for: Logo remixes, style variations</p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">✏️ Image Editing/Style Transfer</p>
            <p className="text-xs text-neutral-300">→ Use <strong>Diffusion</strong></p>
            <p className="text-xs text-neutral-400 mt-1">Best for: Inpainting, style transfer, edits</p>
          </div>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100 border-t border-neutral-700 pt-4">
        <h2 className="text-lg font-semibold">Why This Matters for Scorpion</h2>
        <p>
          Scorpion chooses the correct generative architecture based on user intent.
          GANs for realistic images, VAEs for structured variation, LLMs for language
          and reasoning, Diffusion for high-quality image generation. This improves accuracy,
          reduces hallucinations, and boosts creativity.
        </p>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 mt-2">
          <p className="text-xs text-emerald-300">
            <strong>💡 Tip:</strong> When you ask Scorpion to generate something, the Generative Models Council
            automatically checks that you&apos;re using the right architecture. Check the Council tab
            to see its recommendations.
          </p>
        </div>
      </section>

      <div className="border-t border-neutral-700 pt-4">
        <Link
          href="/academy/ai-foundations"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to AI Foundations
        </Link>
      </div>
    </div>
  );
}

