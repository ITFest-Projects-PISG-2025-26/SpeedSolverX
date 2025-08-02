function initializeStatsPage(solvesData) {
    // Initialize the times chart
    initializeTimesChart(solvesData);
    
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
    
    // Set up event delegation for delete buttons and bulk actions
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-solve-btn')) {
            const button = e.target.closest('.delete-solve-btn');
            const index = button.getAttribute('data-solve-index');
            deleteSolve(parseInt(index));
        }
    });

    // Set up bulk action button event listeners
    const selectAllBtn = document.getElementById('select-all-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');

    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllSolves);
    }
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedSolves);
    }
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', deleteAllSolves);
    }

    // Update delete selected button when checkboxes change
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('solve-checkbox')) {
            updateBulkActionButtons();
        }
    });
    
    // Initialize on page load
    calculateTargetProgress();
    updateBulkActionButtons();
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

function initializeTimesChart(solvesData) {
    const ctx = document.getElementById('timesChart');
    if (!ctx || !solvesData || solvesData.length === 0) {
        return;
    }

    // Prepare data for the chart
    const chartData = solvesData.map((solve, index) => {
        let time = solve.time;
        if (solve.dnf) {
            return null; // DNF times will be gaps in the chart
        }
        if (solve.plus2) {
            time += 2;
        }
        return {
            x: index + 1,
            y: time
        };
    }).filter(point => point !== null);

    // Calculate rolling averages for trend lines
    const ao5Data = [];
    const ao12Data = [];
    
    for (let i = 4; i < chartData.length; i++) {
        const last5 = chartData.slice(i - 4, i + 1).map(p => p.y).sort((a, b) => a - b);
        if (last5.length === 5) {
            // Remove best and worst for Ao5
            const ao5 = last5.slice(1, 4).reduce((sum, time) => sum + time, 0) / 3;
            ao5Data.push({ x: chartData[i].x, y: ao5 });
        }
    }
    
    for (let i = 11; i < chartData.length; i++) {
        const last12 = chartData.slice(i - 11, i + 1).map(p => p.y).sort((a, b) => a - b);
        if (last12.length === 12) {
            // Remove best and worst for Ao12
            const ao12 = last12.slice(1, 11).reduce((sum, time) => sum + time, 0) / 10;
            ao12Data.push({ x: chartData[i].x, y: ao12 });
        }
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Solve Times',
                    data: chartData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'Ao5 (Average of 5)',
                    data: ao5Data,
                    borderColor: '#e74c3c',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 3
                },
                {
                    label: 'Ao12 (Average of 12)',
                    data: ao12Data,
                    borderColor: '#9b59b6',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Solve Times Progress',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const time = context.parsed.y;
                            return `${context.dataset.label}: ${time.toFixed(3)}s`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Solve Number'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Time (seconds)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}

// Bulk action functions
function selectAllSolves() {
    const checkboxes = document.querySelectorAll('.solve-checkbox');
    const selectAllBtn = document.getElementById('select-all-btn');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
    
    selectAllBtn.textContent = allChecked ? 'Select All' : 'Deselect All';
    updateBulkActionButtons();
}

function deleteSelectedSolves() {
    const selectedCheckboxes = document.querySelectorAll('.solve-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('Please select solves to delete.');
        return;
    }
    
    const selectedIndices = Array.from(selectedCheckboxes).map(cb => 
        parseInt(cb.getAttribute('data-solve-index'))
    );
    
    if (confirm(`Are you sure you want to delete ${selectedIndices.length} selected solve(s)?`)) {
        fetch('/api/delete_selected', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ indices: selectedIndices })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Failed to delete selected solves. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error deleting selected solves:', error);
            alert('Failed to delete selected solves. Please try again.');
        });
    }
}

function deleteAllSolves() {
    if (confirm('Are you sure you want to delete ALL solve history? This action cannot be undone.')) {
        if (confirm('This will permanently delete ALL your solve data. Are you absolutely sure?')) {
            fetch('/api/delete_all', {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Failed to delete all solves. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error deleting all solves:', error);
                alert('Failed to delete all solves. Please try again.');
            });
        }
    }
}

function updateBulkActionButtons() {
    const checkboxes = document.querySelectorAll('.solve-checkbox');
    const selectedCheckboxes = document.querySelectorAll('.solve-checkbox:checked');
    const selectAllBtn = document.getElementById('select-all-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    
    if (selectAllBtn) {
        selectAllBtn.textContent = selectedCheckboxes.length === checkboxes.length ? 'Deselect All' : 'Select All';
    }
    
    if (deleteSelectedBtn) {
        deleteSelectedBtn.disabled = selectedCheckboxes.length === 0;
        deleteSelectedBtn.textContent = `Delete Selected (${selectedCheckboxes.length})`;
    }
}
