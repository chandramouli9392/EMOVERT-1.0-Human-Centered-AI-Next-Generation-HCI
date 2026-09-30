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

# 🎙️ 2. Voice Fallback

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
│   │   │   ├── emotion/
│   │   │   └── focus/
│   │   │
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   │           ├── auth.py
│   │   │           ├── emotions.py
│   │   │           └── sessions.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   └── base.py
│   │   │
│   │   ├── models/
│   │   │   ├── emotion.py
│   │   │   ├── session.py
│   │   │   └── user.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── session.py
│   │   │   └── user.py
│   │   │
│   │   └── services/
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── achievements/
│   │   │   ├── analytics/
│   │   │   ├── coach/
│   │   │   ├── dashboard/
│   │   │   ├── get-rid/
│   │   │   ├── music/
│   │   │   ├── profile/
│   │   │   ├── reports/
│   │   │   ├── session/
│   │   │   └── settings/
│   │   │
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── background/
│   │   │   ├── AIBackground.tsx
│   │   │   └── EmotionBrain.tsx
│   │   │
│   │   └── ui/
│   │
│   ├── hooks/
│   │   └── useStore.ts
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── middleware.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
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

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd EMOVERT
```

---

## 2. Backend Setup

Move into the backend:

```bash
cd backend
```

### Create Virtual Environment

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

#### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🔑 3. Configure Environment Variables

Create the required environment configuration according to the backend configuration module.

Example:

```env
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

> ⚠️ **Do not commit secrets to Git.**

---

# 🚀 4. Start Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

FastAPI server:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Frontend Commands

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Production Server

```bash
npm run start
```

### Type Checking

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

---

# 🔌 API Architecture

The current backend API structure includes:

```text
/api/v1
│
├── auth
│   ├── register
│   └── login
│
├── emotions
│   ├── detect
│   ├── history
│   └── summary
│
└── sessions
    ├── start
    ├── end
    ├── pause
    └── history
```

The frontend API client is centralized in:

```text
frontend/lib/api.ts
```

---

# 🗃️ Data Models

The backend contains models for:

```text
User
  │
  ├── Sessions
  │
  └── Emotion Logs
```

An emotion interaction can contain information such as:

```text
User
Session
Emotion
Confidence
Timestamp
```

The implementation can be extended to distinguish:

```text
source = webcam
source = voice
source = manual
```

This enables more complete multimodal interaction analytics.

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

# 🚧 Development Status

| Area                           | Status              |
| ------------------------------ | ------------------- |
| Next.js frontend               | 🟢                  |
| React UI                       | 🟢                  |
| TypeScript                     | 🟢                  |
| Tailwind UI                    | 🟢                  |
| Framer Motion animations       | 🟢                  |
| Webcam UI                      | 🟢                  |
| Authentication structure       | 🟢                  |
| Session UI                     | 🟢                  |
| Session APIs                   | 🟡                  |
| Emotion API structure          | 🟡                  |
| Real webcam → emotion pipeline | 🔧 Integration      |
| Voice fallback                 | 🔧 Integration      |
| EMO manual fallback            | 🔧 Integration      |
| Recommendation integration     | 🔧 Integration      |
| Real-time analytics            | 🔧 Integration      |
| Longitudinal insights          | 🔧 Integration      |
| Physical IoT environment       | 🚧 Future extension |

> Status labels describe the repository architecture and integration state; they should be updated as implementation progresses.

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
