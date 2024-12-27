function downloadResource(resourceId) {
    // Validate resource ID
    if (!resourceId) {
        console.error('Invalid resource ID');
        return;
    }

    // Add loading state
    const button = event.currentTarget;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    button.disabled = true;

    // Simulate download (replace with actual download logic)
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        alert('Download started for: ' + resourceId);
    }, 1000);
}

// Add error handling for failed resource loads
document.addEventListener('error', function(e) {
    if (e.target.tagName.toLowerCase() === 'link' || e.target.tagName.toLowerCase() === 'script') {
        console.error('Failed to load resource:', e.target.src || e.target.href);
    }
}, true);