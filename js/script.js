const labs = document.getElementById('labs');
const teachers = document.getElementById('teach');
const fingerprint = document.getElementById('finger');
const face = document.getElementById('face');

const pages = {
    labs: 'labs/labs.html',
    teachers: 'Teachers/IT.html',
    fingerprint: 'fingerprint/fingerprint.html'
};
async function loadPage(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        document.getElementById('content').innerHTML = html;
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('content').innerHTML = '<h2>Error loading page. Please try again.</h2>';
    }
}

labs .addEventListener('click', (e) => loadPage(pages.labs));
fingerprint .addEventListener('click', (e) => loadPage(pages.fingerprint));
teachers .addEventListener('click', (e) => loadPage(pages.teachers));
