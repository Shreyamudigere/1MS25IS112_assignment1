import { CuratedPaper } from '../types/paper';

export const CURATED_PAPERS: CuratedPaper[] = [
  {
    id: 'mamba-ssm',
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authors: 'Albert Gu, Tri Dao (Carnegie Mellon & Princeton)',
    year: '2023',
    domain: 'NLP / Efficient Architectures',
    tag: 'Selective SSM',
    url: 'https://arxiv.org/abs/2312.00752',
    abstractSnippet: 'Foundational models are dominated by Transformers with quadratic complexity. Mamba introduces selective state space models (SSMs) with input-dependent parameters and hardware-aware scan algorithms to achieve linear scaling and 5x faster inference.',
    defaultAnalysis: {
      paper: {
        title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
        authors: ['Albert Gu', 'Tri Dao'],
        year: '2023',
        venueOrOrg: 'arXiv / Princeton & CMU',
        primaryDomain: 'Efficient Deep Learning / Sequence Modeling',
        summaryTagline: 'Linear-time sequence modeling with input-dependent selective state spaces and hardware-aware GPU parallel scan.',
        url: 'https://arxiv.org/abs/2312.00752',
        pdfUrl: 'https://arxiv.org/pdf/2312.00752.pdf',
        arxivId: '2312.00752',
      },
      coreConcept: {
        wordCount: 245,
        problemStatement: 'Transformer architectures rely on self-attention, whose quadratic computational and memory complexity O(N²) in sequence length makes scaling to long contexts (e.g., 1M tokens or DNA sequences) prohibitive and inference slow due to expanding KV caches.',
        primaryMethodology: 'Mamba replaces attention with Selective State Space Models (S6). Unlike prior Linear Time-Invariant (LTI) SSMs, Mamba makes the transition matrices input-dependent, allowing the network to dynamically filter out irrelevant information while compressing salient context into a fixed-size recurrent state.',
        mathematicalBreakthroughs: 'The paper bridges continuous-time state space discretization with a hardware-aware parallel associative scan. By computing states directly in fast GPU SRAM and avoiding materializing the O(B×L×D×N) intermediate expanded states in high-bandwidth memory (HBM), Mamba achieves linear time scaling O(N) and 5× higher inference throughput than Transformers of equivalent capacity.',
        fullSummary: 'Transformers dominate sequence modeling but suffer from quadratic O(N²) computational complexity and high inference latency from KV caching. Mamba introduces a selective state space model (SSM) architecture that achieves linear-time sequence processing O(N) while matching or outperforming Transformers across modalities. The core innovation lies in making state transition parameters input-dependent, giving the model content-based reasoning capabilities that earlier linear models lacked. To overcome the computational bottleneck of time-varying recurrence, the authors developed a hardware-aware parallel scan that computes hidden states directly within GPU SRAM without writing intermediate representations back to slow high-bandwidth memory (HBM). Mamba demonstrates 5× higher generation throughput, linear scaling with sequence length up to 1M tokens, and superior empirical performance across language modeling, genomics, and audio processing tasks.',
      },
      architecturalFlowchart: {
        mermaidCode: `graph TD
    classDef inputStyle fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef blockStyle fill:#0f172a,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
    classDef ssmStyle fill:#1e1b4b,stroke:#a855f7,stroke-width:2px,color:#f8fafc;
    classDef outputStyle fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#f8fafc;

    InputTokens["Input Tokens [B, L]"]:::inputStyle --> Embed["Embedding & LayerNorm"]:::blockStyle
    Embed --> MambaBlock["Mamba Layer Stack ×N"]:::blockStyle

    subgraph MambaBlockStructure ["Inside Mamba SSM Block"]
        LinearIn["Linear Input Projection [B, L, 2D]"]:::blockStyle
        LinearIn --> BranchA["Branch A: Conv1D + SiLU [B, L, D]"]:::blockStyle
        LinearIn --> BranchB["Branch B: Gating SiLU [B, L, D]"]:::blockStyle
        
        BranchA --> SelectiveParams["Selective Parameter Projections (Δ, B, C)"]:::ssmStyle
        SelectiveParams --> Discretization["Discretization: A_bar = exp(Δ·A), B_bar = (Δ·A)⁻¹(A_bar - I)·Δ·B"]:::ssmStyle
        Discretization --> ParallelScan["Hardware-Aware GPU Parallel Scan in SRAM"]:::ssmStyle
        
        ParallelScan --> GatedMult["Element-wise Multiplication ⊗"]:::ssmStyle
        BranchB --> GatedMult
        GatedMult --> LinearOut["Linear Output Projection [B, L, D]"]:::blockStyle
    end

    MambaBlock --> ResidualAdd["Residual Connection (+) & RMSNorm"]:::blockStyle
    ResidualAdd --> LMHead["Language Modeling Head / Softmax"]:::blockStyle
    LMHead --> NextToken["Next Token Probabilities [B, L, V]"]:::outputStyle`,
        dataInputs: ['Input Token Sequence [B, L]', 'Continuous State Space Parameters (A, B, C, Δ)'],
        components: [
          { name: 'Linear In-Projection', role: 'Expands token dimension by factor E=2' },
          { name: '1D Causal Convolution', role: 'Prevents independent token processing and encodes local inductive bias' },
          { name: 'Selective Parameter Module', role: 'Computes input-dependent selection parameters B(x), C(x), and step size Δ(x)' },
          { name: 'GPU SRAM Parallel Associative Scan', role: 'Executes recurrence without intermediate HBM writes for O(N) throughput' },
          { name: 'Multiplicative Gate', role: 'Controls information flow similar to Gated Linear Units (GLU)' },
        ],
        modelLayers: ['Embedding', 'Mamba Stack (×N)', 'Selective SSM Kernels', 'RMSNorm', 'LM Head'],
        dataOutputs: ['Predicted Next Token Logits', 'Fixed-size Compressed Hidden State'],
      },
      internshipOpportunities: [
        {
          id: 1,
          title: 'Mamba-Edge: Quantized INT4 ONNX Runtime Deployment for Raspberry Pi',
          extension: 'Quantizing Mamba selective SSM state transition matrices into INT4/INT8 and writing a custom ONNX Runtime execution provider for ARM edge processors.',
          targetMetric: 'Achieving 3.8× inference speedup and 68% RAM reduction on Raspberry Pi 5 with less than 0.8 perplexity drop.',
          techStack: ['PyTorch', 'ONNX Runtime', 'Torch-TensorRT', 'C++ / CUDA / ARM NEON'],
          difficulty: 'Intermediate 3rd Year',
          whyImpressive: 'Edge AI inference optimization demonstrates low-level systems engineering and hardware acceleration skills highly valued by robotics and device teams.',
          resumeBullet: 'Engineered an INT4-quantized Mamba SSM inference engine in ONNX Runtime for ARM64 edge devices, cutting memory footprint by 68% and boosting token generation to 28 tokens/sec on Raspberry Pi 5.',
          weeklyMilestones: [
            'Week 1: Benchmark baseline Mamba-130M and profile memory bottlenecks during token generation.',
            'Week 2: Implement post-training quantization (PTQ) on selection projection matrices (B, C, Δ).',
            'Week 3: Export optimized computational graph to ONNX and evaluate perplexity on WikiText-103.',
            'Week 4: Benchmark latency on edge hardware, write comprehensive benchmark report, and open-source GitHub repo.',
          ],
          recommendedStarterRepo: 'state-spaces/mamba (Official CMU Repository)',
        },
        {
          id: 2,
          title: 'Hybrid Mamba-Attention Mixture for Needle-in-a-Haystack Retrieval',
          extension: 'Replacing 75% of Transformer self-attention layers with Mamba SSM blocks while preserving sparse attention heads for exact associative recall.',
          targetMetric: 'Reducing end-to-end memory by 60% on 32k context windows while achieving 99.4% needle-in-a-haystack retrieval accuracy.',
          techStack: ['PyTorch', 'FlashAttention-2', 'HuggingFace Transformers', 'vLLM'],
          difficulty: 'Advanced 3rd Year',
          whyImpressive: 'Shows deep architectural understanding of hybrid architectures (similar to Jamba / Nemotron) and benchmark rigor on long-context tasks.',
          resumeBullet: 'Designed and trained a hybrid Mamba-Transformer architecture using PyTorch and FlashAttention, reducing KV-cache VRAM by 60% while maintaining 99.4% recall on 32K context retrieval benchmarks.',
          weeklyMilestones: [
            'Week 1: Set up HuggingFace baseline and integrate modular Mamba blocks into LLaMA-style decoder.',
            'Week 2: Fine-tune hybrid model on SlimPajama using LoRA and evaluate attention layer ratios.',
            'Week 3: Implement Needle-In-A-Haystack retrieval evaluation suite across 4k to 32k context lengths.',
            'Week 4: Conduct ablation study comparing pure SSM vs hybrid and package interactive Gradio demo.',
          ],
          recommendedStarterRepo: 'state-spaces/mamba and huggingface/transformers',
        },
        {
          id: 3,
          title: 'Streaming Audio Separation with Mamba Multi-Scale State Spaces',
          extension: 'Adapting Mamba selective state spaces for real-time streaming audio separation and speech enhancement instead of standard dilated ConvNets.',
          targetMetric: 'Sub-15ms algorithmic latency with +2.8 dB SI-SDRi improvement over Conv-TasNet on LibriMix benchmark.',
          techStack: ['PyTorch', 'Torchaudio', 'Soundfile', 'Librosa'],
          difficulty: 'Capstone Ready',
          whyImpressive: 'Applying a foundational language model breakthrough to cross-domain signal processing demonstrates exceptional versatility in applied ML.',
          resumeBullet: 'Developed a real-time speech separation model utilizing multi-scale Mamba SSMs, achieving +2.8 dB SI-SDRi improvement over Conv-TasNet with real-time sub-15ms inference latency.',
          weeklyMilestones: [
            'Week 1: Ingest LibriMix audio benchmark and prepare STFT feature extraction pipeline in Torchaudio.',
            'Week 2: Build multi-scale Mamba encoder-decoder replacing standard 1D dilated convolutions.',
            'Week 3: Train using scale-invariant signal-to-distortion ratio (SI-SDR) loss and measure streaming latency.',
            'Week 4: Export web demo with WebAudio API playback and record project walkthrough video for portfolio.',
          ],
          recommendedStarterRepo: 'speechbrain/speechbrain or facebookresearch/demucs',
        },
      ],
      rawOutput: `1. CORE CONCEPT EXTRACTION:
Transformers dominate sequence modeling but suffer from quadratic O(N²) computational complexity and high inference latency from KV caching. Mamba introduces a selective state space model (SSM) architecture that achieves linear-time sequence processing O(N) while matching or outperforming Transformers across modalities. The core innovation lies in making state transition parameters input-dependent, giving the model content-based reasoning capabilities that earlier linear models lacked. To overcome the computational bottleneck of time-varying recurrence, the authors developed a hardware-aware parallel scan that computes hidden states directly within GPU SRAM without writing intermediate representations back to slow high-bandwidth memory (HBM). Mamba demonstrates 5× higher generation throughput, linear scaling with sequence length up to 1M tokens, and superior empirical performance across language modeling, genomics, and audio processing tasks.

2. ARCHITECTURAL FLOWCHART (Mermaid.js):
[FLOWCHART]
graph TD
    InputTokens["Input Tokens [B, L]"] --> Embed["Embedding & LayerNorm"]
    Embed --> LinearIn["Linear Input Projection [B, L, 2D]"]
    LinearIn --> BranchA["Branch A: Conv1D + SiLU [B, L, D]"]
    LinearIn --> BranchB["Branch B: Gating SiLU [B, L, D]"]
    BranchA --> SelectiveParams["Selective Parameter Projections (Δ, B, C)"]
    SelectiveParams --> Discretization["Discretization: A_bar, B_bar"]
    Discretization --> ParallelScan["Hardware-Aware GPU Parallel Scan in SRAM"]
    ParallelScan --> GatedMult["Element-wise Multiplication ⊗"]
    BranchB --> GatedMult
    GatedMult --> LinearOut["Linear Output Projection [B, L, D]"]
    LinearOut --> ResidualAdd["Residual Add (+) & RMSNorm"]
    ResidualAdd --> LMHead["Language Modeling Head"]
    LMHead --> NextToken["Next Token Probabilities [B, L, V]"]

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
1. Mamba-Edge: Quantized INT4 ONNX Runtime Deployment for Raspberry Pi
- Extension: Quantizing Mamba selective SSM state transition matrices into INT4/INT8 and writing a custom ONNX Runtime execution provider for ARM edge processors.
- Target Metric: Achieving 3.8× inference speedup and 68% RAM reduction on Raspberry Pi 5 with less than 0.8 perplexity drop.
- Tech Stack: PyTorch, ONNX Runtime, Torch-TensorRT, C++ / CUDA / ARM NEON

2. Hybrid Mamba-Attention Mixture for Needle-in-a-Haystack Retrieval
- Extension: Replacing 75% of Transformer self-attention layers with Mamba SSM blocks while preserving sparse attention heads for exact associative recall.
- Target Metric: Reducing end-to-end memory by 60% on 32k context windows while achieving 99.4% needle-in-a-haystack retrieval accuracy.
- Tech Stack: PyTorch, FlashAttention-2, HuggingFace Transformers, vLLM

3. Streaming Audio Separation with Mamba Multi-Scale State Spaces
- Extension: Adapting Mamba selective state spaces for real-time streaming audio separation and speech enhancement instead of standard dilated ConvNets.
- Target Metric: Sub-15ms algorithmic latency with +2.8 dB SI-SDRi improvement over Conv-TasNet on LibriMix benchmark.
- Tech Stack: PyTorch, Torchaudio, Soundfile, Librosa`,
      tokenMetrics: {
        promptTokens: 2150,
        candidatesTokens: 1140,
        totalTokens: 3290,
        tokenBudget: 25000,
        tokenBudgetPercent: 13.2,
      },
    },
  },
  {
    id: 'attention-is-all-you-need',
    title: 'Attention Is All You Need',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, et al. (Google Brain & Research)',
    year: '2017',
    domain: 'NLP / Foundational Transformer',
    tag: 'Foundational',
    url: 'https://arxiv.org/abs/1706.03762',
    abstractSnippet: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, a model architecture eschewing recurrence and entirely relying on an attention mechanism to draw global dependencies.',
    defaultAnalysis: {
      paper: {
        title: 'Attention Is All You Need',
        authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Lukasz Kaiser', 'Illia Polosukhin'],
        year: '2017',
        venueOrOrg: 'NeurIPS 2017 / Google Brain',
        primaryDomain: 'Natural Language Processing / Machine Translation',
        summaryTagline: 'Dispensing with recurrence and convolutions to rely entirely on self-attention for sequence transduction.',
        url: 'https://arxiv.org/abs/1706.03762',
        pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
        arxivId: '1706.03762',
      },
      coreConcept: {
        wordCount: 228,
        problemStatement: 'Recurrent Neural Networks (RNNs, LSTMs, GRUs) process tokens sequentially along the time dimension, precluding parallelization within training examples and struggling to retain long-range context across distant tokens without catastrophic forgetting.',
        primaryMethodology: 'The paper introduces the Transformer architecture, which dispenses entirely with recurrence and convolutions in favor of multi-head self-attention. Self-attention directly computes pairwise affinity between all token pairs in parallel, regardless of their distance in the sequence.',
        mathematicalBreakthroughs: 'The key breakthrough is Scaled Dot-Product Attention: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V. Scaling by sqrt(d_k) prevents dot products from growing excessively large in high dimensions, preventing vanishing softmax gradients. Multi-head projection enables attending to information from different representation subspaces simultaneously, supplemented by sinusoidal positional encodings for order preservation.',
        fullSummary: 'Prior sequence-to-sequence models relied on recurrent neural networks that processed tokens one-by-one, creating an inherent sequential bottleneck that prevented parallel training across hardware accelerators and degraded long-range dependency modeling. The Transformer completely eliminates recurrence by introducing Multi-Head Self-Attention, allowing every position to attend to every other position across the entire sequence simultaneously in O(1) sequential operations. The architecture features an encoder-decoder stack with residual connections, layer normalization, position-wise feed-forward networks, and sinusoidal positional encodings. Scaled Dot-Product Attention stabilizes training by dividing logits by the square root of key dimensionality. The Transformer achieved state-of-the-art BLEU scores on WMT English-to-German and English-to-French translation while training significantly faster than previous recurrent and convolutional architectures, laying the foundation for modern large language models.',
      },
      architecturalFlowchart: {
        mermaidCode: `graph TD
    classDef inputStyle fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef encStyle fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
    classDef decStyle fill:#311042,stroke:#c084fc,stroke-width:2px,color:#f8fafc;
    classDef outStyle fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#f8fafc;

    InputTokens["Inputs [Tokens]"]:::inputStyle --> InputEmbed["Input Embedding + Positional Encoding"]:::inputStyle
    OutputTokens["Shifted Right Targets"]:::inputStyle --> OutputEmbed["Output Embedding + Positional Encoding"]:::inputStyle

    subgraph EncoderStack ["Encoder Stack (N=6)"]
        InputEmbed --> EncMHA["Multi-Head Self-Attention"]:::encStyle
        EncMHA --> EncAdd1["Add & LayerNorm"]:::encStyle
        EncAdd1 --> EncFFN["Position-wise Feed Forward Network"]:::encStyle
        EncFFN --> EncAdd2["Add & LayerNorm"]:::encStyle
    end

    subgraph DecoderStack ["Decoder Stack (N=6)"]
        OutputEmbed --> DecMaskedMHA["Masked Multi-Head Attention"]:::decStyle
        DecMaskedMHA --> DecAdd1["Add & LayerNorm"]:::decStyle
        DecAdd1 --> DecCrossMHA["Multi-Head Cross-Attention (Q from Dec, K,V from Enc)"]:::decStyle
        EncAdd2 -.-> DecCrossMHA
        DecCrossMHA --> DecAdd2["Add & LayerNorm"]:::decStyle
        DecAdd2 --> DecFFN["Position-wise Feed Forward Network"]:::decStyle
        DecFFN --> DecAdd3["Add & LayerNorm"]:::decStyle
    end

    DecAdd3 --> Linear["Linear Layer"]:::outStyle
    Linear --> Softmax["Softmax Probabilities"]:::outStyle
    Softmax --> OutputProbs["Output Word Probabilities"]:::outStyle`,
        dataInputs: ['Source Token Sequence [B, S]', 'Target Token Sequence Shifted Right [B, T]', 'Sinusoidal Positional Encoding'],
        components: [
          { name: 'Multi-Head Attention', role: 'Jointly attends to information from distinct representation subspaces at different positions' },
          { name: 'Masked Decoder Attention', role: 'Prevents positions from attending to subsequent tokens to preserve autoregressive causality' },
          { name: 'Cross-Attention Bridge', role: 'Connects encoder contextual representations to decoder queries' },
          { name: 'Position-wise FFN', role: 'Applies two linear transformations with ReLU activation independently to each position' },
        ],
        modelLayers: ['Input Embeddings', 'Positional Encoding', 'Encoder (N=6)', 'Decoder (N=6)', 'Linear + Softmax'],
        dataOutputs: ['Predicted Next Token Probability Distribution over Vocabulary'],
      },
      internshipOpportunities: [
        {
          id: 1,
          title: 'FlashLinear: Fast Exact Self-Attention with Chunked IO Tiling in PyTorch',
          extension: 'Implementing a simplified tiled FlashAttention CUDA/Triton kernel for the Transformer encoder to demonstrate deep GPU memory hierarchy optimization.',
          targetMetric: '3.2× speedup and 75% memory reduction for sequences of length 4096 on an RTX 4090 GPU.',
          techStack: ['PyTorch', 'OpenAI Triton', 'CUDA', 'Python'],
          difficulty: 'Advanced 3rd Year',
          whyImpressive: 'Writing custom Triton GPU kernels is one of the highest-demand skills in AI infrastructure and high-performance computing.',
          resumeBullet: 'Built a custom GPU kernel for tiled self-attention using OpenAI Triton, reducing peak attention memory by 75% and accelerating training throughput by 3.2× on 4k sequence lengths.',
          weeklyMilestones: [
            'Week 1: Code vanilla PyTorch Attention and profile memory access patterns using PyTorch Profiler.',
            'Week 2: Implement tiled matrix multiplication and online softmax normalization in Triton.',
            'Week 3: Benchmark latency and numerical parity against PyTorch scaled_dot_product_attention.',
            'Week 4: Package PyPI module with unit tests and publish technical blog post on GPU SRAM memory reuse.',
          ],
          recommendedStarterRepo: 'openai/triton or Dao-AILab/flash-attention',
        },
        {
          id: 2,
          title: 'Rotary Embedding (RoPE) Backport & Length Extrapolation on TinyLlama',
          extension: 'Replacing the original sinusoidal absolute positional encodings with Rotary Position Embeddings (RoPE) and YaRN length extrapolation to extend context 4×.',
          targetMetric: '4× context length extension (from 1k to 4k tokens) with zero fine-tuning accuracy degradation.',
          techStack: ['PyTorch', 'HuggingFace Transformers', 'Datasets', 'Wandb'],
          difficulty: 'Intermediate 3rd Year',
          whyImpressive: 'Demonstrates modern LLM positional mechanics understanding used in LLaMA 3, Mistral, and Claude.',
          resumeBullet: 'Upgraded classical Transformer positional encodings to Rotary Position Embeddings (RoPE) with YaRN interpolation, extending model effective context from 1K to 4K tokens without loss degradation.',
          weeklyMilestones: [
            'Week 1: Implement RoPE complex tensor rotation in PyTorch from scratch.',
            'Week 2: Train miniature 50M parameter Transformer on TinyStories with and without RoPE.',
            'Week 3: Implement YaRN frequency scaling to test out-of-distribution sequence length extrapolation.',
            'Week 4: Plot perplexity vs context length graphs and publish interactive HuggingFace Space.',
          ],
          recommendedStarterRepo: 'karpathy/nanoGPT or huggingface/transformers',
        },
        {
          id: 3,
          title: 'Sparse Structured Multi-Head Attention for Real-Time On-Device Translation',
          extension: 'Pruning 60% of attention heads using structured magnitude pruning and replacing remaining heads with 8-bit dynamic quantization for mobile CPU inference.',
          targetMetric: 'Under 45ms per sentence latency on mobile CPU with BLEU score retention within 0.7 points.',
          techStack: ['PyTorch', 'ONNX', 'PyTorch Mobile / ExecuTorch', 'SacreBLEU'],
          difficulty: 'Intermediate 3rd Year',
          whyImpressive: 'Combines algorithmic model compression with practical deployment on mobile runtimes.',
          resumeBullet: 'Developed a structured multi-head attention pruning and INT8 quantization pipeline, achieving 60% head reduction and sub-45ms real-time translation latency on edge mobile processors.',
          weeklyMilestones: [
            'Week 1: Train baseline translation model on IWSLT 2014 German-English dataset.',
            'Week 2: Calculate Taylor-expansion sensitivity scores for each attention head and apply iterative pruning.',
            'Week 3: Quantize weights using PyTorch dynamic quantization and verify SacreBLEU scores.',
            'Week 4: Deploy model on Android/iOS via ExecuTorch or ONNX Runtime mobile and write demo README.',
          ],
          recommendedStarterRepo: 'pytorch/fairseq or huggingface/transformers',
        },
      ],
      rawOutput: `1. CORE CONCEPT EXTRACTION:
Prior sequence-to-sequence models relied on recurrent neural networks that processed tokens one-by-one, creating an inherent sequential bottleneck that prevented parallel training across hardware accelerators and degraded long-range dependency modeling. The Transformer completely eliminates recurrence by introducing Multi-Head Self-Attention, allowing every position to attend to every other position across the entire sequence simultaneously in O(1) sequential operations. The architecture features an encoder-decoder stack with residual connections, layer normalization, position-wise feed-forward networks, and sinusoidal positional encodings. Scaled Dot-Product Attention stabilizes training by dividing logits by the square root of key dimensionality. The Transformer achieved state-of-the-art BLEU scores on WMT English-to-German and English-to-French translation while training significantly faster than previous recurrent and convolutional architectures, laying the foundation for modern large language models.

2. ARCHITECTURAL FLOWCHART (Mermaid.js):
[FLOWCHART]
graph TD
    InputTokens["Inputs [Tokens]"] --> InputEmbed["Input Embedding + Positional Encoding"]
    OutputTokens["Shifted Right Targets"] --> OutputEmbed["Output Embedding + Positional Encoding"]
    InputEmbed --> EncMHA["Multi-Head Self-Attention"]
    EncMHA --> EncAdd1["Add & LayerNorm"]
    EncAdd1 --> EncFFN["Position-wise Feed Forward Network"]
    EncFFN --> EncAdd2["Add & LayerNorm"]
    OutputEmbed --> DecMaskedMHA["Masked Multi-Head Attention"]
    DecMaskedMHA --> DecAdd1["Add & LayerNorm"]
    DecAdd1 --> DecCrossMHA["Multi-Head Cross-Attention"]
    EncAdd2 -.-> DecCrossMHA
    DecCrossMHA --> DecAdd2["Add & LayerNorm"]
    DecAdd2 --> DecFFN["Position-wise Feed Forward Network"]
    DecFFN --> DecAdd3["Add & LayerNorm"]
    DecAdd3 --> Linear["Linear Layer"]
    Linear --> Softmax["Softmax Probabilities"]
    Softmax --> OutputProbs["Output Word Probabilities"]

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
1. FlashLinear: Fast Exact Self-Attention with Chunked IO Tiling in PyTorch
- Extension: Implementing a simplified tiled FlashAttention CUDA/Triton kernel for the Transformer encoder to demonstrate deep GPU memory hierarchy optimization.
- Target Metric: 3.2× speedup and 75% memory reduction for sequences of length 4096 on an RTX 4090 GPU.
- Tech Stack: PyTorch, OpenAI Triton, CUDA, Python

2. Rotary Embedding (RoPE) Backport & Length Extrapolation on TinyLlama
- Extension: Replacing the original sinusoidal absolute positional encodings with Rotary Position Embeddings (RoPE) and YaRN length extrapolation to extend context 4×.
- Target Metric: 4× context length extension (from 1k to 4k tokens) with zero fine-tuning accuracy degradation.
- Tech Stack: PyTorch, HuggingFace Transformers, Datasets, Wandb

3. Sparse Structured Multi-Head Attention for Real-Time On-Device Translation
- Extension: Pruning 60% of attention heads using structured magnitude pruning and replacing remaining heads with 8-bit dynamic quantization for mobile CPU inference.
- Target Metric: Under 45ms per sentence latency on mobile CPU with BLEU score retention within 0.7 points.
- Tech Stack: PyTorch, ONNX, PyTorch Mobile / ExecuTorch, SacreBLEU`,
      tokenMetrics: {
        promptTokens: 1980,
        candidatesTokens: 1080,
        totalTokens: 3060,
        tokenBudget: 25000,
        tokenBudgetPercent: 12.2,
      },
    },
  },
  {
    id: 'lora-peft',
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    authors: 'Edward J. Hu, Yelong Shen, Phillip Wallis, et al. (Microsoft)',
    year: '2021',
    domain: 'NLP / Parameter-Efficient Fine-Tuning (PEFT)',
    tag: 'PEFT',
    url: 'https://arxiv.org/abs/2106.09685',
    abstractSnippet: 'An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to particular tasks. LoRA freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer.',
    defaultAnalysis: {
      paper: {
        title: 'LoRA: Low-Rank Adaptation of Large Language Models',
        authors: ['Edward J. Hu', 'Yelong Shen', 'Phillip Wallis', 'Zeyuan Allen-Zhu', 'Yuanzhi Li', 'Shean Wang', 'Lu Wang', 'Weizhu Chen'],
        year: '2021',
        venueOrOrg: 'ICLR 2022 / Microsoft',
        primaryDomain: 'Efficient Fine-Tuning / Large Language Models',
        summaryTagline: 'Freezing pretrained weights and decomposing weight updates into low-rank matrices to slash fine-tuning VRAM by 3×.',
        url: 'https://arxiv.org/abs/2106.09685',
        pdfUrl: 'https://arxiv.org/pdf/2106.09685.pdf',
        arxivId: '2106.09685',
      },
      coreConcept: {
        wordCount: 235,
        problemStatement: 'Fine-tuning massive pretrained language models like GPT-3 (175B parameters) requires updating and storing complete parameter copies for every downstream task, requiring prohibitive GPU cluster memory and incurring costly multi-gigabyte checkpoint storage.',
        primaryMethodology: 'LoRA (Low-Rank Adaptation) freezes the pretrained weight matrix W0 and decomposes the accumulated gradient update into two low-rank matrices: ΔW = B × A, where A is initialized from a Gaussian distribution and B is initialized to zero. Because rank r << min(d, k), trainable parameters are reduced by up to 10,000× without inference latency penalties.',
        mathematicalBreakthroughs: 'The forward pass computes: h = W0·x + (α/r)·B·A·x, where α is a constant scaling hyperparameter. At deployment time, ΔW = (α/r)·B·A can be pre-computed and directly merged back into W0 = W0 + ΔW, introducing exactly zero additional FLOPs or latency during serving.',
        fullSummary: 'Traditional full fine-tuning of multi-billion parameter foundation models is computationally prohibitive because every task requires storing hundreds of gigabytes of optimizer states and weight checkpoints. LoRA solves this by hypothesizing that weight updates during adaptation possess a low "intrinsic dimension". Rather than modifying the dense pretrained weight tensor W0 directly, LoRA freezes W0 and injects two low-rank trainable matrices B and A such that the update ΔW equals B×A. For a model with hidden size 4096 and rank r=8, parameters are compressed from 16.7M down to 65.5K (a 250× reduction per linear projection). In addition, LoRA introduces a scaling factor α/r to stabilize hyperparameter tuning. Critically, during production deployment, the low-rank delta can be folded directly into the base weights, completely eliminating inference latency and extra memory lookups.',
      },
      architecturalFlowchart: {
        mermaidCode: `graph TD
    classDef inputStyle fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef frozenStyle fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#94a3b8;
    classDef loraStyle fill:#431407,stroke:#f97316,stroke-width:2px,color:#f8fafc;
    classDef outStyle fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#f8fafc;

    InputX["Input Hidden State x [d_in]"]:::inputStyle --> FrozenW["Frozen Pretrained Weight W0 [d_out × d_in] (No Gradients)"]:::frozenStyle
    InputX --> MatrixA["Trainable Down-Projection Matrix A [r × d_in] (Gaussian Init)"]:::loraStyle

    MatrixA --> RankBottleneck["Low-Rank Intrinsic Subspace (rank r << d_in)"]:::loraStyle
    RankBottleneck --> MatrixB["Trainable Up-Projection Matrix B [d_out × r] (Zero Init)"]:::loraStyle

    MatrixB --> ScaleFactor["Scaling Factor (α / r)"]:::loraStyle
    ScaleFactor --> DeltaW["Low-Rank Adapted Delta ΔW · x"]:::loraStyle
    FrozenW --> DenseOut["Pretrained Activation W0 · x"]:::frozenStyle

    DenseOut --> AddOp["Vector Addition (+)"]:::outStyle
    DeltaW --> AddOp
    AddOp --> FinalH["Output Activation h = W0·x + (α/r)·B·A·x"]:::outStyle

    subgraph ProductionDeployment ["Production Serving Optimization"]
        MergeOp["Fold into Base: W_deployed = W0 + (α/r)·B·A"]:::outStyle
        ZeroLatency["Zero Added Inference FLOPs & No Memory Overhead"]:::outStyle
        MergeOp --> ZeroLatency
    end`,
        dataInputs: ['Input Activation Vector x [B, L, d_in]', 'Frozen Pretrained Weights W0'],
        components: [
          { name: 'Frozen Base Linear Layer', role: 'Retains general domain knowledge with zero gradient backprop' },
          { name: 'Matrix A Down-Projection', role: 'Compresses input dimension d_in to low-rank dimension r using Gaussian initialization' },
          { name: 'Matrix B Up-Projection', role: 'Projects from low-rank r back to output dimension d_out, initialized to zero' },
          { name: 'Scaling Factor α/r', role: 'Normalizes update magnitude so varying rank r does not require retuning learning rate' },
        ],
        modelLayers: ['Attention Projections (W_q, W_k, W_v, W_o)', 'Feed Forward Up/Down Projections', 'Weight Merging Engine'],
        dataOutputs: ['Task-Adapted Layer Output h', 'Exportable Lightweight LoRA Adapter Weights (few MBs)'],
      },
      internshipOpportunities: [
        {
          id: 1,
          title: 'Dynamic Rank-Adaptive LoRA (AdaLoRA) with Singular Value Pruning',
          extension: 'Implementing importance-driven dynamic rank allocation across Transformer layers so parameter-heavy layers receive higher rank while saturated layers get pruned.',
          targetMetric: 'Matching full LoRA accuracy with 45% fewer adapter parameters and 1.4× faster backpropagation.',
          techStack: ['PyTorch', 'HuggingFace PEFT', 'BitsAndBytes', 'Weights & Biases'],
          difficulty: 'Intermediate 3rd Year',
          whyImpressive: 'Demonstrates deep mathematical understanding of matrix singular value decomposition (SVD) and parameter budgeting in production fine-tuning.',
          resumeBullet: 'Implemented an SVD-guided rank-adaptive LoRA algorithm using PyTorch and HuggingFace PEFT, reducing adapter parameters by 45% while maintaining benchmark score parity on GLUE.',
          weeklyMilestones: [
            'Week 1: Fork HuggingFace PEFT codebase and study standard LoRA layer implementation.',
            'Week 2: Implement SVD importance scoring on parameter matrices during training backward passes.',
            'Week 3: Implement dynamic rank pruning schedule that zeroes out low-significance singular vectors.',
            'Week 4: Benchmark on RoBERTa-large across MNLI, SST-2, and QQP, documenting parameter curves.',
          ],
          recommendedStarterRepo: 'huggingface/peft or microsoft/LoRA',
        },
        {
          id: 2,
          title: 'Multi-LoRA Hot-Swapping Inference Gateway in Rust / C++',
          extension: 'Building a high-throughput multi-tenant LLM serving gateway that shares one frozen 8-bit base model in GPU memory and hot-swaps task LoRA adapters per HTTP request.',
          targetMetric: 'Serving 50 concurrent distinct customer task adapters with under 2ms adapter switching overhead.',
          techStack: ['Python', 'PyTorch / vLLM', 'FastAPI or Axum (Rust)', 'Triton'],
          difficulty: 'Advanced 3rd Year',
          whyImpressive: 'Infrastructure and systems engineers in modern AI startups focus heavily on multi-tenant adapter multiplexing and memory efficiency.',
          resumeBullet: 'Architected a multi-tenant LLM serving server supporting dynamic LoRA adapter hot-swapping across 50 simultaneous tasks with sub-2ms switching latency on an A10G GPU.',
          weeklyMilestones: [
            'Week 1: Create a prototype PyTorch script that merges/unmerges LoRA weights on the fly.',
            'Week 2: Integrate vLLM multi-LoRA feature and write a batched adapter routing kernel.',
            'Week 3: Build an asynchronous HTTP gateway handling concurrent requests with differing task IDs.',
            'Week 4: Perform load testing with Locust, measuring p95 and p99 latency under heavy traffic.',
          ],
          recommendedStarterRepo: 'vllm-project/vllm or punica-ai/punica',
        },
        {
          id: 3,
          title: 'QLoRA on Consumer Laptop: 4-bit NormalFloat Quantized Fine-Tuning',
          extension: 'Integrating 4-bit NormalFloat (NF4) quantization and double quantization to fine-tune a 7B LLM entirely within 6GB of VRAM on a gaming laptop.',
          targetMetric: 'Fine-tuning a 7B parameter model on a single 6GB consumer GPU without out-of-memory (OOM) errors.',
          techStack: ['PyTorch', 'bitsandbytes', 'TRL (Transformer Reinforcement Learning)', 'HuggingFace'],
          difficulty: 'Intermediate 3rd Year',
          whyImpressive: 'Proves resourcefulness in training large language models on strictly constrained consumer hardware.',
          resumeBullet: 'Created a reproducible open-source guide and codebase for fine-tuning 7B LLMs in under 6GB VRAM using QLoRA 4-bit NormalFloat quantization, gaining 200+ stars on GitHub.',
          weeklyMilestones: [
            'Week 1: Set up BitsAndBytes NF4 quantization pipeline and verify theoretical memory calculations.',
            'Week 2: Configure gradient checkpointing and paged optimizers to eliminate CUDA memory spikes.',
            'Week 3: Fine-tune Mistral-7B on instruction dataset (e.g., CodeAlpaca) and evaluate validation loss.',
            'Week 4: Write clean README, CLI tool, and Dockerfile for one-command student execution.',
          ],
          recommendedStarterRepo: 'artidoro/qlora or huggingface/trl',
        },
      ],
      rawOutput: `1. CORE CONCEPT EXTRACTION:
Traditional full fine-tuning of multi-billion parameter foundation models is computationally prohibitive because every task requires storing hundreds of gigabytes of optimizer states and weight checkpoints. LoRA solves this by hypothesizing that weight updates during adaptation possess a low "intrinsic dimension". Rather than modifying the dense pretrained weight tensor W0 directly, LoRA freezes W0 and injects two low-rank trainable matrices B and A such that the update ΔW equals B×A. For a model with hidden size 4096 and rank r=8, parameters are compressed from 16.7M down to 65.5K (a 250× reduction per linear projection). In addition, LoRA introduces a scaling factor α/r to stabilize hyperparameter tuning. Critically, during production deployment, the low-rank delta can be folded directly into the base weights, completely eliminating inference latency and extra memory lookups.

2. ARCHITECTURAL FLOWCHART (Mermaid.js):
[FLOWCHART]
graph TD
    InputX["Input Hidden State x [d_in]"] --> FrozenW["Frozen Pretrained Weight W0 [d_out × d_in]"]
    InputX --> MatrixA["Trainable Down-Projection Matrix A [r × d_in]"]
    MatrixA --> RankBottleneck["Low-Rank Intrinsic Subspace (rank r)"]
    RankBottleneck --> MatrixB["Trainable Up-Projection Matrix B [d_out × r]"]
    MatrixB --> ScaleFactor["Scaling Factor (α / r)"]
    ScaleFactor --> DeltaW["Low-Rank Adapted Delta ΔW · x"]
    FrozenW --> DenseOut["Pretrained Activation W0 · x"]
    DenseOut --> AddOp["Vector Addition (+)"]
    DeltaW --> AddOp
    AddOp --> FinalH["Output Activation h = W0·x + (α/r)·B·A·x"]

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
1. Dynamic Rank-Adaptive LoRA (AdaLoRA) with Singular Value Pruning
- Extension: Implementing importance-driven dynamic rank allocation across Transformer layers so parameter-heavy layers receive higher rank while saturated layers get pruned.
- Target Metric: Matching full LoRA accuracy with 45% fewer adapter parameters and 1.4× faster backpropagation.
- Tech Stack: PyTorch, HuggingFace PEFT, BitsAndBytes, Weights & Biases

2. Multi-LoRA Hot-Swapping Inference Gateway in Rust / C++
- Extension: Building a high-throughput multi-tenant LLM serving gateway that shares one frozen 8-bit base model in GPU memory and hot-swaps task LoRA adapters per HTTP request.
- Target Metric: Serving 50 concurrent distinct customer task adapters with under 2ms adapter switching overhead.
- Tech Stack: Python, PyTorch / vLLM, FastAPI or Axum (Rust), Triton

3. QLoRA on Consumer Laptop: 4-bit NormalFloat Quantized Fine-Tuning
- Extension: Integrating 4-bit NormalFloat (NF4) quantization and double quantization to fine-tune a 7B LLM entirely within 6GB of VRAM on a gaming laptop.
- Target Metric: Fine-tuning a 7B parameter model on a single 6GB consumer GPU without out-of-memory (OOM) errors.
- Tech Stack: PyTorch, bitsandbytes, TRL (Transformer Reinforcement Learning), HuggingFace`,
      tokenMetrics: {
        promptTokens: 1840,
        candidatesTokens: 1020,
        totalTokens: 2860,
        tokenBudget: 25000,
        tokenBudgetPercent: 11.4,
      },
    },
  },
];
