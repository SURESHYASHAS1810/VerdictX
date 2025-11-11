// Script to check localStorage contents
const fs = require('fs');

// Function to read localStorage data from Chrome
function readLocalStorage() {
    try {
        // Get user's home directory
        const homeDir = process.env.USERPROFILE || process.env.HOME;
        
        // Log the contents
        console.log('Local Storage Data:');
        
        // Since localStorage is browser-based, we'll provide instructions
        console.log(`
To view your localStorage data:

1. In your React app, add this temporary code to App.js:

    // Add this inside your App component, temporarily
    useEffect(() => {
        // Display all localStorage keys
        console.log('All localStorage keys:', Object.keys(localStorage));
        
        // Display user data
        console.log('User data:', localStorage.getItem('user'));
        
        // Display current chat ID
        console.log('Current chat ID:', localStorage.getItem('currentChatId'));
        
        // Display all chats (if any user is logged in)
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.id) {
            console.log('Chats:', localStorage.getItem(\`chats_\${user.id}\`));
        }
    }, []);

2. Then open your browser's console (F12) to see the data

3. Remember to remove this temporary code after checking!
`);
    } catch (error) {
        console.error('Error reading localStorage:', error);
    }
}

// Run the function
readLocalStorage();