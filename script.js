// Gemini API Key Configuration
const GEMINI_API_KEY = 'AIzaSyAH5JHkUJbMB-6BCeKm2FzA_iFXixkd-no'; 
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Function to make API calls to Gemini
async function callGeminiAPI(prompt) {
    try {
        // For CORS compatibility when running on ngrok
        let apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return null;
    }
}

// Program structure without predefined workouts
const programs = {
    "weight-loss": {
        name: "Weight Loss Program",
        description: "Burn fat and improve cardio fitness",
        weeks: [
            {
                name: "Week 1: Foundation",
                description: "Building basic fitness and establishing routines",
                focusAreas: ["Cardio", "Core", "Full Body"]
            },
            {
                name: "Week 2: Progression",
                description: "Increasing intensity and duration",
                focusAreas: ["HIIT", "Lower Body", "Core"]
            },
            {
                name: "Week 3: Challenge",
                description: "Increased difficulty and complexity",
                focusAreas: ["Cardio", "Full Body", "High Intensity"]
            },
            {
                name: "Week 4: Intensity",
                description: "Peak intensity week before recovery",
                focusAreas: ["Maximum Effort", "Circuit Training", "Full Body"]
            }
        ]
    },
    "muscle-gain": {
        name: "Muscle Gain Program",
        description: "Build strength and increase muscle mass",
        weeks: [
            {
                name: "Week 1: Foundation",
                description: "Building basic strength and proper form",
                focusAreas: ["Upper Body", "Lower Body", "Core"]
            },
            {
                name: "Week 2: Volume",
                description: "Increasing training volume",
                focusAreas: ["Push", "Pull", "Legs"]
            },
            {
                name: "Week 3: Progressive Overload",
                description: "Increasing resistance and challenge",
                focusAreas: ["Compound Movements", "Hypertrophy", "Strength"]
            },
            {
                name: "Week 4: Peak Intensity",
                description: "Maximum effort for strength gains",
                focusAreas: ["Power", "Endurance", "Full Body Integration"]
            }
        ]
    },
    "overall-fitness": {
        name: "Overall Fitness Program",
        description: "Improve general health and wellness",
        weeks: [
            {
                name: "Week 1: Fundamentals",
                description: "Building healthy movement patterns",
                focusAreas: ["Mobility", "Basic Strength", "Light Cardio"]
            },
            {
                name: "Week 2: Building Blocks",
                description: "Developing balanced fitness",
                focusAreas: ["Cardio Endurance", "Functional Strength", "Flexibility"]
            },
            {
                name: "Week 3: Integration",
                description: "Combining different fitness aspects",
                focusAreas: ["Mixed Modality", "Balanced Training", "Core"]
            },
            {
                name: "Week 4: All-Around Fitness",
                description: "Full-spectrum fitness challenge",
                focusAreas: ["Cardio", "Strength", "Mobility", "Balance"]
            }
        ]
    }
};

// Application state
let currentProgram = null;
let currentWeek = 0; // Track the current week
let currentDayPlan = {}; // Store AI-generated workouts by day
let activeTab = 'workout-tab';

// Get current day of the week
function getCurrentDay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    return days[now.getDay()];
}

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Create week selector
function createWeekSelector() {
    const weekSelector = document.getElementById('week-selector');
    if (!weekSelector) return;
    
    weekSelector.innerHTML = '';
    
    // Only proceed if a program is selected
    if (!currentProgram || !currentProgram.weeks) return;
    
    currentProgram.weeks.forEach((week, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = week.name;
        
        if (index === currentWeek) {
            option.selected = true;
        }
        
        weekSelector.appendChild(option);
    });
    
    // Add event listener to week selector
    weekSelector.addEventListener('change', function() {
        currentWeek = parseInt(this.value);
        updateFocusAreas();
        createDayTabs();
        displayWorkoutsForDay(getCurrentDay());
    });
    
    // Update week description initially
    const weekDesc = document.getElementById('week-description');
    if (weekDesc && currentProgram.weeks[currentWeek]) {
        weekDesc.textContent = currentProgram.weeks[currentWeek].description;
    }
}

// Update focus areas info
function updateFocusAreas() {
    // Update focus areas display
    const focusAreas = document.getElementById('focus-areas');
    if (focusAreas && currentProgram && currentProgram.weeks && currentProgram.weeks[currentWeek]) {
        const areas = currentProgram.weeks[currentWeek].focusAreas;
        focusAreas.innerHTML = '';
        
        areas.forEach(area => {
            const badge = document.createElement('span');
            badge.className = 'focus-badge';
            badge.textContent = area;
            focusAreas.appendChild(badge);
        });
    }
    
    // Update week description
    const weekDesc = document.getElementById('week-description');
    if (weekDesc && currentProgram.weeks[currentWeek]) {
        weekDesc.textContent = currentProgram.weeks[currentWeek].description;
    }
}

// Create day tabs for navigation
function createDayTabs() {
    const tabsContainer = document.getElementById('day-tabs');
    tabsContainer.innerHTML = ''; // Clear existing tabs
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const currentDay = getCurrentDay();
    
    days.forEach(day => {
        const tab = document.createElement('button');
        tab.className = 'day-tab';
        tab.textContent = day;
        tab.dataset.day = day;
        
        if (day === currentDay) {
            tab.classList.add('active');
        }
        
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            // Show workouts for selected day
            displayWorkoutsForDay(this.dataset.day);
        });
        
        tabsContainer.appendChild(tab);
    });
}

// Display workouts for selected day
function displayWorkoutsForDay(day) {
    const container = document.getElementById('workouts-container');
    // Clear previous workouts
    container.innerHTML = '';
    
    // Update day heading
    const dayHeading = document.getElementById('selected-day');
    if (dayHeading) {
        dayHeading.textContent = `${day}'s Workout Plan`;
    }
    
    // Check if we already have a generated workout for this day
    const hasGeneratedWorkout = currentDayPlan[day] && currentDayPlan[day].length > 0;
    
    // If no workout exists yet, show the generate prompt
    if (!hasGeneratedWorkout) {
        const generatePrompt = document.createElement('div');
        generatePrompt.className = 'generate-prompt';
        
        generatePrompt.innerHTML = `
            <div class="generate-icon">
                <i class="fas fa-robot"></i>
            </div>
            <h2>Generate Today's Workout</h2>
            <p>No workout has been generated for ${day} yet.</p>
            <p>Let our AI create a personalized workout based on your program and weekly focus.</p>
            <button id="generate-workout-btn" class="generate-button">Generate Workout</button>
        `;
        
        container.appendChild(generatePrompt);
        
        // Add event listener for generate button
        document.getElementById('generate-workout-btn').addEventListener('click', () => {
            generateAIWorkout(day);
        });
    } else {
        // Display existing workouts
        currentDayPlan[day].forEach(workout => {
            displayWorkout(container, workout);
        });
        
        // Add regenerate button
        const regenerateContainer = document.createElement('div');
        regenerateContainer.className = 'regenerate-container';
        regenerateContainer.innerHTML = `
            <button id="regenerate-workout-btn" class="regenerate-button">
                <i class="fas fa-sync-alt"></i> Regenerate Workout
            </button>
        `;
        container.appendChild(regenerateContainer);
        
        // Add event listener for regenerate button
        document.getElementById('regenerate-workout-btn').addEventListener('click', () => {
            generateAIWorkout(day);
        });
    }
}

// Display a single workout
function displayWorkout(container, workout) {
    const card = document.createElement('div');
    card.className = 'workout-card ai-generated';
    
    card.innerHTML = `
        <div class="ai-badge">AI Generated</div>
        <img src="${workout.image}" alt="${workout.name}" class="workout-image">
        <div class="workout-info">
            <h2 class="workout-name">${workout.name}</h2>
            <p class="workout-description">${workout.description}</p>
            <div class="workout-sets-ai">${workout.sets}</div>
            ${workout.youtube ? `<a href="${workout.youtube}" target="_blank" class="tutorial-button">Watch Tutorial</a>` : ''}
        </div>
    `;
    
    container.appendChild(card);
}

// AI Workout Generation
async function generateAIWorkout(day) {
    if (!currentProgram || !currentProgram.weeks) return;
    
    const container = document.getElementById('workouts-container');
    
    // Clear container and show loading state
    container.innerHTML = '';
    const loadingCard = document.createElement('div');
    loadingCard.className = 'workout-card loading-card';
    loadingCard.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>AI is creating your personalized workout for ${day}...</p>
        </div>
    `;
    container.appendChild(loadingCard);
    
    try {
        // Get program info for the API prompt
        const programType = currentProgram.name;
        const weekNumber = currentWeek + 1;
        const focusAreas = currentProgram.weeks[currentWeek].focusAreas;
        
        // Create prompt for Gemini API
        const prompt = `Create a detailed fitness workout for ${day} focused on ${focusAreas.join(', ')}. 
        This is for a ${programType} program, week ${weekNumber} of training.
        Please provide:
        1. A workout name that highlights the focus areas
        2. A brief description of the workout's benefits
        3. A list of 5-7 exercises with specific sets and reps for each
        4. Format each exercise as "X sets of Exercise Name (Y reps or Z seconds)"
        5. Include a warm-up and cool-down
        
        Use exercises appropriate for ${focusAreas.join(' and ')} and adjust intensity for week ${weekNumber}.
        Return the response in JSON format with these keys: name, description, exercises (as an array of strings).`;
        
        // Call Gemini API
        const response = await callGeminiAPI(prompt);
        
        if (!response) {
            throw new Error("Failed to get a response from Gemini API");
        }
        
        // Parse the response - assuming it returns a JSON string
        let workoutData;
        try {
            // First try standard JSON parsing
            workoutData = JSON.parse(response);
        } catch (e) {
            console.error("Error parsing Gemini response:", e);
            // Check for markdown code fences around JSON
            const jsonPattern = /```(?:json)?\s*({[\s\S]*?})\s*```/;
            const match = response.match(jsonPattern);
            
            if (match && match[1]) {
                try {
                    workoutData = JSON.parse(match[1]);
                    console.log("Successfully extracted JSON from markdown code block");
                } catch (e2) {
                    console.error("Error parsing extracted JSON:", e2);
                    // Try to extract any JSON object
                    const jsonObjectPattern = /{[\s\S]*?}/;
                    const objectMatch = response.match(jsonObjectPattern);
                    if (objectMatch) {
                        try {
                            workoutData = JSON.parse(objectMatch[0]);
                            console.log("Successfully extracted JSON from response");
                        } catch (e3) {
                            console.error("Failed to parse any JSON from response:", e3);
                            throw new Error("Could not parse workout data from API response");
                        }
                    } else {
                        throw new Error("API response is not in expected format");
                    }
                }
            } else {
                // No code blocks, try to find any JSON object in the text
                const jsonObjectPattern = /{[\s\S]*?}/;
                const objectMatch = response.match(jsonObjectPattern);
                if (objectMatch) {
                    try {
                        workoutData = JSON.parse(objectMatch[0]);
                        console.log("Successfully extracted JSON from response");
                    } catch (e4) {
                        console.error("Failed to parse any JSON from response:", e4);
                        throw new Error("Could not parse workout data from API response");
                    }
                } else {
                    // If we can't get proper JSON, create a simple object with the text response
                    console.log("Creating fallback object from text response");
                    workoutData = {
                        name: null,
                        description: null,
                        exercises: response.split('\n').filter(line => line.trim().length > 0)
                    };
                }
            }
        }
        
        // Create a workout object from the API response
        const selectedFocusArea = focusAreas[0]; // Use first focus area for image/video
        const workout = {
            name: workoutData.name || `${selectedFocusArea} Workout`,
            image: getWorkoutImage(selectedFocusArea),
            description: workoutData.description || `Custom ${programType.toLowerCase()} focusing on ${focusAreas.join(', ').toLowerCase()}, tailored for Week ${weekNumber}.`,
            sets: workoutData.exercises ? workoutData.exercises.map(ex => `<div class="ai-exercise">• ${ex}</div>`).join('') : generateWorkoutSets(programType, weekNumber, focusAreas),
            youtube: getRandomYoutubeLink(selectedFocusArea)
        };
        
        // Save the generated workout
        if (!currentDayPlan[day]) {
            currentDayPlan[day] = [];
        }
        
        // Replace existing workout or add new one
        currentDayPlan[day] = [workout];
        
        // Clear the container and display the workout
        container.innerHTML = '';
        displayWorkout(container, workout);
        
        // Add regenerate button
        const regenerateContainer = document.createElement('div');
        regenerateContainer.className = 'regenerate-container';
        regenerateContainer.innerHTML = `
            <button id="regenerate-workout-btn" class="regenerate-button">
                <i class="fas fa-sync-alt"></i> Regenerate Workout
            </button>
        `;
        container.appendChild(regenerateContainer);
        
        // Add event listener for regenerate button
        document.getElementById('regenerate-workout-btn').addEventListener('click', () => {
            generateAIWorkout(day);
        });
    } catch (error) {
        console.error("Error generating workout:", error);
        
        // Show error to user
        container.innerHTML = '';
        const errorCard = document.createElement('div');
        errorCard.className = 'workout-card error-card';
        errorCard.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Oops! Something went wrong</h3>
                <p>We couldn't generate your workout. Please check your API key or try again later.</p>
                <button id="retry-workout-btn" class="retry-button">Try Again</button>
            </div>
        `;
        container.appendChild(errorCard);
        
        // Add event listener for retry button
        document.getElementById('retry-workout-btn').addEventListener('click', () => {
            generateAIWorkout(day);
        });
    }
}

// Get a relevant image based on focus area
function getWorkoutImage(focusArea) {
    const imageMap = {
        'Cardio': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Core': 'https://images.unsplash.com/photo-1616803689943-5601631c7fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Full Body': 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'HIIT': 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Lower Body': 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Upper Body': 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Push': 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Pull': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Legs': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Mobility': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Strength': 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Balance': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Flexibility': 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Circuit Training': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'High Intensity': 'https://images.unsplash.com/photo-1594882645126-14020914d58d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
    
    return imageMap[focusArea] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
}

// Get a random YouTube tutorial link
function getRandomYoutubeLink(focusArea) {
    const youtubeMap = {
        'Cardio': 'https://www.youtube.com/watch?v=UpH7rm0cYbM',
        'Core': 'https://www.youtube.com/watch?v=qAZ65V7hY54',
        'Full Body': 'https://www.youtube.com/watch?v=J81dtLIQ2OI',
        'HIIT': 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
        'Lower Body': 'https://www.youtube.com/watch?v=RjexvOAsVtI',
        'Upper Body': 'https://www.youtube.com/watch?v=gRVjAtPip0Y',
        'Push': 'https://www.youtube.com/watch?v=IODxDxX7oi4',
        'Pull': 'https://www.youtube.com/watch?v=vT2GjY_Umpw',
        'Legs': 'https://www.youtube.com/watch?v=X0qC1k0Zi6w',
        'Mobility': 'https://www.youtube.com/watch?v=jeNwE4VXqgs',
        'Strength': 'https://www.youtube.com/watch?v=R6gZoAzAhCg',
        'Balance': 'https://www.youtube.com/watch?v=GXJfGyD4APE',
        'Flexibility': 'https://www.youtube.com/watch?v=qULTwquOuT4',
        'Circuit Training': 'https://www.youtube.com/watch?v=9p7-YC91Q74',
        'High Intensity': 'https://www.youtube.com/watch?v=TU8QYVW0gDU'
    };
    
    return youtubeMap[focusArea] || 'https://www.youtube.com/watch?v=ml6cT4AZdqI';
}

// Generate workout sets based on program type, week, and focus areas
// This is a fallback function in case the API call fails
function generateWorkoutSets(programType, weekNumber, focusAreas) {
    console.log("Using fallback workout generation");
    let exercises = [];
    let intensity = Math.min(weekNumber * 0.25 + 0.5, 1); // Intensity increases with weeks
    
    // Exercise pools by focus area
    const exercisePools = {
        'Cardio': [
            'Jumping Jacks',
            'High Knees',
            'Mountain Climbers',
            'Butt Kicks',
            'Skipping',
            'Lateral Shuffles',
            'Jumping Rope',
            'Box Jumps'
        ],
        'Core': [
            'Plank',
            'Russian Twists',
            'Bicycle Crunches',
            'Dead Bugs',
            'Leg Raises',
            'Side Planks',
            'V-Ups',
            'Hollow Body Hold'
        ],
        'Full Body': [
            'Burpees',
            'Squat Jumps',
            'Push-up to Squat',
            'Plank Jacks',
            'Thrusters',
            'Bear Crawls',
            'Mountain Climbers',
            'Star Jumps'
        ],
        'HIIT': [
            'Burpees',
            'Jump Squats',
            'Mountain Climbers',
            'High Knees',
            'Plank Jacks',
            'Speed Skaters',
            'Tuck Jumps',
            'Jumping Lunges'
        ],
        'Lower Body': [
            'Squats',
            'Lunges',
            'Glute Bridges',
            'Calf Raises',
            'Step-ups',
            'Curtsy Lunges',
            'Donkey Kicks',
            'Wall Sits'
        ],
        'Upper Body': [
            'Push-ups',
            'Tricep Dips',
            'Diamond Push-ups',
            'Pike Push-ups',
            'Arm Circles',
            'Plank Shoulder Taps',
            'Inchworms',
            'Wall Push-ups'
        ],
        'Push': [
            'Push-ups',
            'Shoulder Presses',
            'Tricep Dips',
            'Close Grip Push-ups',
            'Pike Push-ups',
            'Incline Push-ups',
            'Diamond Push-ups',
            'Decline Push-ups'
        ],
        'Pull': [
            'Body Rows',
            'Doorway Rows',
            'Towel Rows',
            'Isometric Back Hold',
            'Reverse Snow Angels',
            'Band Pull-aparts',
            'Superman',
            'Chair Inverted Rows'
        ],
        'Legs': [
            'Squats',
            'Lunges',
            'Step-ups',
            'Calf Raises',
            'Glute Bridges',
            'Side Lunges',
            'Pistol Squats',
            'Wall Sits'
        ]
    };
    
    // Get 5-7 exercises based on focus areas
    const numExercises = Math.floor(Math.random() * 3) + 5; // 5-7 exercises
    const selectedExercises = [];
    
    // Add exercises from each focus area
    for (const area of focusAreas) {
        if (exercisePools[area]) {
            // Add 2-3 exercises from each focus area
            const areaExercises = exercisePools[area] || [];
            const numAreaExercises = Math.min(Math.floor(numExercises / focusAreas.length) + 1, areaExercises.length);
            
            for (let i = 0; i < numAreaExercises; i++) {
                if (selectedExercises.length >= numExercises) break;
                
                // Get random exercise that hasn't been selected yet
                let attempts = 0;
                let exercise;
                
                do {
                    const randomIndex = Math.floor(Math.random() * areaExercises.length);
                    exercise = areaExercises[randomIndex];
                    attempts++;
                } while (selectedExercises.includes(exercise) && attempts < 10);
                
                if (!selectedExercises.includes(exercise)) {
                    selectedExercises.push(exercise);
                }
            }
        }
    }
    
    // Fill remaining spots with random exercises
    while (selectedExercises.length < numExercises) {
        const randomAreaIndex = Math.floor(Math.random() * focusAreas.length);
        const randomArea = focusAreas[randomAreaIndex];
        const areaExercises = exercisePools[randomArea] || [];
        
        if (areaExercises.length > 0) {
            const randomExerciseIndex = Math.floor(Math.random() * areaExercises.length);
            const exercise = areaExercises[randomExerciseIndex];
            
            if (!selectedExercises.includes(exercise)) {
                selectedExercises.push(exercise);
            }
        }
    }
    
    // Format exercises with sets and reps
    for (const exercise of selectedExercises) {
        let sets, reps, time;
        
        // Determine if it's a timed exercise
        const isTimedExercise = exercise.includes('Plank') || 
                               exercise.includes('Hold') || 
                               exercise.includes('Wall Sit') || 
                               exercise.includes('Circle');
        
        if (programType.includes('Weight Loss')) {
            sets = Math.floor(Math.random() * 2) + 3; // 3-4 sets
            if (isTimedExercise) {
                time = Math.floor((20 + 20 * intensity) / 5) * 5; // 20-40 seconds in increments of 5
                exercises.push(`${sets} sets of ${exercise} (${time} seconds)`);
            } else {
                reps = Math.floor((10 + 10 * intensity) / 2) * 2; // 10-20 reps in increments of 2
                exercises.push(`${sets} sets of ${exercise} (${reps} reps)`);
            }
        } 
        else if (programType.includes('Muscle Gain')) {
            sets = Math.floor(Math.random() * 2) + 3; // 3-4 sets
            if (isTimedExercise) {
                time = Math.floor((30 + 30 * intensity) / 5) * 5; // 30-60 seconds in increments of 5
                exercises.push(`${sets} sets of ${exercise} (${time} seconds)`);
            } else {
                reps = Math.floor((8 + 8 * intensity) / 2) * 2; // 8-16 reps in increments of 2
                exercises.push(`${sets} sets of ${exercise} (${reps} reps)`);
            }
        }
        else { // Overall Fitness
            sets = Math.floor(Math.random() * 2) + 2; // 2-3 sets
            if (isTimedExercise) {
                time = Math.floor((20 + 25 * intensity) / 5) * 5; // 20-45 seconds in increments of 5
                exercises.push(`${sets} sets of ${exercise} (${time} seconds)`);
            } else {
                reps = Math.floor((10 + 5 * intensity) / 2) * 2; // 10-15 reps in increments of 2
                exercises.push(`${sets} sets of ${exercise} (${reps} reps)`);
            }
        }
    }
    
    // Add warm-up and cool-down
    exercises.unshift(`Warm-up: ${Math.floor(5 + 3 * intensity)} minutes of light cardio and dynamic stretching`);
    exercises.push(`Cool-down: ${Math.floor(3 + 2 * intensity)} minutes of stretching`);
    
    return exercises.map(ex => `<div class="ai-exercise">• ${ex}</div>`).join('');
}

// Initialize program selection
function initProgramSelection() {
    const programCards = document.querySelectorAll('.program-card');
    const startButton = document.getElementById('get-started-btn');
    const appIntro = document.getElementById('app-intro');
    const programSelector = document.getElementById('program-selector');
    const appContainer = document.getElementById('app-container');
    
    // Show program selection when "Get Started" is clicked
    if (startButton) {
        startButton.addEventListener('click', function() {
            appIntro.style.display = 'none';
            programSelector.style.display = 'block';
            
            // Scroll to top of program selector for better mobile experience
            window.scrollTo(0, 0);
        });
    }
    
    // Handle program selection
    programCards.forEach(card => {
        card.addEventListener('click', function() {
            const programType = this.dataset.program;
            selectProgram(programType);
            
            // Hide program selector and show main app
            programSelector.style.display = 'none';
            appContainer.style.display = 'block';
            
            // Scroll to top for better mobile experience
            window.scrollTo(0, 0);
        });
    });
}

// Select a program
function selectProgram(programType) {
    currentProgram = programs[programType];
    currentWeek = 0; // Start at week 1
    currentDayPlan = {}; // Reset workout plan
    
    // Set up the workout section
    createWeekSelector();
    updateFocusAreas();
    createDayTabs();
    displayWorkoutsForDay(getCurrentDay());
}

// Setup tab navigation
function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab
            navItems.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            activeTab = tabId;
        });
    });
}

// Setup meal plan tab
function setupMealPlan() {
    const mealDays = document.querySelectorAll('.meal-day');
    
    mealDays.forEach(day => {
        day.addEventListener('click', function() {
            mealDays.forEach(d => d.classList.remove('active'));
            this.classList.add('active');
            
            // We would load different meals here in a real app
            // For now, we'll just keep the demo meals
        });
    });
    
    // Setup recipe view button functionality
    const recipeButtons = document.querySelectorAll('.view-recipe-btn');
    recipeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Recipe details would appear in a modal in the full app.');
        });
    });
    
    // Setup grocery list button
    const groceryButton = document.querySelector('.grocery-list-btn');
    if (groceryButton) {
        groceryButton.addEventListener('click', function() {
            alert('A printable grocery list would be generated in the full app.');
        });
    }
}

// Setup habit tracking
function setupHabits() {
    const addHabitButton = document.querySelector('.add-habit-button');
    if (addHabitButton) {
        addHabitButton.addEventListener('click', function() {
            alert('A form to add a new habit would appear in the full app.');
        });
    }
}

// Setup theme toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved theme preference or respect OS preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }
    
    // Toggle theme when checkbox is clicked
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Setup proper navigation flows for mobile
function setupNavigationFlows() {
    // Set up back button in program selector
    const backToIntro = document.getElementById('back-to-intro');
    if (backToIntro) {
        backToIntro.addEventListener('click', function() {
            document.getElementById('program-selector').style.display = 'none';
            document.getElementById('app-intro').style.display = 'flex';
        });
    }
    
    // Set up logout/restart button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Reset the app state
            currentProgram = null;
            currentWeek = 0;
            currentDayPlan = {};
            
            // Hide app container and show intro
            document.getElementById('app-container').style.display = 'none';
            document.getElementById('app-intro').style.display = 'flex';
        });
    }
}

// Initialize app
function init() {
    displayCurrentDate();
    
    // For demo purposes, if someone directly loads the app without selecting a program
    if (!currentProgram) {
        currentProgram = programs['overall-fitness'];
        currentDayPlan = currentProgram.weeks.reduce((acc, week) => ({
            ...acc,
            ...week.focusAreas.map(area => ({
                [area]: []
            }))
        }), {});
    }
    
    initProgramSelection();
    setupTabs();
    setupMealPlan();
    setupHabits();
    setupThemeToggle();
    setupNavigationFlows();
    
    // Check if app should start at intro or show content directly (for demo)
    const queryParams = new URLSearchParams(window.location.search);
    const skipIntro = queryParams.get('skip_intro');
    
    if (skipIntro === 'true') {
        document.getElementById('app-intro').style.display = 'none';
        document.getElementById('program-selector').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        
        createDayTabs();
        displayWorkoutsForDay(getCurrentDay());
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', init); 