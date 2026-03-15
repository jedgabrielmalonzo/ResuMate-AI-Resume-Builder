# 🚀 Quick Start Guide

Follow these steps to set up and run the project efficiently after cloning.

## 1. Navigate to the Project Folder
The actual Expo project is located in the `Resumate` subdirectory.
```bash
cd Resumate
```

## 2. Install Dependencies
Install all required packages using npm.
```bash
npm install
```

## 3. Configure Environment Variables
Copy the example environment file and add your API keys.
```bash
cp .env.example .env
```
Open the new `.env` file and fill in your:
- `EXPO_PUBLIC_GEMINI_API_KEY`
- Firebase Configuration (optional, but recommended if you have your own)

## 4. Run the Project
Start the Expo development server.
```bash
npx expo start
```

---

### 💡 Tips for Efficiency
- **Skip Root NPM Install**: Do not run `npm install` in the root directory; it is unnecessary as the project lives in the `Resumate` folder.
- **Expo Go**: Download the **Expo Go** app on your phone to test the app live without an emulator.
- **Clean Start**: If you face issues, run `npm run reset-project` to clear caches.
