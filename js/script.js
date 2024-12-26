const labs = document.getElementById('labs');
const teachers = document.getElementById('teach');
const fingerprint = document.getElementById('finger');
const face = document.getElementById('face');

const pages = {
    labs: 'labs/labs.html',
    teachers: 'Teachers/IT.html',
    fingerprint: 'fingerprint/fingerprint.html',
    face: 'face/face.html'  // Added missing page
};

async function loadPage(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        document.getElementById('content').innerHTML = html;
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('content').innerHTML = `
            <div class="error-message">
                <h2>Error loading page</h2>
                <p>Please try again. Error: ${error.message}</p>
            </div>`;
    }
}

// Fixed event listeners without spaces
labs.addEventListener('click', () => loadPage(pages.labs));
fingerprint.addEventListener('click', () => loadPage(pages.fingerprint));
teachers.addEventListener('click', () => loadPage(pages.teachers));
face.addEventListener('click', () => loadPage(pages.face));

// Add error handling for missing elements
document.addEventListener('DOMContentLoaded', () => {
    const navElements = { labs, teachers, fingerprint, face };
    for (const [key, element] of Object.entries(navElements)) {
        if (!element) {
            console.error(`Navigation element '${key}' not found in the DOM`);
        }
    }
});