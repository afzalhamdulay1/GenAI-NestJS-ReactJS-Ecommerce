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

* **Top 20 Products Limit:** To optimize token usage and avoid latency, `ai.service.ts` currently injects up to **20 live products** from MongoDB into the system context (`.limit(20)`).
* **Scalability Note:** For catalogs exceeding 50–100+ items, a **RAG (Retrieval-Augmented Generation)** or vector-search solution (e.g. Pinecone, MongoDB Atlas Vector Search) will be required to fetch relevant items dynamically based on user query embeddings.

---

## 4. 🔒 Data Privacy Terms

* On the **Google AI Studio Free Tier**, prompt inputs and generated outputs may be sampled and reviewed by Google for model training and product improvements.
* Upgrading to a paid Google Cloud / Vertex AI key eliminates data logging.

---

## 5. 🔮 Future Enhancement Opportunities

1. **Multimodal / Vision Support:** Allow users to upload photos of outfits or items to search for visually similar products in stock.
2. **Streaming Responses:** Implement Server-Sent Events (SSE) or WebSockets for real-time typewriter-style response rendering.
3. **Vector Database Integration (RAG):** Enable full database product catalog searching for large-scale inventory.
