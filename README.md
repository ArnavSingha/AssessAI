# AssessAI - AI-Powered Interview Assistant

This is a Next.js project for AssessAI, an AI-powered interview assistant. It allows users to upload a resume, generates tailored interview questions, conducts a timed interview, and provides AI-driven feedback and scoring.

## Features

- **Resume Parsing**: Upload a resume (PDF/DOCX) to extract key candidate information.
- **AI Question Generation**: Dynamically generates interview questions based on the resume and a job description.
- **Timed Interview Simulation**: Conducts a mock interview with timed questions of varying difficulty.
- **Automated Scoring & Feedback**: The AI evaluates answers and provides a score and detailed feedback for each question.
- **Candidate Dashboard**: An interviewer-facing dashboard to review all candidate results, with searching and sorting capabilities.
- **Session Persistence**: Interview progress is saved locally, allowing candidates to resume an unfinished session.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of your project and add your Google AI API key:

    ```
    GEMINI_API_KEY=your_api_key_here
    ```

    You can obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Development Server

To run the application in development mode, you need to run both the Next.js server and the Genkit development server concurrently.

1.  **Run the Genkit development server:**
    This server watches for changes in your AI flows.
    ```bash
    npm run genkit:watch
    ```

2.  **In a separate terminal, run the Next.js development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Building for Production

To build the application for production, run:

```bash
npm run build
```

This will create an optimized build of the application in the `.next` folder.

To run the production server, use:

```bash
npm run start
```

## Deployment

This application is configured for deployment on modern hosting platforms like Vercel or Netlify.

### Vercel

1.  Push your code to a Git repository (GitHub, GitLab, etc.).
2.  Import your project into Vercel.
3.  Vercel will automatically detect that it is a Next.js application and configure the build settings.
4.  Add your `GEMINI_API_KEY` as an environment variable in the Vercel project settings.
5.  Deploy!

The build command is `npm run build` and the start command is `npm run start`.
