'use client';

import Link from 'next/link';

export default function AIFoundationsPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <header>
        <p className="text-xs uppercase text-neutral-400 tracking-wide">
          Scorpion Academy
        </p>
        <h1 className="text-2xl font-bold mt-1">
          AI Foundations: From ML to Generative AI
        </h1>
        <p className="text-neutral-300 mt-2 text-sm">
          Adapted from internal learning material with Audrey Thibodeau-Belin,
          innovation expert and certified AI consultant.
        </p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="font-semibold text-lg">What is Artificial Intelligence?</h2>
        <p>
          Artificial intelligence (AI) is about using computers to reproduce
          abilities that would normally require human intelligence, and
          sometimes to even exceed it. AI is not one single technique, but a
          family of approaches that work together.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="font-semibold text-lg">Machine Learning (ML)</h2>
        <p>
          Machine learning is one of the most widely used techniques in AI. It
          uses algorithms that learn from large amounts of data: they analyze,
          classify, detect patterns, and can then make predictions or detect
          anomalies.
        </p>
        <p>
          In an insurance context, ML can power predictive models for pricing
          and risk management, helping humans make better decisions. A familiar
          everyday example is the YouTube recommendation system, which adjusts
          video suggestions based on what you have already watched.
        </p>
        <div className="bg-neutral-800/50 rounded p-3 mt-2">
          <p className="text-xs text-neutral-300">
            <strong>Use ML for:</strong> Prediction, classification, recommendation systems, risk modeling, anomaly detection
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="font-semibold text-lg">Deep Learning and Neural Networks</h2>
        <p>
          Deep learning is an advanced branch of machine learning that relies on
          multi-layer neural networks, inspired by the structure of the human
          brain. These models can automatically learn complex features from data
          without manually engineered rules.
        </p>
        <p>
          For example, deep learning powers apps like Google Photos, which can
          recognize people or animals in your pictures.
        </p>
        <div className="bg-neutral-800/50 rounded p-3 mt-2">
          <p className="text-xs text-neutral-300">
            <strong>Use Deep Learning for:</strong> Complex pattern recognition, image classification, speech recognition, when simpler ML isn't sufficient
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="font-semibold text-lg">From ML & DL to Generative AI</h2>
        <p>
          Machine learning and deep learning paved the way for generative AI
          (GenAI), which can create new data: text, images, code, and more.
          This creative ability is one of the reasons AI applications have grown
          so rapidly in recent years, especially after the public release of
          tools like ChatGPT.
        </p>
        <div className="bg-neutral-800/50 rounded p-3 mt-2">
          <p className="text-xs text-neutral-300">
            <strong>Use GenAI for:</strong> Creating new content, text generation, image generation, code generation, creative tasks
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="font-semibold text-lg">NLP and Large Language Models (LLMs)</h2>
        <p>
          Tools like ChatGPT and Copilot rely on several subfields, including
          natural language processing (NLP), which enables machines to
          understand, analyze, and generate human language.
        </p>
        <p>
          Conversational assistants use large language models (LLMs), trained on
          vast amounts of public text data. These models can answer questions,
          draft content, and hold conversations in natural language.
        </p>
        <div className="bg-neutral-800/50 rounded p-3 mt-2">
          <p className="text-xs text-neutral-300">
            <strong>Use NLP/LLMs for:</strong> Text understanding, chatbots, language translation, sentiment analysis, conversational AI
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="font-semibold text-lg">Computer Vision</h2>
        <p>
          Computer vision enables machines to interpret and understand visual
          information from images and videos. This subfield uses deep learning
          models (especially CNNs) to recognize objects, detect faces, classify
          scenes, and more.
        </p>
        <p>
          Examples include facial recognition in security systems, medical image
          analysis, autonomous vehicle navigation, and quality control in
          manufacturing.
        </p>
        <div className="bg-neutral-800/50 rounded p-3 mt-2">
          <p className="text-xs text-neutral-300">
            <strong>Use Computer Vision for:</strong> Image recognition, object detection, face detection, medical imaging, autonomous vehicles
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="font-semibold text-lg">Other Subfields</h2>
        <p>
          We could also talk about autonomous vehicles, robotics, reinforcement
          learning, and other specialized areas, which are all part of the
          broader AI ecosystem. These will be covered in future Academy
          modules.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100 border-t border-neutral-700 pt-4">
        <h2 className="font-semibold text-lg">Where Scorpion Fits</h2>
        <p>
          Scorpion primarily leverages generative AI and LLMs (for reasoning,
          planning, and explanations), combined with classic machine learning
          and retrieval techniques to connect with your tools and data. When the
          AI Foundations Council runs, it checks that the right technique is
          used for the right problem: prediction vs. generation, text vs.
          images, etc.
        </p>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 mt-2">
          <p className="text-xs text-emerald-300">
            <strong>💡 Tip:</strong> When you ask Scorpion to build something, the AI Foundations Council
            automatically checks that you're using the right AI subfield. Check the Council tab
            to see its recommendations.
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100 border-t border-neutral-700 pt-4">
        <h2 className="font-semibold text-lg">Quick Reference: When to Use What</h2>
        <div className="space-y-2">
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">📊 Prediction/Classification</p>
            <p className="text-xs text-neutral-300">→ Use <strong>Machine Learning</strong> (or Deep Learning for complex patterns)</p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">💬 Text/Conversation</p>
            <p className="text-xs text-neutral-300">→ Use <strong>NLP/LLMs</strong></p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">🎨 Generate New Content</p>
            <p className="text-xs text-neutral-300">→ Use <strong>Generative AI/LLMs</strong></p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">🖼️ Images/Visual</p>
            <p className="text-xs text-neutral-300">→ Use <strong>Computer Vision</strong></p>
          </div>
        </div>
      </section>

      <div className="border-t border-neutral-700 pt-4">
        <Link
          href="/chat"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to Chat
        </Link>
      </div>
    </div>
  );
}

