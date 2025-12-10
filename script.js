/**
 * ============================================
 * STUDY TRACKER - JAVASCRIPT FUNCTIONALITY
 * Handles toggle states, localStorage, and UI updates
 * ============================================
 */

// ==================== CONFIGURATION ====================

/**
 * List of all course identifiers
 * Used for initialization and iteration
 */
const COURSES = [
    // Second Year Courses
    'discrete-math',
    'electrical-circuits',
    'calculus-3',
    'advanced-programming-1',
    'statistics-probability',
    // Carry Courses (First Year)
    'linear-algebra',
    'electrical-physics',
    'programming-1',
    'computer-principles',
    // English Course
    'english-3'
];

/**
 * LocalStorage key for saving all progress data
 */
const STORAGE_KEY = 'studyTrackerProgress';

/**
 * Number of squares per type (lectures/sessions)
 */
const SQUARES_PER_TYPE = 10;

// ==================== DATA MANAGEMENT ====================

/**
 * Initialize or retrieve progress data from localStorage
 * Creates default empty state if no data exists
 * @returns {Object} Progress data object
 */
function getProgressData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            return JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Error reading from localStorage:', error);
    }
    
    // Return default empty structure if no saved data
    return createDefaultData();
}

/**
 * Creates default empty progress data structure
 * @returns {Object} Default progress data
 */
function createDefaultData() {
    const data = {};
    
    COURSES.forEach(course => {
        data[course] = {
            lectures: Array(SQUARES_PER_TYPE).fill(false),
            sessions: Array(SQUARES_PER_TYPE).fill(false)
        };
    });
    
    return data;
}

/**
 * Save progress data to localStorage
 * @param {Object} data - Progress data to save
 */
function saveProgressData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        // Alert user if storage fails
        alert('تعذر حفظ التقدم. قد تكون مساحة التخزين ممتلئة.');
    }
}

// ==================== UI UPDATES ====================

/**
 * Update the progress bar and percentage for a specific course
 * @param {string} courseId - Course identifier
 */
function updateCourseProgress(courseId) {
    const data = getProgressData();
    const courseData = data[courseId];
    
    if (!courseData) return;
    
    // Calculate completed count
    const lecturesCompleted = courseData.lectures.filter(Boolean).length;
    const sessionsCompleted = courseData.sessions.filter(Boolean).length;
    const totalCompleted = lecturesCompleted + sessionsCompleted;
    const totalSquares = SQUARES_PER_TYPE * 2; // 10 lectures + 10 sessions
    
    // Calculate percentage
    const percentage = Math.round((totalCompleted / totalSquares) * 100);
    
    // Update progress bar
    const progressFill = document.querySelector(`.progress-fill[data-course="${courseId}"]`);
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    // Update percentage text
    const progressText = document.querySelector(`.progress-text[data-course="${courseId}"]`);
    if (progressText) {
        progressText.textContent = `${percentage}%`;
    }
}

/**
 * Update global statistics in the header
 */
function updateGlobalStats() {
    const data = getProgressData();
    let totalCompleted = 0;
    const totalSquares = COURSES.length * SQUARES_PER_TYPE * 2; // All courses, both types
    
    // Count all completed squares
    COURSES.forEach(course => {
        if (data[course]) {
            totalCompleted += data[course].lectures.filter(Boolean).length;
            totalCompleted += data[course].sessions.filter(Boolean).length;
        }
    });
    
    const totalRemaining = totalSquares - totalCompleted;
    const percentage = Math.round((totalCompleted / totalSquares) * 100);
    
    // Update DOM elements
    const completedEl = document.getElementById('totalCompleted');
    const remainingEl = document.getElementById('totalRemaining');
    const percentageEl = document.getElementById('totalPercentage');
    
    if (completedEl) completedEl.textContent = totalCompleted;
    if (remainingEl) remainingEl.textContent = totalRemaining;
    if (percentageEl) percentageEl.textContent = `${percentage}%`;
}

/**
 * Apply saved state to all squares in the UI
 * Called on page load
 */
function applySavedState() {
    const data = getProgressData();
    
    COURSES.forEach(course => {
        const courseData = data[course];
        if (!courseData) return;
        
        // Apply lectures state
        const lecturesContainer = document.querySelector(
            `.squares-container[data-course="${course}"][data-type="lectures"]`
        );
        if (lecturesContainer) {
            applySquaresState(lecturesContainer, courseData.lectures);
        }
        
        // Apply sessions state
        const sessionsContainer = document.querySelector(
            `.squares-container[data-course="${course}"][data-type="sessions"]`
        );
        if (sessionsContainer) {
            applySquaresState(sessionsContainer, courseData.sessions);
        }
        
        // Update progress bar
        updateCourseProgress(course);
    });
    
    // Update global stats
    updateGlobalStats();
}

/**
 * Apply state to squares within a container
 * @param {HTMLElement} container - Squares container element
 * @param {Array} stateArray - Array of boolean states
 */
function applySquaresState(container, stateArray) {
    const squares = container.querySelectorAll('.square');
    
    squares.forEach((square, index) => {
        if (stateArray[index]) {
            square.classList.add('completed');
        } else {
            square.classList.remove('completed');
        }
    });
}

// ==================== EVENT HANDLERS ====================

/**
 * Handle square click - toggle completion state
 * @param {Event} event - Click event
 */
function handleSquareClick(event) {
    const square = event.target.closest('.square');
    if (!square) return;
    
    const container = square.closest('.squares-container');
    if (!container) return;
    
    const courseId = container.dataset.course;
    const type = container.dataset.type;
    const index = parseInt(square.dataset.index, 10);
    
    // Toggle visual state
    square.classList.toggle('completed');
    
    // Update data
    const data = getProgressData();
    
    if (!data[courseId]) {
        data[courseId] = createDefaultData()[courseId];
    }
    
    // Toggle the state in data
    data[courseId][type][index] = !data[courseId][type][index];
    
    // Save to localStorage
    saveProgressData(data);
    
    // Update UI
    updateCourseProgress(courseId);
    updateGlobalStats();
    
    // Add subtle haptic feedback effect
    addClickFeedback(square);
}

/**
 * Add visual feedback on click
 * @param {HTMLElement} square - Clicked square element
 */
function addClickFeedback(square) {
    // Create ripple effect
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: ripple 0.4s ease-out forwards;
        pointer-events: none;
    `;
    
    square.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
    }, 400);
}

/**
 * Handle reset button click - reset course progress
 * @param {Event} event - Click event
 */
function handleResetClick(event) {
    const button = event.target.closest('.reset-btn');
    if (!button) return;
    
    const courseId = button.dataset.course;
    
    // Confirm reset
    const confirmed = confirm('هل أنت متأكد من إعادة تعيين تقدم هذه المادة؟');
    if (!confirmed) return;
    
    // Reset data for this course
    const data = getProgressData();
    data[courseId] = {
        lectures: Array(SQUARES_PER_TYPE).fill(false),
        sessions: Array(SQUARES_PER_TYPE).fill(false)
    };
    
    // Save to localStorage
    saveProgressData(data);
    
    // Reset UI
    const card = document.querySelector(`.course-card[data-course="${courseId}"]`);
    if (card) {
        const squares = card.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('completed');
        });
    }
    
    // Update progress
    updateCourseProgress(courseId);
    updateGlobalStats();
    
    // Add visual feedback
    button.style.transform = 'rotate(-360deg)';
    setTimeout(() => {
        button.style.transform = '';
    }, 300);
}

// ==================== KEYBOARD NAVIGATION ====================

/**
 * Handle keyboard navigation for accessibility
 * @param {Event} event - Keydown event
 */
function handleKeyDown(event) {
    const target = event.target;
    
    // Handle Enter or Space on squares
    if (target.classList.contains('square')) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            target.click();
        }
    }
    
    // Handle Enter or Space on reset buttons
    if (target.classList.contains('reset-btn')) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            target.click();
        }
    }
}

// ==================== INITIALIZATION ====================

/**
 * Add ripple animation style to document
 */
function addRippleStyle() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Make squares focusable for keyboard navigation
 */
function makeSquaresFocusable() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.setAttribute('tabindex', '0');
        square.setAttribute('role', 'checkbox');
        square.setAttribute('aria-checked', square.classList.contains('completed'));
    });
}

/**
 * Update aria-checked attributes when squares change
 */
function updateAriaStates() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.setAttribute('aria-checked', square.classList.contains('completed'));
    });
}

/**
 * Initialize the application
 * Set up event listeners and load saved data
 */
function initializeApp() {
    console.log('🚀 Study Tracker initializing...');
    
    // Add ripple animation style
    addRippleStyle();
    
    // Load and apply saved state
    applySavedState();
    
    // Make squares focusable
    makeSquaresFocusable();
    
    // Event delegation for squares
    document.addEventListener('click', (event) => {
        if (event.target.closest('.square')) {
            handleSquareClick(event);
            // Update ARIA state after click
            const square = event.target.closest('.square');
            if (square) {
                square.setAttribute('aria-checked', square.classList.contains('completed'));
            }
        }
    });
    
    // Event delegation for reset buttons
    document.addEventListener('click', (event) => {
        if (event.target.closest('.reset-btn')) {
            handleResetClick(event);
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyDown);
    
    console.log('✅ Study Tracker initialized successfully!');
    console.log(`📚 Tracking ${COURSES.length} courses`);
}

// ==================== START APPLICATION ====================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM already loaded
    initializeApp();
}

// ==================== OPTIONAL: EXPORT DATA ====================

/**
 * Export progress data as JSON (for debugging/backup)
 * Can be called from browser console
 */
window.exportProgress = function() {
    const data = getProgressData();
    const dataStr = JSON.stringify(data, null, 2);
    console.log('Progress Data:', dataStr);
    
    // Create downloadable file
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-progress-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return 'تم تصدير البيانات بنجاح!';
};

/**
 * Import progress data from JSON string
 * Can be called from browser console
 * @param {string} jsonString - JSON data to import
 */
window.importProgress = function(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        saveProgressData(data);
        applySavedState();
        return 'تم استيراد البيانات بنجاح!';
    } catch (error) {
        console.error('Error importing data:', error);
        return 'خطأ في استيراد البيانات';
    }
};

/**
 * Reset all progress (use with caution)
 * Can be called from browser console
 */
window.resetAllProgress = function() {
    if (confirm('هل أنت متأكد من حذف كل التقدم؟ لا يمكن التراجع عن هذا الإجراء.')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
        return 'تم إعادة تعيين كل التقدم';
    }
    return 'تم الإلغاء';
};
