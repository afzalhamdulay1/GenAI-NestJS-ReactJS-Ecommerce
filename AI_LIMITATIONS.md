# AI Assistant Integration - Free Tier & System Limitations

This document outlines the current technical specifications, model fallbacks, and free-tier API limitations for the **Afzal AI** Shopping Assistant and SEO Product Description Generator.

---

## 1. ⏱️ Free-Tier Rate Limits & Quotas (Google Gemini API)

| Metric | Free-Tier Limit | Impact & Handling |
| :--- | :--- | :--- |
| **RPM** (Requests Per Minute) | ~15 RPM | Rapid user messaging or concurrent traffic can trigger a `429 Too Many Requests` error. |
| **RPD** (Requests Per Day) | ~1,500 RPD | Total daily requests across all features (Chat + Description Generator). |
| **Cost** | **$0.00 / month** | Completely free with Google AI Studio API Key. |

---

## 2. 🔄 Configured Model Fallback Chain

Due to model deprecations or free-tier endpoint variations (e.g., `gemini-1.5-flash` 404s), the backend uses an automated fallback loop in `AiService`:

```
1. gemini-3.5-flash      (Primary - High performance)
   └── 2. gemini-flash-latest   (Secondary - Stable latest alias)
       └── 3. gemini-3.5-flash-lite (Tertiary - Lightweight fallback)
           └── 4. gemini-3.1-flash-lite (Quaternary - Base fallback)
```

---

## 3. 🛍️ Catalog Context & Data Limits

* **Catalog Truncation (`.limit(30)`):** To optimize token usage and avoid latency, `ai.service.ts` currently injects up to **30 live products** from MongoDB into the system context (`.limit(30)`).
* **Scalability Note:** For catalogs exceeding 50–100+ items, a **RAG (Retrieval-Augmented Generation)** or vector-search solution (e.g. Pinecone, MongoDB Atlas Vector Search) will be required to fetch relevant items dynamically based on user query embeddings instead of static arrays.

---

## 4. 🔒 Data Privacy Terms

* On the **Google AI Studio Free Tier**, prompt inputs and generated outputs may be sampled and reviewed by Google for model training and product improvements.
* Upgrading to a paid Google Cloud / Vertex AI key eliminates data logging.

---

## 5. 🛠️ Codebase Limitations & Architectural Improvements

1. **Unprotected Public Endpoints & Throttling (DDoS / Quota Risk):**
   * Public endpoints (`POST /api/v1/ai/chat`, `POST /api/v1/ai/visual-search`, `POST /api/v1/ai/product-qa`) currently lack rate limiting (`@nestjs/throttler`). Spammers or web scrapers could exhaust daily API quotas.
   * *Action:* Add `@nestjs/throttler` guards to limit requests to ~10 req/min per IP.

2. **Fragile Regex JSON Parsing:**
   * Methods like `summarizeProductReviews` and `generateSeo` parse JSON with `.replace(/```json/gi, '')` and `JSON.parse()`. If Gemini outputs conversational text, `JSON.parse()` fails.
   * *Action:* Use `@google/generative-ai`'s native `responseMimeType: 'application/json'` setting for guaranteed JSON format compliance.

3. **Fallback Array Latency Overhead:**
   * The model fallback loop contains model string names that may trigger initial catch blocks before hitting the active alias, adding ~300ms network trial-and-error overhead.
   * *Action:* Clean up model strings to strictly use current active Gemini endpoints (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`).

4. **Synchronous REST Latency in Chat Widget:**
   * The AI Chatbot currently waits 2–4 seconds for the complete HTTP response payload before rendering.
   * *Action:* Migrate to `generateContentStream()` with WebSockets/Server-Sent Events (SSE) to render typewriter-style real-time streaming in `AIChatWidget.tsx`.

