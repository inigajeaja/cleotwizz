document.addEventListener('DOMContentLoaded', function() {
    // Load stats on page load
    loadStats();
    
    // Set up form submission
    const form = document.getElementById('shortenForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const originalUrl = document.getElementById('originalUrl').value;
        const customSlug = document.getElementById('customSlug').value;
        
        try {
            const response = await fetch('/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    originalUrl,
                    customSlug
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                const resultDiv = document.getElementById('result');
                const shortLinkInput = document.getElementById('shortLink');
                
                resultDiv.classList.remove('hidden');
                shortLinkInput.value = window.location.origin + '/' + data.slug;
                
                // Reload stats to update the UI
                loadStats();
            } else {
                alert(data.error || 'Failed to create shortlink');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the shortlink');
        }
    });
});

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (response.ok) {
            // Update counters
            document.getElementById('totalVisitors').textContent = data.totalVisitors;
            document.getElementById('humanVisitors').textContent = data.humanVisitors;
            document.getElementById('botVisitors').textContent = data.botVisitors;
            
            // Update recent activity table
            const activityTable = document.getElementById('recentActivity');
            activityTable.innerHTML = '';
            
            data.recentActivity.forEach(activity => {
                const row = document.createElement('tr');
                
                const timeCell = document.createElement('td');
                timeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                timeCell.textContent = new Date(activity.timestamp).toLocaleString();
                
                const ipCell = document.createElement('td');
                ipCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                ipCell.textContent = activity.ip;
                
                const countryCell = document.createElement('td');
                countryCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                countryCell.innerHTML = activity.country ? 
                    `<img src="${activity.country.flag.img}" alt="${activity.country.country}" class="h-4 inline mr-1"> ${activity.country.country}` : 
                    'Unknown';
                
                const deviceCell = document.createElement('td');
                deviceCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                deviceCell.textContent = activity.user_agent || 'Unknown';
                
                const statusCell = document.createElement('td');
                statusCell.className = `px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    activity.is_bot ? 'text-red-600' : 'text-green-600'
                }`;
                statusCell.textContent = activity.is_bot ? 'Bot' : 'Human';
                
                row.appendChild(timeCell);
                row.appendChild(ipCell);
                row.appendChild(countryCell);
                row.appendChild(deviceCell);
                row.appendChild(statusCell);
                
                activityTable.appendChild(row);
            });
        } else {
            console.error('Failed to load stats:', data.error);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function copyToClipboard() {
    const shortLinkInput = document.getElementById('shortLink');
    shortLinkInput.select();
    document.execCommand('copy');
    
    // Show feedback
    const copyButton = shortLinkInput.nextElementSibling;
    const originalText = copyButton.textContent;
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
        copyButton.textContent = originalText;
    }, 2000);
}
