function initializeStatsPage(solvesData) {
    // Calculate target progress
    function calculateTargetProgress() {
        const solves = solvesData || [];
        if (!solves.length) return;
        
        const validTimes = solves.filter(s => !s.dnf).map(s => s.plus2 ? s.time + 2 : s.time);
        
        const sub10 = validTimes.filter(t => t < 10).length;
        const sub15 = validTimes.filter(t => t < 15).length;
        const sub20 = validTimes.filter(t => t < 20).length;
        
        const total = validTimes.length;
        if (total === 0) return;
        
        updateProgress('sub10', (sub10 / total) * 100);
        updateProgress('sub15', (sub15 / total) * 100);
        updateProgress('sub20', (sub20 / total) * 100);
    }
    
    function updateProgress(className, percentage) {
        const progressFill = document.querySelector(`.progress-fill.${className}`);
        if (!progressFill) return;
        
        const progressText = progressFill.parentElement.nextElementSibling;
        
        progressFill.style.width = `${percentage}%`;
        if (progressText) {
            progressText.textContent = `${percentage.toFixed(1)}%`;
        }
    }
    
    // Initialize on page load
    calculateTargetProgress();
}

function deleteSolve(index) {
    if (confirm('Are you sure you want to delete this solve?')) {
        fetch(`/api/delete_solve/${index}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        })
        .catch(error => {
            console.error('Error deleting solve:', error);
            alert('Failed to delete solve. Please try again.');
        });
    }
}
