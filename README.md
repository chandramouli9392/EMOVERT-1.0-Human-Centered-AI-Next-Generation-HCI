<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:050505,35:171717,70:4C1D95,100:7C3AED&height=260&section=header&text=EMOVERT&fontSize=64&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Emotion-Aware%20Multimodal%20Human-Computer%20Interaction&descAlignY=61&descSize=18" width="100%"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&duration=2600&pause=900&color=A78BFA&center=true&vCenter=true&width=900&lines=Sense+%E2%86%92+Understand+%E2%86%92+Respond+%E2%86%92+Personalize;Emotion-Aware+Multimodal+Interaction;Webcam+%E2%80%A2+Voice+%E2%80%A2+EMO+Fallback;Human-Centered+AI+%E2%80%A2+Adaptive+Environments;Next-Generation+Human-Computer+Interaction" alt="Animated EMOVERT description"/>

<br/><br/>

<img src="https://img.shields.io/badge/EMOVERT-1.0-7C3AED?style=for-the-badge" alt="EMOVERT"/>
<img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
<img src="https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>

<br/>

<img src="https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white" alt="OpenCV"/>
<img src="https://img.shields.io/badge/MediaPipe-Vision-FF6F00?style=for-the-badge" alt="MediaPipe"/>
<img src="https://img.shields.io/badge/DeepFace-Facial%20Analysis-8B5CF6?style=for-the-badge" alt="DeepFace"/>
<img src="https://img.shields.io/badge/FER-Emotion%20Recognition-EC4899?style=for-the-badge" alt="FER"/>

<br/><br/>

### **Sense → Understand → Respond → Personalize**

<i>EMOVERT turns an AI-powered environment into an adaptive human-computer interaction layer.</i>

<br/><br/>

</div>

---

# 🧠 What is EMOVERT?

**EMOVERT** is an emotion-aware, multimodal interaction platform designed to make interaction with intelligent environments more natural and human-centered.

Instead of requiring users to continuously interact through buttons, menus, or conventional chat interfaces, EMOVERT explores an interaction model where the system can:

* 👁️ Observe visual presence and facial affect
* 🎙️ Fall back to voice when visual interaction is unavailable
* ⌨️ Provide manual **EMO** input when neither visual nor voice interaction succeeds
* 💡 Generate personalized wellness-oriented recommendations
* 🎵 Connect mood states with music and activities
* 📊 Record interaction history
* 📈 Surface longitudinal interaction insights
* 🔐 Provide privacy controls so the user remains in control

---

# 🌐 The EMOVERT Experience

```text
                         👤 USER
                            │
                            ▼
                 ┌─────────────────────┐
                 │     👁️ WEBCAM       │
                 │       PRIMARY       │
                 └──────────┬──────────┘
                            │
                     Face + Emotion?
                       ╱          ╲
                     YES           NO
                      │             │
                      ▼             ▼
                 😊 MOOD       🎙️ VOICE
                               FALLBACK
                                  │
                              Response?
                              ╱       ╲
                            YES        NO
                             │          │
                             ▼          ▼
                        🎙️ MOOD      ⌨️ EMO
                                    INPUT
                                      │
                                      ▼
                                😊 MOOD STATE
                                      │
                                      ▼
                              💡 RECOMMENDATIONS
                                      │
                                      ▼
                              🎵 🎨 🌿 ENVIRONMENT
                                      │
                                      ▼
                                  📊 INSIGHTS
```

> ### 🔑 Interaction Hierarchy
>
> **Webcam → Voice → EMO Manual Input**
>
> Voice and manual input are **fallback mechanisms**, not simultaneous modalities.

---

# 🎯 Problem

Traditional human-computer interaction often requires the user to explicitly initiate every action:

```text
User → Screen → Command → System → Output
```

This can create friction when the user is:

* Away from the screen
* Unable or unwilling to type
* Not interacting directly with the interface
* In a situation where conventional controls are inconvenient

EMOVERT explores a different interaction model:

```text
User ↔ AI ↔ Environment
```

The system attempts to understand the interaction context, asks the user when visual inference is unavailable, and uses the resolved mood state to generate appropriate recommendations.

---

# ✨ Core Features

## 👁️ 1. Visual Emotion Interaction

The session interface contains a live webcam experience using:

* `react-webcam`
* OpenCV
* MediaPipe
* DeepFace
* FER

The backend exposes an emotion-detection API intended to process image data and return an emotion/confidence result.

### Visual Interaction Pipeline

```text
START SESSION
      │
      ▼
ACTIVATE WEBCAM
      │
      ▼
LOOK FOR FACE
      │
      ▼
ESTIMATE EMOTION
      │
      ▼
RELIABLE RESULT?
      │
   ┌──┴──┐
  YES    NO
   │      │
   ▼      ▼
 MOOD   VOICE
        FALLBACK
```

---

# 🎙️ 2. Voice Fallback (main)

When visual interaction is unsuccessful, EMOVERT can transition to a voice interaction layer.

The intended prompt is:

> **"Hey, I couldn't find you. What's your mood today?"**

The voice layer can use browser-native speech capabilities where supported.

### Voice Fallback Flow

```text
👁️ VISUAL DETECTION
        │
        ▼
   ⏱️ 5 SEC TIMEOUT
        │
        ▼
🎙️ VOICE PROMPT
        │
        ▼
🎤 LISTEN
        │
        ▼
MOOD DETECTED?
     ╱       ╲
   YES        NO
    │          │
    ▼          ▼
  MOOD       ⌨️ EMO
```

---

# ⌨️ 3. EMO Manual Fallback

If voice interaction is unavailable or the user does not respond, the system can provide a manual mood input.

```text
┌─────────────────────────────────────┐
│                 EMO                 │
│                                     │
│        How are you feeling?         │
│                                     │
│   😊 Happy       😢 Sad             │
│   😌 Calm        😡 Angry           │
│   😰 Stressed    😴 Tired           │
│                                     │
│   Or type your mood:                │
│   [____________________________]     │
│                                     │
│             [ Continue ]            │
└─────────────────────────────────────┘
```

This ensures that interaction does not completely fail simply because the primary sensing modality is unavailable.

---

# 😊 Emotion Experience

EMOVERT's interface is designed around an expressive visual language.

```text
😊 HAPPY       😌 CALM        😢 SAD
   ↕             ↕              ↕
😡 ANGRY       😰 ANXIOUS     😴 TIRED
   ↕             ↕              ↕
🤩 EXCITED     😐 NEUTRAL     😣 STRESSED
```

The frontend uses **Framer Motion** for animated UI elements, including:

* 🧠 Animated emotion/AI visualization
* 💫 Pulsing rings
* ✨ Floating emotion particles
* 🔄 Rotating visual rings
* 🎯 Animated status elements
* 🚨 Animated alerts
* 🎬 Animated page transitions

The repository contains an `EmotionBrain` visualization with animated rings, particles, a pulsing brain graphic, and floating emotion-related symbols.

---

# 🧩 System Architecture

```text
┌────────────────────────────────────────────────────────────┐
│                         EMOVERT                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  FRONTEND                                                  │
│  Next.js + React + TypeScript                              │
│                                                            │
│  ┌────────────┐    ┌────────────┐    ┌──────────────┐    │
│  │ Dashboard  │    │  Session   │    │   Analytics  │    │
│  └────────────┘    └─────┬──────┘    └──────────────┘    │
│                           │                                │
│                     Webcam / UI                           │
│                           │                                │
└───────────────────────────┼────────────────────────────────┘
                            │
                         REST API
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                         BACKEND                            │
│                     FastAPI + Python                       │
│                                                            │
│  ┌───────────┐   ┌────────────┐   ┌───────────────────┐  │
│  │   Auth    │   │  Sessions  │   │ Emotion Detection │  │
│  └───────────┘   └────────────┘   └───────────────────┘  │
│                                                            │
│                    ↓                                       │
│              SQLAlchemy / Database                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

# 🏗️ Repository Structure

```text
EMOVERT/
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── emotion/                 # OpenCV Haar Cascade & FER facial affect estimation
│   │   │   └── focus/                   # Eye-aspect ratio (EAR), gaze & drowsiness tracking
│   │   │
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── api.py               # Central APIRouter mounting all 12 subsystem modules
│   │   │       └── endpoints/
│   │   │           ├── auth.py          # User authentication, registration & JWT issuance
│   │   │           ├── sessions.py      # Session lifecycle, pause/resume & duration tracking
│   │   │           ├── emotions.py      # Live frame affect detection, history & summaries
│   │   │           ├── focus.py         # Cognitive focus scoring & fatigue analytics
│   │   │           ├── analytics.py     # Longitudinal dashboard metrics & calendar views
│   │   │           ├── coach.py         # AI-assisted contextual wellness recommendations
│   │   │           ├── chat.py          # Conversational affective support assistant
│   │   │           ├── music.py         # Mood-responsive playlist recommendations
│   │   │           ├── reports.py       # Weekly/monthly PDF report generation & export
│   │   │           ├── achievements.py  # User milestone badges & gamified streak tracking
│   │   │           ├── environment.py   # IoT adaptive lighting & acoustic preset engine
│   │   │           └── interactions.py  # Multimodal fallback telemetry & recovery metrics
│   │   │
│   │   ├── core/
│   │   │   ├── config.py                # Environment configurations & CORS policies
│   │   │   └── security.py              # Password hashing & JWT validation dependencies
│   │   │
│   │   ├── db/
│   │   │   └── base.py                  # SQLAlchemy engine, DeclarativeBase & SQLite sessionmaker
│   │   │
│   │   ├── models/
│   │   │   ├── user.py                  # User account profiles, streaks & EQ statistics
│   │   │   ├── session.py               # Active/archived sessions, focus & drowsiness metrics
│   │   │   ├── emotion.py               # Frame-level emotion logs & confidence ratings
│   │   │   └── interaction_log.py       # Operational fallback telemetry & recovery outcomes
│   │   │
│   │   ├── schemas/                     # Pydantic request/response validation schemas
│   │   └── services/                    # Background utilities & database migration helpers
│   │
│   ├── tests/
│   │   └── test_multimodal_fallback.py  # 17 automated fault-tolerance & recovery test scenarios
│   └── requirements.txt                 # FastAPI, OpenCV, SQLAlchemy, PyTorch dependencies
│
├── frontend/
│   ├── app/
│   │   ├── (dashboard)/                 # Authenticated workspace routes
│   │   │   ├── achievements/            # Gamified milestone cards & streak display
│   │   │   ├── analytics/               # Interactive Recharts & emotion distribution
│   │   │   ├── coach/                   # Personalized AI wellness coaching dialogues
│   │   │   ├── dashboard/               # High-level overview & quick session actions
│   │   │   ├── music/                   # Curated mood-adaptive playlists & playback
│   │   │   ├── profile/                 # Account management & personal baseline statistics
│   │   │   ├── reports/                 # Longitudinal weekly/monthly summary exports
│   │   │   ├── session/                 # Primary live multimodal interaction portal
│   │   │   └── settings/                # Environmental presets, sensitivity & notifications
│   │   │
│   │   ├── login/                       # Secure user sign-in portal
│   │   ├── register/                    # New user registration flow
│   │   ├── layout.tsx                   # Root HTML5 layout & theme wrappers
│   │   └── page.tsx                     # Landing page with interactive feature showcase
│   │
│   ├── components/
│   │   ├── session/
│   │   │   ├── MultimodalPromptCard.tsx # Synchronized voice + screen-text prompt banner
│   │   │   ├── ManualEmotionFallback.tsx# Touch/keyboard mood override & confirmation interface
│   │   │   └── AmbientEnvironmentFeedback.tsx # Lighting & acoustic adaptation indicator
│   │   ├── background/
│   │   │   ├── AIBackground.tsx         # Dynamic ambient canvas animations
│   │   │   └── EmotionBrain.tsx         # Real-time neural pulsing & emotion particle visualizer
│   │   └── ui/                          # Reusable buttons, modals, dropdowns & badges
│   │
│   ├── hooks/
│   │   └── useStore.ts                  # Zustand global application state store
│   │
│   ├── lib/
│   │   ├── api.ts                       # Typed Axios client for all 12 backend endpoints
│   │   ├── promptManager.ts             # Single source of truth for synchronized multimodal text
│   │   ├── speechService.ts             # Web Speech STT/TTS engine with silent timeout fallbacks
│   │   └── utils.ts                     # Class merges (clsx + twMerge) & formatting helpers
│   │
│   ├── types/
│   │   └── index.ts                     # TypeScript definitions for sessions, states & telemetry
│   │
│   ├── middleware.ts                    # Edge route protection & token inspection
│   ├── package.json                     # Next.js 15, React 19, Lucide, Framer Motion
│   ├── tailwind.config.ts               # Custom color palette, glassmorphism & gradients
│   └── tsconfig.json                    # Strict TypeScript compilation parameters
│
└── README.md
```

---

# 🖥️ Frontend Stack

| Technology                 | Purpose                |
| -------------------------- | ---------------------- |
| **Next.js 15**             | Application framework  |
| **React 19**               | UI                     |
| **TypeScript**             | Type safety            |
| **Tailwind CSS**           | Styling                |
| **Framer Motion**          | Animations             |
| **Lucide React**           | Icons                  |
| **Recharts**               | Data visualization     |
| **Zustand**                | Client state           |
| **Axios**                  | API communication      |
| **react-webcam**           | Webcam interface       |
| **React Hot Toast**        | Notifications          |
| **React Markdown**         | Markdown rendering     |
| **jsPDF**                  | PDF generation         |
| **html2canvas**            | UI capture             |
| **react-calendar-heatmap** | Activity visualization |

---

# 🧠 Backend Stack

| Technology            | Purpose                     |
| --------------------- | --------------------------- |
| **FastAPI**           | REST API                    |
| **Python**            | Backend / AI implementation |
| **SQLAlchemy**        | ORM                         |
| **Alembic**           | Database migrations         |
| **Pydantic**          | Validation / settings       |
| **OpenCV**            | Computer vision             |
| **MediaPipe**         | Face / vision processing    |
| **DeepFace**          | Facial analysis             |
| **FER**               | Facial emotion recognition  |
| **NumPy**             | Numerical processing        |
| **Pillow**            | Image processing            |
| **JWT / python-jose** | Authentication              |
| **Passlib / bcrypt**  | Password security           |
| **ReportLab**         | Report generation           |

---

# 📱 Application Pages

The dashboard contains multiple functional areas.

## 🏠 Dashboard

Central overview of the user's EMOVERT activity.

## 🎥 Live Session

The main real-time interaction experience.

Includes:

* Webcam interface
* Session controls
* Privacy mode
* Emotion status
* Focus-related indicators
* Alerts
* Session duration

## 🧠 Coach

Provides recommendations based on the user's interaction state.

## 🎵 Music

Provides the music-oriented part of the experience.

## 📊 Analytics

Visualizes interaction and emotion-related information.

## 📄 Reports

Provides report-oriented views and generated outputs.

## 🏆 Achievements

Tracks user-oriented achievement/progress information.

## 👤 Profile

User profile information.

## ⚙️ Settings

Application settings and preferences.

## 🛡️ Privacy

Provides user control over monitoring behavior.

---

# 🎬 Emotion Animation System

EMOVERT uses **Framer Motion** to make the interface feel alive rather than static.

The existing `EmotionBrain` component demonstrates this visual language:

```text
              ✨        💡

           ○                ○

        ○       🧠 EMOVERT     ○

           ○                ○

              😊       🎯
```

### Animation Concepts

```text
ROTATING RINGS
      ↻
      │
      ▼
PULSING BRAIN
      🧠
      │
      ▼
FLOATING EMOJIS
😊   ✨   💡   🎯
      │
      ▼
PULSE WAVES
   ))  🧠  ((
```

These animations are intended to communicate:

* System activity
* AI processing
* Emotion awareness
* Attention
* Interaction state

---

# 🔄 Complete Interaction Flow

```text
                         👤 USER
                            │
                            ▼
                       ▶️ START
                            │
                            ▼
                       👁️ WEBCAM
                            │
                    ┌───────┴───────┐
                    │               │
                   😊              ❌
                 DETECT           TIMEOUT
                    │               │
                    │               ▼
                    │            🎙️ VOICE
                    │               │
                    │          ┌────┴────┐
                    │          │         │
                    │         😊        ❌
                    │        MOOD      TIMEOUT
                    │          │         │
                    │          │         ▼
                    │          │       ⌨️ EMO
                    │          │         │
                    └──────────┴─────────┘
                               │
                               ▼
                         🧠 RESOLVE
                               │
                               ▼
                         💡 RECOMMEND
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
                   🎵         🧘         🌈
                 MUSIC      ACTIVITY   ENVIRONMENT
                    │          │          │
                    └──────────┼──────────┘
                               ▼
                             📊 LOG
                               │
                               ▼
                           📈 INSIGHTS
```

---

# 🧠 Emotion Resolution

EMOVERT distinguishes between **AI-estimated affect** and **user-reported mood**.

## 👁️ Visual Path

```text
Camera
  ↓
Face
  ↓
Facial Analysis
  ↓
Estimated Emotion
  ↓
Confidence
```

## 🎙️ Voice Path

```text
Speech
  ↓
Speech-to-Text
  ↓
Mood Extraction
  ↓
User-Reported Mood
```

## ⌨️ Manual Path

```text
EMO
 ↓
User Selection / Text
 ↓
User-Reported Mood
```

> Facial expressions are not perfect representations of a person's internal emotional state.

This distinction is therefore important when interpreting the resulting mood state.

---

# 💡 Recommendation Philosophy

EMOVERT's recommendations are designed as **general wellness and interaction suggestions**, not medical diagnosis or treatment.

## 😊 Happy

* 🎵 Music
* 🎨 Creative activities
* 🚶 Movement
* 🌈 Positive environment settings

## 😢 Sad

* 🎵 Calming music
* 🚶 Gentle activity
* 💧 Hydration reminders
* 🌿 Relaxation-oriented suggestions

## 😰 Stressed

* 🧘 Breathing
* 🧘 Stretching / yoga
* ⏸️ Short break
* 🎵 Calming audio
* 🌙 Reduced stimulation

## 😴 Tired

* 💧 Hydration
* ⏸️ Rest / break
* 🚶 Light movement
* 🎵 Suitable audio

---

# 📊 Longitudinal Interaction Insights

The project is designed to support interaction history across multiple time scales.

```text
                       📊 INSIGHTS
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
           TODAY         WEEKLY        MONTHLY
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                         YEARLY
```

Potential measures include:

* Mood distribution
* Interaction frequency
* Modality usage
* Visual detection success
* Voice fallback frequency
* Manual fallback frequency
* Recommendation interactions

> These should be interpreted as **interaction / wellness patterns**, not clinical assessments.

---

# 🔐 Privacy by Design

Privacy is a core part of the system.

EMOVERT should:

* Allow the user to disable monitoring
* Stop webcam-based interaction when privacy mode is active
* Avoid unnecessary storage of raw camera frames
* Minimize stored sensor information
* Distinguish user-reported information from model estimates
* Provide user control over recommendations and interaction

## 🛡️ Privacy Mode

```text
┌───────────────────────────────┐
│     🛡️ PRIVACY MODE ON       │
├───────────────────────────────┤
│                               │
│ Camera            ❌          │
│ Automatic Voice   ❌          │
│ Emotion Detection ❌          │
│ Sensor Collection ❌          │
│                               │
│ User remains in control.     │
└───────────────────────────────┘
```

---

# ⚙️ Installation & Quick Start

### ⚙️ Prerequisites
* **Python**: 3.10+ (Python 3.11 recommended)
* **Node.js**: 18+ (Node.js 20+ recommended)
* **OS**: Windows, macOS, or Linux (Webcam and Microphone optional — full voice and screen-text fallback supported!)

---

## 1. Clone the Repository

```bash
git clone https://github.com/chandramouli9392/EMOVERT-1.0-Human-Centered-AI-Next-Generation-HCI.git
cd EMOVERT-1.0-Human-Centered-AI-Next-Generation-HCI
```

---

## 2. 🖥️ Terminal 1: Backend Setup & Execution (FastAPI)

Navigate to the `backend` directory:

```bash
cd backend
```

### Create and Activate Virtual Environment

#### Windows PowerShell:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### macOS / Linux / Bash:
```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies:

```bash
pip install -r requirements.txt
```

### Environment Configuration:

All AI computer vision, focus estimation, and affect models run **100% locally and free** on native OpenCV cascades. No paid external API keys are required!

* **Database**: Local SQLite database `sqlite:///./emovert.db` is initialized automatically on startup.
* Templates are provided in `backend/.env.example` and `frontend/.env.example`.

### Launch FastAPI Server:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

* **FastAPI Server**: `http://127.0.0.1:8000`
* **Interactive API Docs (Swagger UI)**: `http://127.0.0.1:8000/docs`
* **Healthcheck**: `http://127.0.0.1:8000/health`

---

## 3. 💻 Terminal 2: Frontend Setup & Execution (Next.js 15 & React 19)

Open a second terminal window:

```bash
cd frontend
```

### Install Dependencies:

> 💡 **Important for Windows PowerShell Users**:
> Windows PowerShell restricts `.ps1` execution by default (`PSSecurityException`). Running `npm.cmd` bypasses script execution restrictions seamlessly without administrative intervention:

#### Windows PowerShell (Recommended):
```powershell
npm.cmd install --legacy-peer-deps
npm.cmd run dev
```

#### macOS / Linux / Bash:
```bash
npm install --legacy-peer-deps
npm run dev
```

### Open the Application:

```text
http://localhost:3000
```

### 🧪 Frontend NPM Commands

| Action | Windows PowerShell | macOS / Linux / Bash |
| :--- | :--- | :--- |
| **Development Server** | `npm.cmd run dev` | `npm run dev` |
| **Type Checking** | `npm.cmd run type-check` | `npm run type-check` |
| **Production Build** | `npm.cmd run build` | `npm run build` |
| **Production Start** | `npm.cmd run start` | `npm run start` |
| **Code Linting** | `npm.cmd run lint` | `npm run lint` |

---

## 4. 🧪 Terminal 3: Automated Multimodal Fallback Test Suite

EMOVERT includes an automated unit & integration test suite verifying all 17 fault-tolerance, human-in-the-loop, and modality fallback scenarios:

```powershell
# Run from repository root:
backend\venv\Scripts\python.exe -m unittest backend/tests/test_multimodal_fallback.py
```

```text
Ran 17 tests in 0.042s
OK
```

All 17 verification points pass, covering visual affect estimation, visual timeouts, speech synthesis (TTS) failures, speech recognition (STT) fallbacks, manual input overrides, human confirmation/correction, physical IoT hardware failure recovery, and privacy telemetry logging.

---

# 🛡️ Multimodal Interaction State Machine

EMOVERT features a 13-stage multimodal state machine providing graceful degradation across visual, voice, and manual modalities:

```text
[IDLE] ➔ [PRESENCE_DETECTED]
             │
             ├─ Camera available? ➔ [CHECKING_VISUAL_INPUT] ➔ [VISUAL_ESTIMATION]
             │                                                          │
             │                                                          ▼
             │                                                 [CONFIRMING_STATE]
             │                                                          ▲
             └─ Camera denied/no face? ➔ [VOICE_PROMPT] ➔ [VOICE_LISTENING] ─┘
                                                │               │
                                         STT timeout/mic denied?│
                                                ▼               │
                                         [MANUAL_INPUT] ────────┘
                                                │
                          [GENERATING_RECOMMENDATION] (AI or Local Offline Guide)
                                                │
                                                ▼
                          [APPLYING_ENVIRONMENT_ACTION] (Lighting & Soundscape)
                                                │
                                                ▼
                                           [COMPLETED]
```

### Key Engineering Principles:
1. **Never Fail Silent**: If camera, microphone, or AI services disconnect, the user is never blocked. Interaction continues through screen text and manual mood buttons.
2. **Synchronized Voice & Screen Text**: Spoken prompts are paired with readable text cards on screen from a single source of truth (`promptManager.ts`).
3. **Human Control Guarantee**: AI facial estimates require confirmation or correction before environmental actions execute.
4. **Environmental IoT Adaptation**: Transparently reports physical IoT connectivity vs. local ambient software emulation.

---

# 🔌 Comprehensive API Architecture (12 Modular Subsystems)

The FastAPI backend exposes 12 modular RESTful endpoints organized under `/api/v1`:

```text
/api/v1
│
├── 🔐 /auth                      # Authentication & Identity
│   ├── POST /register            # New user account registration
│   ├── POST /login               # JWT authentication token generation
│   ├── POST /google              # Google OAuth2 identity assertion
│   ├── GET  /me                  # Current authenticated user profile
│   └── POST /logout              # Invalidate user session
│
├── ⏱️ /sessions                  # Interaction Session Lifecycle
│   ├── POST /start               # Begin new monitored session
│   ├── POST /{id}/end            # Finalize session and record duration
│   ├── POST /{id}/pause          # Temporarily halt metric logging
│   ├── POST /{id}/resume         # Resume metric logging
│   ├── GET  /history             # Retrieve past session summaries
│   └── GET  /{id}                # Fetch detailed session telemetry
│
├── 😊 /emotions                  # Affect Estimation & Tracking
│   ├── POST /detect              # Live webcam frame emotion classification
│   ├── GET  /history             # Query user emotion log history
│   ├── GET  /summary             # Aggregate emotion statistics by date
│   └── GET  /trends              # Longitudinal emotion distribution
│
├── 🎯 /focus                     # Cognitive & Drowsiness Telemetry
│   ├── POST /analyze             # Eye aspect ratio (EAR) & focus computation
│   ├── GET  /score/{session_id}  # Session focus performance index
│   └── GET  /trends              # Fatigue & distraction patterns
│
├── 📊 /analytics                 # Dashboards & Longitudinal Insights
│   ├── GET  /dashboard           # Holistic user wellness metrics
│   ├── GET  /weekly              # 7-day affective trend breakdown
│   ├── GET  /monthly             # 30-day affect & focus correlation
│   └── GET  /calendar            # Heatmap activity dataset by year/month
│
├── 🧠 /coach                     # Contextual Wellness Recommendations
│   ├── GET  /daily               # Daily emotional well-being briefing
│   ├── GET  /weekly              # Weekly cognitive resilience summary
│   ├── GET  /insights            # Pattern detection & habit advisories
│   └── GET  /recommendations     # Mood-targeted coping & focus suggestions
│
├── 💬 /chat                      # Affective Dialogue Assistant
│   ├── POST /send                # Submit message with active emotion context
│   └── GET  /history             # Retrieve conversational history
│
├── 🎵 /music                     # Mood-Adaptive Soundscapes
│   ├── GET  /tracks              # Curated focus & relaxation tracks
│   ├── GET  /favorites           # User bookmarked soundscapes
│   ├── POST /favorites/{id}      # Toggle track favorite state
│   └── GET  /recommendations     # Tracks aligned with active emotional state
│
├── 📄 /reports                   # PDF Export & Clinical Summaries
│   ├── GET  /weekly              # Generate downloadable weekly PDF report
│   ├── GET  /monthly             # Generate downloadable monthly PDF report
│   └── POST /{id}/share          # Create secure sharing token
│
├── 🏆 /achievements              # Gamified Milestones & Streaks
│   ├── GET  /                    # List all available milestone badges
│   └── GET  /unlocked            # List milestones earned by authenticated user
│
├── 💡 /environment               # IoT Ambient Environmental Adaptation
│   ├── POST /apply               # Trigger lighting, color & soundscape preset
│   ├── GET  /status              # Query connected IoT device statuses
│   └── GET  /presets/{emotion}   # Retrieve ambient profile for target emotion
│
└── 🛡️ /interactions              # Fault-Tolerance & Recovery Telemetry
    ├── POST /events              # Record privacy-preserving fallback events
    └── GET  /metrics             # Fallback frequency & recovery success rates
```

All endpoints are fully typed and accessible via `frontend/lib/api.ts`:
`authAPI`, `sessionAPI`, `emotionAPI`, `focusAPI`, `analyticsAPI`, `coachAPI`, `chatAPI`, `musicAPI`, `reportAPI`, `achievementAPI`, `environmentAPI`, and `interactionAPI`.

---

# 🗃️ Data Models & Database Schema

EMOVERT maintains an SQLite database (`emovert.db`) via SQLAlchemy with strict data minimization principles:

```text
┌─────────────────────────────────┐
│              User               │
├─────────────────────────────────┤
│ id: Integer (PK)                │
│ email: String (Unique)          │
│ name: String                    │
│ hashed_password: String         │
│ total_sessions: Integer         │
│ total_emotions_logged: Integer  │
│ dominant_emotion: String        │
│ focus_score: Float              │
│ eq_score: Float                 │
│ streak: Integer                 │
│ achievements: JSON List         │
└────────────────┬────────────────┘
                 │ 1:N
                 ├───────────────────────────────┐
                 │ 1:N                           │ 1:N
                 ▼                               ▼
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│             Session             │  │          EmotionLog           │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│ id: Integer (PK)                │  │ id: Integer (PK)                │
│ user_id: Integer (FK -> User)   │  │ user_id: Integer (FK -> User)   │
│ start_time: DateTime            │  │ session_id: Integer (FK)        │
│ end_time: DateTime              │  │ emotion: String                 │
│ duration: Integer (seconds)     │  │ confidence: Float               │
│ focus_score: Float              │  │ timestamp: DateTime             │
│ attention_score: Float          │  └─────────────────────────────────┘
│ drowsiness_score: Float         │
│ status: String (active/ended)   │
│ drowsiness_events: Integer      │
│ distraction_events: Integer     │
│ emotion_changes: JSON List      │
└────────────────┬────────────────┘
                 │ 1:N
                 ▼
┌─────────────────────────────────┐
│         InteractionLog          │
├─────────────────────────────────┤
│ id: Integer (PK)                │
│ user_id: Integer (FK -> User)   │
│ session_id: Integer (FK)        │
│ interaction_id: String (UUID)   │
│ event_type: String              │
│ modality: String (visual/voice) │
│ source: String (camera/speech)  │
│ latency_ms: Integer             │
│ is_fallback: Boolean            │
│ recovery_outcome: String        │
│ confirmed_emotion: String       │
│ timestamp: DateTime             │
└─────────────────────────────────┘
```

### Telemetry Modality Attributes:
* **`modality`**: `visual`, `voice`, `manual`, `environment`
* **`source`**: `visual_estimation`, `voice_input`, `manual_input`
* **`recovery_outcome`**: `recovered`, `failed`, `cancelled`, `completed`

This non-invasive architecture allows full diagnostic observability of multimodal recovery rates without storing sensitive user images or voice recordings.

---

# 🧪 Testing the Interaction

## Test 1 — Visual Success

```text
Start Session
     ↓
Webcam
     ↓
Face Detected
     ↓
Emotion Detected
     ↓
Recommendation
```

**Voice should not be activated.**

---

## Test 2 — Visual Timeout

```text
Start Session
     ↓
Webcam
     ↓
No Reliable Visual Result
     ↓
5 Seconds
     ↓
Voice Fallback
```

---

## Test 3 — Voice Success

```text
Voice Prompt
     ↓
User: "I'm feeling stressed"
     ↓
Mood Extraction
     ↓
Stress-Oriented Recommendations
```

---

## Test 4 — Voice Timeout

```text
Voice Prompt
     ↓
No Response
     ↓
EMO
     ↓
User Selects Mood
     ↓
Recommendations
```

---

# 🧱 Development Principles

EMOVERT follows several important principles.

## 1. 🤝 Human-in-the-Loop

AI estimates should not be treated as absolute truth.

## 2. 🔄 Fallback-First Interaction

When one modality fails, another modality keeps the interaction alive.

## 3. 👤 User Control

The user can override or correct AI-estimated states.

## 4. 🔐 Privacy

Sensor data should be minimized and handled responsibly.

## 5. 🧩 Graceful Degradation

Camera, microphone, browser, backend, or model failures should not crash the entire experience.

## 6. 🔎 Explainability

The interface should make it clear whether a state came from:

```text
👁️ AI Visual Estimate

🎙️ User Voice Report

⌨️ User Manual Input
```

---

# 🛠️ Current Development Architecture

The repository provides the foundation for:

```text
                 Next.js Frontend
                        │
                        ▼
                 FastAPI Backend
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
   Authentication    Sessions     Emotion API
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                  Database Models
                        │
                        ▼
                AI / Computer Vision
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       OpenCV       MediaPipe      DeepFace
                                      │
                                      ▼
                                     FER
```

The frontend already includes:

* Session UI
* Webcam component
* Animated visual components
* Dashboard pages
* Music area
* Coach area
* Report area
* Analytics UI
* Privacy controls

The complete end-to-end multimodal pipeline should be treated as an integration layer across these existing components rather than as a separate application.

---

# 🚧 Development & Implementation Status

| Subsystem / Feature Area | Status | Implementation Details |
| :--- | :---: | :--- |
| **Next.js 15 & React 19 Frontend** | 🟢 | Fully operational with responsive App Router layout & Tailwind styling |
| **Tailwind UI & Framer Motion** | 🟢 | Interactive neural brain, ambient pulses & floating particle canvas |
| **Authentication & Authorization** | 🟢 | JWT token issuance, bcrypt hashing, edge middleware route protection |
| **Session Lifecycle APIs** | 🟢 | Start, pause, resume, end with SQLite database persistence |
| **Local OpenCV Facial Affect** | 🟢 | Sub-second Haar cascades & FER affect estimation, 100% free & local |
| **Cognitive Focus & EAR Tracking** | 🟢 | Eye-aspect-ratio, blink frequency, distraction & drowsiness telemetry |
| **Synchronized Voice Multimodal Fallback** | 🟢 | Single source of truth (`promptManager.ts`), SpeechRecognition & TTS |
| **EMO Manual Input & Confirmation** | 🟢 | Touch/keyboard mood override, human-in-the-loop state verification |
| **Contextual Wellness Coach** | 🟢 | Emotion-targeted coping mechanisms & focus recommendations |
| **Mood-Adaptive Music Engine** | 🟢 | Dynamic playlist suggestions aligned with active emotional state |
| **PDF Reporting & Export** | 🟢 | Weekly/monthly downloadable wellness performance summaries |
| **Longitudinal Analytics & Heatmaps** | 🟢 | Recharts visualizations, EQ trend lines & calendar activity heatmaps |
| **Operational Telemetry Logging** | 🟢 | Privacy-preserving fallback metrics & recovery outcome rates |
| **Automated Test Suite (17 Scenarios)** | 🟢 | 100% test pass rate across all fault-tolerance and recovery cases |
| **Ambient Environmental Adaptation** | 🟢 | Software lighting/sound emulation + physical device bridge API |
| **Physical IoT Hardware Deployment** | 🟡 | Hardware endpoint ready; physical ESP32 / MQTT peripheral integration |

> All core software, AI computer vision, voice/screen multimodal fallbacks, database models, and unit test suites are fully implemented, verified, and operational.

---

# 🔮 Future Extensions

EMOVERT can evolve from a laptop-based software prototype toward a physical intelligent environment.

## Future Architecture

```text
                    ☁️ / LOCAL AI
                          │
                          ▼
                       🧠 EMOVERT
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
           📷 Camera    🎙️ Mic      ⌨️ EMO
              │           │           │
              └───────────┼───────────┘
                          │
                          ▼
                     😊 MOOD STATE
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
           💡 Light     🎵 Music    🖥️ Visuals
              │           │           │
              └───────────┼───────────┘
                          ▼
                    🌐 ENVIRONMENT
```

### Potential Hardware Integrations

* Raspberry Pi
* ESP32
* Smart lighting
* Philips Hue-compatible lighting
* MQTT
* Speakers
* Displays
* Environmental sensors

---

# 🏆 Research / HCI Direction

EMOVERT explores **HCI beyond traditional screen-and-chat interaction**.

Instead of:

```text
User → Screen → Command
```

the project investigates:

```text
             User
              ↕
              AI
              ↕
    Physical / Digital Environment
```

The environment becomes an active part of the interaction.

---

# 🔬 Central Research Question

> **How can an intelligent environment maintain meaningful human interaction when its primary sensing modality is uncertain or unavailable?**

EMOVERT addresses this through:

```text
Multimodal Sensing
       +
Fallback Interaction
       +
Human Confirmation
       +
Personalized Recommendations
       +
Environmental Adaptation
       +
Longitudinal Interaction Insights
```

---

# 📜 Intellectual Property

EMOVERT has been associated with a patent application provided by the project author.

### Patent Application No.

```text
202641008854
```

### Status

**Filed**

---

# 👨‍💻 Author

<div align="center">

## Boppana Chandramouli

**B.Tech — Computer Science & Engineering**

**Artificial Intelligence & Machine Learning**

**Mohan Babu University**

Tirupati, Andhra Pradesh, India

</div>

---

# ❤️ EMOVERT Philosophy

```text
                         🧠
                        /  \
                       /    \
                     👁️    🎙️
                      \  EMOVERT  /
                       \        /
                        ⌨️    💡
                          \    /
                           \  /
                            👤
                           USER
```

> ## **Technology should adapt to people — not force people to adapt to technology.**

---

# 🔁 Final Interaction Loop

```text
                         👤 USER
                            │
                            ▼
                          ▶️ START
                            │
                            ▼
                         👁️ WEBCAM
                            │
                    ┌───────┴───────┐
                    │               │
                   😊              ❌
                 DETECT           TIMEOUT
                    │               │
                    │               ▼
                    │            🎙️ VOICE
                    │               │
                    │          ┌────┴────┐
                    │          │         │
                    │         😊        ❌
                    │        MOOD      TIMEOUT
                    │          │         │
                    │          │         ▼
                    │          │       ⌨️ EMO
                    │          │         │
                    └──────────┴─────────┘
                               │
                               ▼
                           🧠 RESOLVE
                               │
                               ▼
                          💡 RECOMMEND
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
                   🎵         🧘         🌈
                 MUSIC      ACTIVITY   ENVIRONMENT
                    │          │          │
                    └──────────┼──────────┘
                               ▼
                             📊 LOG
                               │
                               ▼
                           📈 INSIGHTS
                               │
                               └──────────↺
```

---

<div align="center">

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=20&duration=2800&pause=1000&color=A78BFA&center=true&vCenter=true&width=850&lines=Sense+%E2%80%A2+Understand+%E2%80%A2+Respond+%E2%80%A2+Personalize;Human-Centered+AI;Multimodal+Interaction;Adaptive+Intelligent+Environments" alt="EMOVERT closing animation"/>

<br/><br/>

### 🧠 EMOVERT

**Sense. Understand. Respond. Personalize.**

<br/>

<i>Made with ❤️ for Human-Centered AI & Next-Generation HCI.</i>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7C3AED,45:4C1D95,75:171717,100:050505&height=140&section=footer" width="100%"/>

</div>
