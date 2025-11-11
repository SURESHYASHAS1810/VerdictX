// Test script for FastAPI integration
const testFastAPI = async () => {
    try {
        // 1. Test Available Fields
        console.log('Testing /available-fields endpoint...');
        const fields = await APIService.getAvailableFields();
        console.log('Available fields:', fields);

        // 2. Test PDF Upload (you can test this through the UI)
        console.log('\nTo test PDF extraction:');
        console.log('1. Click the attachment button in the chat');
        console.log('2. Upload a PDF file');
        console.log('3. The extracted data will appear in the chat');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
};

// Run test when component mounts
useEffect(() => {
    testFastAPI();
}, []);