// Everything the site says about you lives in this file.
// Edit the content here; the terminal and the GUI view both render from it.

export type Link = { label: string; href: string };

export type Project = {
  slug: string;
  title: string;
  org: string;
  period: string;
  tagline: string;
  metric?: { value: string; label: string };
  problem: string;
  built: string[];
  impact: string[];
  stack: string[];
  links?: Link[];
};

export type Job = {
  slug: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  about?: string;
  highlights: string[];
  tech: string[];
};

export type SkillGroup = { key: string; label: string; items: string[] };

export const profile = {
  name: "Robert Rankin",
  firstName: "Robert",
  title: "Senior AI Engineer",
  // Shown in the prompt as guest@<host>
  host: "rankin",
  location: "North Las Vegas, NV",
  email: "rob.rankin.16@gmail.com",
  linkedin: "https://www.linkedin.com/in/robert-rankin-bb4864420/",
  // Add more links here (GitHub, Hugging Face, Kaggle, blog...). They show up in `contact` and the GUI footer.
  extraLinks: [] as Link[],
  // Drop your PDF into /public and set e.g. "/Robert_Rankin.pdf" to enable `open resume`.
  resumeUrl: null as string | null,
  available: true,
  availability: "Open to Senior AI / ML engineering roles",
  years: "12+",
  aiYears: "4+",
  tagline:
    "I ship production GenAI (multimodal inference, LLM orchestration, RAG) on top of 12+ years of backend engineering.",
  summary: [
    "I'm a Senior AI Engineer with 12+ years of backend engineering behind me and 4+ years delivering AI products in production. My focus is the engineering around the model: inference pipelines, LLM orchestration, evaluation, and the cloud infrastructure that keeps it all fast and reliable.",
    "Most recently at Hedra, I built the backend and inference pipelines behind generative video: Character-3, talking avatars, and LLM-driven video ads. Before that I led GenAI work for healthcare automation at Elevance Systems, and built high-throughput telemetry platforms at Extreme Networks.",
  ],
  stats: [
    { value: "12+", label: "years engineering" },
    { value: "4+", label: "years shipping AI" },
    { value: "−37%", label: "video gen latency" },
    { value: "−40%", label: "call-center load" },
    { value: "30M", label: "events / day" },
  ],
};

export const projects: Project[] = [
  {
    slug: "character-3-inference",
    title: "Character-3 Inference Pipeline",
    org: "Hedra",
    period: "2025 – 2026",
    tagline: "Multimodal inference pipelines powering Hedra's Character-3 video model.",
    metric: { value: "−37%", label: "end-to-end latency" },
    problem:
      "Generative video is slow and GPU-hungry. Every second of latency between prompt and video costs both user patience and compute.",
    built: [
      "Led development of the multimodal inference pipelines serving Character-3.",
      "Optimized GPU scheduling and added KV-cache reuse across inference steps.",
      "Moved media preprocessing to an asynchronous path.",
      "Built GPU-accelerated preprocessing with CUDA-enabled image decoding.",
    ],
    impact: [
      "Cut end-to-end video generation latency by 37%.",
      "Reduced preprocessing latency with CUDA-accelerated decoding.",
    ],
    stack: ["Python", "CUDA", "KV-cache", "Async I/O", "Kubernetes", "MLOps"],
  },
  {
    slug: "talking-avatar",
    title: "AI Talking Avatar Pipeline",
    org: "Hedra",
    period: "2025 – 2026",
    tagline: "Lip-synced video from a single static image and an audio clip.",
    problem:
      "Creators wanted a talking character from nothing more than a photo and a voice track, with lips that actually match the speech.",
    built: [
      "Connected speech-to-phoneme alignment outputs to facial animation models.",
      "Built the pipeline that turns a static image plus audio into lip-synced video.",
    ],
    impact: ["Enabled lip-synced video generation from static images and audio inputs."],
    stack: ["Python", "Speech alignment", "Facial animation models", "FFmpeg"],
  },
  {
    slug: "video-ad-generator",
    title: "LLM Video Ad Generator",
    org: "Hedra",
    period: "2025 – 2026",
    tagline: "Marketing prompt in, finished video ad out, fully asynchronous.",
    problem:
      "Turning a one-line marketing brief into a finished video ad means coordinating many slow generative services in the right order.",
    built: [
      "LLM step converts marketing prompts into structured scene JSON.",
      "Orchestrates downstream image, video and TTS generation services per scene.",
      "FFmpeg-based assembly of the final cut, executed through a job queue.",
    ],
    impact: ["End-to-end async pipeline from marketing prompt to assembled video ad."],
    stack: ["Python", "LLMs", "Structured outputs", "TTS", "FFmpeg", "Job queues"],
  },
  {
    slug: "llm-judge-gate",
    title: "LLM-as-Judge Quality Gate",
    org: "Hedra",
    period: "2025 – 2026",
    tagline: "Automated evals that decide what's worth spending GPU on.",
    problem:
      "Full video renders are expensive. A weak script or inconsistent intermediate output shouldn't get anywhere near a GPU.",
    built: [
      "LLM-as-judge scoring of generated scripts and intermediate outputs.",
      "Scores coherence, visual consistency and prompt adherence.",
      "Gates the expensive full render behind those scores.",
    ],
    impact: ["GPU resources are only committed to generations that pass the quality bar."],
    stack: ["Python", "LLM-as-judge", "Evaluation", "PostgreSQL"],
  },
  {
    slug: "healthcare-voice-bot",
    title: "HIPAA-Compliant IVR Voice Bot",
    org: "Elevance Systems",
    period: "2022 – 2025",
    tagline: "An AI voice agent that handles patient calls end to end.",
    metric: { value: "−40%", label: "call-center workload" },
    problem:
      "Healthcare call centers were overloaded with routine patient calls, and any automation had to handle Protected Health Information safely.",
    built: [
      "AI-driven IVR voice bot built on Azure Speech Services and LangChain.",
      "LLM orchestration with Vertex AI for patient interactions.",
      "HIPAA-compliant handling of Protected Health Information (PHI).",
    ],
    impact: ["Reduced call-center workload by 40%."],
    stack: ["Python", "Azure Speech", "LangChain", "Vertex AI", "FastAPI"],
  },
  {
    slug: "rag-prompt-orchestration",
    title: "RAG Prompt Orchestration Layer",
    org: "Elevance Systems",
    period: "2022 – 2025",
    tagline: "Dynamic prompts grounded in retrieved context to cut hallucinations.",
    problem: "Free-form LLM answers in healthcare workflows need to be grounded, constrained and accurate.",
    built: [
      "Prompt orchestration layer that builds prompts dynamically at request time.",
      "Combines user input, context retrieved via vector search, and system constraints.",
    ],
    impact: ["Reduced hallucinations and improved response accuracy."],
    stack: ["Python", "LangChain", "Vector search", "Embeddings", "Prompt engineering"],
  },
  {
    slug: "claim-denial-predictor",
    title: "Claim Denial Predictor",
    org: "Elevance Systems",
    period: "2022 – 2025",
    tagline: "Predict and prevent insurance claim denials before they're submitted.",
    problem: "Denied insurance claims cost healthcare providers time and revenue, and are usually caught too late.",
    built: [
      "Denial-reduction app combining XGBoost, NLP models and an LLM-based recommendation engine.",
      "Fine-tuned transformer classifiers in PyTorch for clinical text categorization and denial-risk scoring.",
      "Optimized inference pipelines for low-latency production serving.",
    ],
    impact: ["Flags likely denials before submission, with recommended fixes."],
    stack: ["PyTorch", "Transformers", "XGBoost", "NLP", "FastAPI", "Django"],
  },
  {
    slug: "telemetry-platform",
    title: "Real-time Wi-Fi Telemetry Platform",
    org: "Extreme Networks",
    period: "2020 – 2022",
    tagline: "Ingestion API and live dashboards for enterprise access points.",
    metric: { value: "30M", label: "events / day" },
    problem:
      "Network engineers needed live latency, packet-loss and uptime data from thousands of enterprise access points, without polling.",
    built: [
      "FastAPI telemetry ingestion API with Kafka-based buffering.",
      "React/Next.js dashboard with WebSocket subscriptions for sub-second updates.",
      "Google Maps view of access points for site troubleshooting.",
      "Fixed memory leaks in long-running Celery workers caused by unbounded caching.",
    ],
    impact: [
      "Processed over 30M telemetry events per day.",
      "Sub-second dashboard updates without polling.",
    ],
    stack: ["Python", "FastAPI", "Kafka", "Next.js", "TypeScript", "WebSockets", "Celery"],
  },
];

export const jobs: Job[] = [
  {
    slug: "2025-hedra",
    role: "Senior AI Engineer",
    company: "Hedra",
    location: "San Francisco, CA",
    start: "May 2025",
    end: "Jun 2026",
    about: "Frontier AI lab building generative video tools for creators and marketers.",
    highlights: [
      "Led development of multimodal inference pipelines powering Character-3, reducing end-to-end video generation latency by 37% through optimized GPU scheduling, KV-cache reuse and asynchronous media preprocessing.",
      "Built the AI Talking Avatar pipeline, connecting speech-to-phoneme alignment with facial animation models for lip-synced video from static images and audio.",
      "Built an asynchronous video ad pipeline: LLM-generated scene JSON orchestrating image, video and TTS services, with FFmpeg assembly and job-queue execution.",
      "Developed GPU-accelerated media preprocessing with CUDA-enabled image decoding.",
      "Implemented LLM-as-judge evaluation of scripts and intermediate outputs before committing GPU resources to full renders.",
      "Worked with infra and research to replace prompt-only workflows with hybrid LLM planning + deterministic validation + multimodal generation.",
      "Established MLOps pipelines for CI/CD of inference models on Kubernetes.",
    ],
    tech: ["Python", "CUDA", "LLMs", "RAG", "LangChain", "PostgreSQL", "FFmpeg", "Kubernetes", "MLOps"],
  },
  {
    slug: "2022-elevance",
    role: "AI Engineer",
    company: "Elevance Systems",
    location: "Cupertino, CA",
    start: "Jul 2022",
    end: "May 2025",
    about: "Managed IT service provider for healthcare organizations.",
    highlights: [
      "Led AI/ML and GenAI initiatives for healthcare automation, claim processing and clinical workflow optimization.",
      "Built a HIPAA-compliant AI IVR voice bot (Azure Speech, LangChain, Vertex AI) that reduced call-center workload by 40%.",
      "Engineered a prompt orchestration layer combining user input, vector-search context and system constraints to reduce hallucination.",
      "Created a claim denial-reduction app with XGBoost, NLP models and LLM-based recommendations.",
      "Trained and fine-tuned transformer classifiers in PyTorch for clinical text and denial-risk scoring.",
      "Owned the full SDLC for production AI apps on FastAPI, Django, Docker, GitHub Actions and Azure.",
    ],
    tech: ["Python", "FastAPI", "Django", "LangChain", "Azure Speech", "XGBoost", "PyTorch", "PostgreSQL", "Docker"],
  },
  {
    slug: "2020-extreme-networks",
    role: "Senior Software Engineer",
    company: "Extreme Networks",
    location: "San Jose, CA",
    start: "Mar 2020",
    end: "Jun 2022",
    about: "Enterprise networking: wired, wireless and SD-WAN infrastructure.",
    highlights: [
      "Built a FastAPI device telemetry ingestion API processing 30M+ events/day with Kafka buffering.",
      "Developed a React/Next.js dashboard with WebSocket subscriptions for sub-second live charts.",
      "Integrated Google Maps for real-time visualization of enterprise Wi-Fi access points.",
      "Fixed memory leaks in long-running Celery workers, improving stability under sustained load.",
      "Led backend design discussions and mentored 3 junior engineers.",
    ],
    tech: ["Python", "FastAPI", "React", "Next.js", "TypeScript", "Kafka", "Celery", "AWS", "Kubernetes"],
  },
  {
    slug: "2017-extreme-networks",
    role: "Backend Engineer",
    company: "Extreme Networks",
    location: "San Jose, CA",
    start: "Sep 2017",
    end: "Feb 2020",
    highlights: [
      "Built REST APIs for device inventory and configuration, cutting average response latency by 32% (query optimization, pooling, Redis caching).",
      "Implemented async event processing with Kafka, reducing event propagation from minutes to seconds.",
      "Automated AWS deployments (EKS, RDS, S3) with Docker, Kubernetes, GitHub Actions and Helm.",
      "Raised regression test coverage to 85% with automated Jest pipelines.",
    ],
    tech: ["Node.js", "TypeScript", "PostgreSQL", "Kafka", "Redis", "AWS", "Helm", "Jest"],
  },
  {
    slug: "2015-att",
    role: "Junior Software Engineer",
    company: "AT&T",
    location: "San Ramon, CA",
    start: "Mar 2015",
    end: "Aug 2017",
    highlights: [
      "Improved API response times with SQL optimization, indexing and fewer redundant requests.",
      "Implemented JWT authentication and role-based authorization.",
    ],
    tech: ["Node.js", "Express", "PostgreSQL", "JWT", "Docker", "Jest"],
  },
  {
    slug: "2014-att-intern",
    role: "Software Engineer Intern",
    company: "AT&T",
    location: "San Ramon, CA",
    start: "Jun 2014",
    end: "Mar 2015",
    highlights: ["Built and maintained internal web application features with JavaScript and React."],
    tech: ["JavaScript", "React", "Git"],
  },
];

export const skills: SkillGroup[] = [
  {
    key: "ai_genai",
    label: "AI / GenAI",
    items: [
      "LLMs (OpenAI, Azure OpenAI)",
      "RAG",
      "Prompt orchestration",
      "LangChain",
      "LangGraph",
      "AutoGen",
      "CrewAI",
      "Semantic Kernel",
      "Embeddings & semantic search",
      "Pinecone",
      "pgvector",
      "MCP",
      "LLM evaluation",
      "Hugging Face",
      "DeepSeek",
      "Claude Code",
    ],
  },
  {
    key: "machine_learning",
    label: "Machine Learning",
    items: ["PyTorch", "TensorFlow", "Transformers", "XGBoost", "NLP", "Recommendation systems", "CUDA"],
  },
  {
    key: "backend",
    label: "Backend",
    items: ["Python", "FastAPI", "Django", "TypeScript", "Node.js", "Express", "REST", "GraphQL", "Celery", "Kafka", "JWT / RBAC"],
  },
  { key: "frontend", label: "Frontend", items: ["React", "Next.js", "WebSockets"] },
  { key: "data", label: "Data", items: ["PostgreSQL", "Redis", "MongoDB", "Neo4j", "Data modeling"] },
  {
    key: "cloud_devops",
    label: "Cloud & DevOps",
    items: ["AWS (EKS, RDS, S3)", "GCP / Vertex AI", "Azure (OpenAI, Speech)", "Docker", "Kubernetes", "Helm", "GitHub Actions", "MLOps"],
  },
];

export const education = {
  degree: "B.S. Computer Science",
  school: "University of Nebraska at Omaha",
  period: "2010 – 2014",
};
