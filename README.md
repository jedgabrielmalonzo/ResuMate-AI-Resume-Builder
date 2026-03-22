# ResuMate 📄🤖

**ResuMate** is a premium mobile career assistant built with **React Native (Expo)**. It empowers job seekers by combining professional resume building, AI-driven interview preparation, and real-time guidance through an intelligent chatbot.

---

## ✨ Key Features

### 🔐 Secure Authentication
- Full onboarding and login/signup flow powered by **Firebase Auth**.
- Persistent user sessions and profile management.

### 🧾 Smart Resume Builder
- **Dynamic Input**: Easily load and manage personal info, education, and experience.
- **Multiple Templates**: Choose from several professional designs:
  - **Creative Portfolio**: Vibrant design for creative roles.
  - **Executive Leadership**: Sleek, professional layout for senior roles.
- **AI Integration**: Automatically suggests templates based on your profile.

### 🤖 AI Internal Prep & Chat
- **Interview Specialist**: Generates custom mock interview questions for any Job Title or Company.
- **ResuMate AI Assistant**: A floating chatbot on the Home screen to answer career questions and guide you through the app.
- Powered by **Google Gemini AI**.

### 📄 Export & Settings
- **PDF Export**: Generate high-quality, print-ready PDFs of your resume.
- **Customization**:
  - **Theme Support**: Toggle between Light and Dark mode, or follow system settings.
  - **Localization**: Support for English and Tagalog.
  - **Notifications**: Manage app-wide alerts and reminders.

---

## 🛠️ Tech Stack

- **Framework**: [React Native (Expo)](https://expo.dev/)
- **API**: [Google Gemini AI](https://ai.google.dev/)
- **Backend**: [Firebase](https://firebase.google.com/) (Auth & Firestore)
- **Styling**: Vanilla React Native StyleSheet with "Modern Minimal" design system.
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (Link-based navigation).

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/USERNAME/resumate.git
   cd resumate
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the Development Server**:
   ```bash
   npx expo start
   ```

---

## 👨‍💻 Development Team

ResuMate was built with ❤️ by:
- **Anday**, Jorich Rance L.
- **Bangate**, Gemil Bryle B.
- **Malonzo**, Jed Gabriel D.
- **Polvito**, Paul Carlo V.
- **Portera**, Jasdy Kean P.

---

## 🎯 Project Status
✅ **Completed**: Resume Templates, Dark Mode, AI Chatbot, Functional Settings, Interview Prep Redesign.
🚧 **Future**: Cloud storage for resumes, AI-powered answer scoring, and more templates.
