# SepsisIQ·India

SepsisIQ·India is an advanced clinical AI platform designed to provide real-time sepsis risk assessments and personalized antibiotic stewardship for the Indian clinical context.

### 🚀 Production Features
- **Secure AI Architecture**: Clinical reasoning and inference are handled server-side via Express to protect your API keys.
- **Precision ML**: Powered by Google Gemini 1.5 Flash (via OpenRouter or Native SDK) for high-accuracy mortality and Carbapenem Resistance (CR) risk prediction.
- **Vercel Ready**: Pre-configured with `vercel.json` for immediate serverless deployment.
- **India-Localized**: Calibrated for regional resistance patterns and clinical workflows.

## 🛠️ Local Development

**Prerequisites:** Node.js (v18+)

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/RandomAssassin-rgb/SepsisIQ-India
    cd SepsisIQ-India
    npm install
    ```
2.  **Environment Setup**: Create a `.env` file in the root directory:
    ```env
    # For Native Google Gemini
    GEMINI_API_KEY=your_key_here
    
    # OR For OpenRouter (Recommended)
    OPENROUTER_API_KEY=your_key_here
    ```
3.  **Run the App**:
    ```bash
    npm run dev
    ```
    View at `http://localhost:3000`

## 🌍 Vercel Deployment

1. Push your code to GitHub.
2. Link your repository in the Vercel Dashboard.
3. Add your `GEMINI_API_KEY` or `OPENROUTER_API_KEY` to **Project Settings > Environment Variables**.
4. Deploy!
