# FitFlex - Your Personal Fitness Journey

A comprehensive fitness web application inspired by MadMuscles that generates personalized workouts with Google's Gemini AI, along with meal tracking, progress monitoring, and habit building.

## Features

### AI-Powered Workout Generation
- Generate completely personalized workout routines with Gemini AI
- Three specialized fitness programs:
  - Weight Loss - Focused on fat burning and cardio
  - Muscle Gain - Strength training for muscle building
  - Overall Fitness - General health and wellness
- 4-week progressive program with increasing intensity
- Weekly focus areas that guide the AI workout generation
- Daily workout routines generated on demand using Google's Gemini API
- Smart AI prompt engineering that generates appropriate exercises based on:
  - Current program and week
  - Weekly focus areas
  - Appropriate intensity and progression
  - Exercise variety

### Weekly Progression System
- Each week has specific focus areas and goals
- Gradual progression in intensity and complexity
- Workouts adapt based on the current week's focus
- Visual indicators of weekly focus areas

### Meal Planning
- Daily meal suggestions with nutritional information
- Macronutrient breakdown for each meal
- Recipe viewing capabilities
- Weekly grocery list generation

### Progress Tracking
- Weight tracking visualization
- Workout statistics (completed workouts, minutes, calories)
- Visual progress indicators

### Habit Building
- Track daily habits essential for fitness success
- Water intake, sleep, and meditation tracking
- Visual progress indicators for each habit
- Ability to add custom habits

## Technologies Used

- HTML
- CSS
- JavaScript (Vanilla, no frameworks)
- Google Gemini AI API for workout generation
- Express.js for serving the application
- Ngrok for exposing the local server to the internet
- Responsive design for mobile, tablet, and desktop

## Setup

1. **API Key Setup:**
   - Create a Google Cloud account at https://cloud.google.com/
   - Enable the Gemini API in your Google Cloud Console
   - Generate an API key from the Google Cloud Console
   - Add your API key to the `GEMINI_API_KEY` variable in `script.js`

2. **Local Setup:**
   - Make sure you have Node.js installed on your computer
   - Install dependencies by running `npm install` in the project directory
   - Start the server with `npm start` or `npm run dev` for development mode with auto-reload
   - Access the app at http://localhost:3000

3. **Ngrok Setup:**
   - Download and install ngrok from https://ngrok.com/
   - Run `ngrok http 3000` in a separate terminal window
   - Use the ngrok URL provided (e.g., https://abc123.ngrok.io) to access your app from anywhere

4. **Alternative Simple Setup:**
   - If you don't want to use Node.js, you can simply open the `index.html` file in any modern web browser
   - To skip the intro screen for testing, use the URL parameter: `index.html?skip_intro=true`

## Structure

- `index.html` - Main HTML structure
- `styles.css` - Styling for the application
- `script.js` - JavaScript functionality and API integration for workout generation
- `server.js` - Express server for hosting the application
- `package.json` - Node.js dependencies and scripts

## API Workflow

The app connects to Google's Gemini API to generate workouts based on:
- The selected program (Weight Loss, Muscle Gain, Overall Fitness)
- The current week number and its focus areas
- Uses a structured prompt to request specifically formatted workouts
- Parses the AI response and formats it for display
- Includes fallback to locally generated workouts if API fails

## Customization

The app contains three workout programs by default, each with a 4-week progression plan. You can easily modify or add new programs by editing the `programs` object in the `script.js` file. 