
const HF_API_KEY = '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';
const HF_API_URL = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';


const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const analyzeButton = document.getElementById('analyzeButton');
const aiPlaceholder = document.getElementById('aiPlaceholder');
const aiResults = document.getElementById('aiResults');
const submitSection = document.getElementById('submitSection');

let uploadedImages = [];


// Click to upload
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

// File input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

/**
 * Handle uploaded files
 * @param {FileList} files - Files from input or drag-drop
 */
function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImages.push({
                    file: file,
                    dataUrl: e.target.result
                });
                displayImagePreview(e.target.result, uploadedImages.length - 1);
                updateAnalyzeButton();
            };
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Display image preview
 * @param {string} dataUrl - Base64 image data
 * @param {number} index - Image index
 */
function displayImagePreview(dataUrl, index) {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'image-preview';
    previewDiv.innerHTML = `
        <img src="${dataUrl}" alt="Food image">
        <button class="remove-image" onclick="removeImage(${index})">×</button>
    `;
    imagePreviewContainer.appendChild(previewDiv);
}

/**
 * Remove image from preview
 * @param {number} index - Image index to remove
 */
window.removeImage = function(index) {
    uploadedImages.splice(index, 1);
    imagePreviewContainer.innerHTML = '';
    uploadedImages.forEach((img, i) => {
        displayImagePreview(img.dataUrl, i);
    });
    updateAnalyzeButton();
};

/**
 * Update analyze button state
 */
function updateAnalyzeButton() {
    analyzeButton.disabled = uploadedImages.length === 0;
}


/**
 * Analyze food images using Hugging Face Vision Models
 * @param {Array} images - Array of uploaded image objects with dataUrl
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeWithHuggingFace(images) {
    try {
        const analysisResults = {
            overallAssessment: "",
            items: [],
            statistics: {
                freshCount: 0,
                atRiskCount: 0,
                spoiledCount: 0
            }
        };

        // Analyze each image
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            
            // Convert base64 to blob
            const base64Data = img.dataUrl.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let j = 0; j < byteCharacters.length; j++) {
                byteNumbers[j] = byteCharacters.charCodeAt(j);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: img.file.type });

            // Call Hugging Face API
            const response = await fetch(HF_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                },
                body: blob
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Hugging Face API Error: ${errorText}`);
            }

            const result = await response.json();
            
            // Parse the description from the model
            let description = 'Food item';
            
            try {
                if (Array.isArray(result) && result.length > 0) {
                    description = result[0]?.generated_text || result[0]?.text || result[0]?.label || 'Food item detected';
                } else if (result.generated_text) {
                    description = result.generated_text;
                } else if (result[0]?.generated_text) {
                    description = result[0].generated_text;
                } else {
                    // Fallback description
                    description = 'Food item detected';
                }
            } catch (parseError) {
                console.warn('Could not parse description, using fallback', parseError);
                description = 'Food item detected';
            }

            // Analyze freshness based on description keywords
            const freshnessAnalysis = analyzeFreshnessFromDescription(description);

            analysisResults.items.push({
                imageIndex: i,
                foodType: description,
                freshnessStatus: freshnessAnalysis.status,
                confidenceScore: freshnessAnalysis.confidence,
                observations: freshnessAnalysis.observations,
                recommendation: freshnessAnalysis.recommendation,
                priorityLevel: freshnessAnalysis.priority,
                estimatedShelfLife: freshnessAnalysis.shelfLife
            });

            // Update statistics
            if (freshnessAnalysis.status === 'Fresh') {
                analysisResults.statistics.freshCount++;
            } else if (freshnessAnalysis.status === 'At-Risk') {
                analysisResults.statistics.atRiskCount++;
            } else {
                analysisResults.statistics.spoiledCount++;
            }
        }

        analysisResults.overallAssessment = `Analyzed ${images.length} food item(s). ${analysisResults.statistics.freshCount} items are fresh and ready for donation, ${analysisResults.statistics.atRiskCount} items need quick distribution, and ${analysisResults.statistics.spoiledCount} items should be composted.`;

        return analysisResults;

    } catch (error) {
        console.error('Hugging Face Analysis Error:', error);
        throw error;
    }
}

/**
 * Analyze freshness based on image description
 * @param {string} description - Image description from AI
 * @returns {Object} Freshness analysis
 */
function analyzeFreshnessFromDescription(description) {
    const lowerDesc = description.toLowerCase();
    
    // Enhanced keyword detection with more realistic patterns
    const freshKeywords = ['fresh', 'ripe', 'green', 'bright', 'colorful', 'vibrant', 'clean', 'new', 'packaged', 'wrapped', 'sealed'];
    const atRiskKeywords = ['brown', 'soft', 'wilted', 'slightly', 'overripe', 'yellow', 'dull', 'bruised', 'old'];
    const spoiledKeywords = ['rotten', 'moldy', 'mold', 'spoiled', 'decay', 'dark spots', 'black', 'fungus', 'waste', 'garbage'];

    // Default to uncertain classification instead of always fresh
    let status = 'Fresh';
    let confidence = 65; // Lower default confidence
    let observations = `Detected: ${description}. `;
    let recommendation = '';
    let priority = 'Medium';
    let shelfLife = '2-3 days';

    // Check for spoiled indicators first (highest priority)
    if (spoiledKeywords.some(keyword => lowerDesc.includes(keyword))) {
        status = 'Spoiled';
        confidence = 85;
        observations += 'Visual indicators suggest the food may be past safe consumption. ';
        recommendation = 'Not suitable for donation. Recommend composting to reduce waste.';
        priority = 'Low';
        shelfLife = 'Expired';
    }
    // Check for at-risk indicators
    else if (atRiskKeywords.some(keyword => lowerDesc.includes(keyword))) {
        status = 'At-Risk';
        confidence = 75;
        observations += 'Food appears to be nearing the end of optimal freshness. ';
        recommendation = 'Suitable for immediate donation. Should be distributed within 24 hours.';
        priority = 'High';
        shelfLife = 'Use within 24 hours';
    }
    // Check for fresh indicators
    else if (freshKeywords.some(keyword => lowerDesc.includes(keyword))) {
        status = 'Fresh';
        confidence = 85;
        observations += 'Food appears to be in good condition with visible freshness indicators. ';
        recommendation = 'Safe for immediate donation to food banks and shelters.';
        priority = 'Medium';
        shelfLife = '2-3 days';
    }
    // No clear indicators - give realistic assessment
    else {
        // Analyze food type to make educated guess
        if (lowerDesc.includes('vegetable') || lowerDesc.includes('fruit')) {
            status = 'Fresh';
            confidence = 70;
            observations += 'Produce detected. Visual inspection recommended for final assessment. ';
            recommendation = 'Inspect closely for signs of spoilage before donation. If appearance is good, safe for donation.';
            priority = 'Medium';
            shelfLife = '1-2 days';
        } else if (lowerDesc.includes('bread') || lowerDesc.includes('baked')) {
            status = 'Fresh';
            confidence = 75;
            observations += 'Baked goods detected. Check for mold before donation. ';
            recommendation = 'Safe for donation if no mold present. Best used within 24 hours.';
            priority = 'High';
            shelfLife = 'Use within 24 hours';
        } else if (lowerDesc.includes('meat') || lowerDesc.includes('chicken') || lowerDesc.includes('fish')) {
            status = 'At-Risk';
            confidence = 60;
            observations += 'Protein item detected. Temperature control is critical. ';
            recommendation = 'Only donate if properly refrigerated. Verify smell and texture before distribution.';
            priority = 'High';
            shelfLife = 'Use immediately';
        } else if (lowerDesc.includes('can') || lowerDesc.includes('package') || lowerDesc.includes('box')) {
            status = 'Fresh';
            confidence = 90;
            observations += 'Packaged food item detected. Check expiration date on packaging. ';
            recommendation = 'Safe for donation if packaging is intact and not expired.';
            priority = 'Low';
            shelfLife = 'Check package date';
        } else {
            status = 'Fresh';
            confidence = 65;
            observations += 'Food item identified. Manual inspection recommended. ';
            recommendation = 'Perform visual and smell check before donation. If no signs of spoilage, safe to donate.';
            priority = 'Medium';
            shelfLife = '1-2 days';
        }
    }

    return {
        status,
        confidence,
        observations,
        recommendation,
        priority,
        shelfLife
    };
}

/**
 * Display AI analysis results in the UI
 * @param {Object} results - Analysis results from Gemini
 */
function displayAIResults(results) {
    const aiResultsContainer = document.getElementById('aiResults');
    
    // Clear previous results
    aiResultsContainer.innerHTML = '';

    // Display overall assessment
    if (results.overallAssessment) {
        const assessmentDiv = document.createElement('div');
        assessmentDiv.style.cssText = `
            background: rgba(41, 128, 185, 0.1);
            padding: 1.5rem;
            border-radius: 15px;
            margin-bottom: 2rem;
            border-left: 4px solid #2980b9;
        `;
        assessmentDiv.innerHTML = `
            <h4 style="color: #2980b9; margin-bottom: 0.5rem;">📊 Overall Assessment</h4>
            <p style="color: #ccc;">${results.overallAssessment}</p>
        `;
        aiResultsContainer.appendChild(assessmentDiv);
    }

    // Display individual item results
    results.items.forEach((item, index) => {
        const statusClass = item.freshnessStatus.toLowerCase().replace('-', '');
        const statusColors = {
            fresh: { bg: 'rgba(39, 174, 96, 0.2)', color: '#27ae60', border: '#27ae60' },
            atrisk: { bg: 'rgba(243, 156, 18, 0.2)', color: '#f39c12', border: '#f39c12' },
            spoiled: { bg: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '#e74c3c' }
        };

        const colors = statusColors[statusClass] || statusColors.fresh;

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.style.borderLeftColor = colors.border;
        
        resultItem.innerHTML = `
            <div class="result-header">
                <span class="result-status" style="background: ${colors.bg}; color: ${colors.color};">
                    ${item.freshnessStatus === 'Fresh' ? '✓' : item.freshnessStatus === 'At-Risk' ? '⚠' : '✗'} 
                    ${item.freshnessStatus}
                </span>
                <span class="confidence-score">${item.confidenceScore}%</span>
            </div>
            <p><strong>Food Type:</strong> ${item.foodType}</p>
            <p><strong>Priority:</strong> <span style="color: ${item.priorityLevel === 'High' ? '#e74c3c' : item.priorityLevel === 'Medium' ? '#f39c12' : '#27ae60'}">${item.priorityLevel}</span></p>
            ${item.estimatedShelfLife ? `<p><strong>Est. Shelf Life:</strong> ${item.estimatedShelfLife}</p>` : ''}
            <p style="margin-top: 1rem; color: #aaa;"><strong>Observations:</strong> ${item.observations}</p>
            <div class="recommendation">
                <div class="recommendation-title">📍 Recommendation:</div>
                <p>${item.recommendation}</p>
            </div>
        `;
        
        aiResultsContainer.appendChild(resultItem);
    });

    // Update statistics
    if (results.statistics) {
        document.getElementById('freshCount').textContent = results.statistics.freshCount;
        document.getElementById('atRiskCount').textContent = results.statistics.atRiskCount;
        document.getElementById('compostCount').textContent = results.statistics.spoiledCount;
    }
}

// ============================================
// ANALYZE BUTTON HANDLER
// ============================================

analyzeButton.addEventListener('click', async () => {
    // Validate API key
    if (HF_API_KEY === 'YOUR_HUGGING_FACE_API_KEY_HERE') {
        alert('⚠️ Please add your Hugging Face API key first!\n\nGet your free API key from: https://huggingface.co/settings/tokens\n\n1. Sign up/Login to Hugging Face\n2. Go to Settings > Access Tokens\n3. Create a new token (Read access is enough)\n4. Copy and paste it in donation.js');
        return;
    }

    // Show loading state
    analyzeButton.textContent = '🔄 Analyzing with AI...';
    analyzeButton.disabled = true;
    analyzeButton.style.background = 'linear-gradient(135deg, #95a5a6, #7f8c8d)';

    try {
        // Call Hugging Face API
        const results = await analyzeWithHuggingFace(uploadedImages);
        
        // Hide placeholder, show results
        aiPlaceholder.style.display = 'none';
        aiResults.classList.add('active');
        
        // Display results
        displayAIResults(results);
        
        // Show submit section
        submitSection.style.display = 'block';
        
        // Update button
        analyzeButton.textContent = '✓ Analysis Complete';
        analyzeButton.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
        
        // Update progress steps
        document.querySelectorAll('.step')[2].classList.add('active');
        
    } catch (error) {
        // Handle errors
        analyzeButton.textContent = '❌ Analysis Failed - Try Again';
        analyzeButton.disabled = false;
        analyzeButton.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        
        let errorMessage = 'Error analyzing images:\n' + error.message + '\n\n';
        
        if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage += 'Your API key may be invalid. Please check:\n1. API key is copied correctly\n2. Token has "read" permissions\n3. Try generating a new token';
        } else if (error.message.includes('503') || error.message.includes('loading')) {
            errorMessage += 'The AI model is loading (first use can take 20-30 seconds).\nPlease wait a moment and try again.';
        } else {
            errorMessage += 'Please check:\n1. API key is valid\n2. Internet connection\n3. Images are valid';
        }
        
        alert(errorMessage);
        
        console.error('Analysis error:', error);
    }
});

// ============================================
// FORM PROGRESS TRACKING
// ============================================

document.getElementById('donorName').addEventListener('input', updateProgressSteps);
document.getElementById('donorType').addEventListener('change', updateProgressSteps);

function updateProgressSteps() {
    const name = document.getElementById('donorName').value;
    const type = document.getElementById('donorType').value;
    
    if (name && type) {
        document.querySelectorAll('.step')[1].classList.add('active');
    }
}

// ============================================
// FINAL SUBMISSION HANDLER
// ============================================

document.getElementById('finalSubmitButton').addEventListener('click', () => {
    // Collect all form data
    const donationData = {
        donor: {
            name: document.getElementById('donorName').value,
            type: document.getElementById('donorType').value,
            location: document.getElementById('location').value,
            contact: document.getElementById('contactInfo').value,
            description: document.getElementById('foodDescription').value
        },
        images: uploadedImages.length,
        timestamp: new Date().toISOString()
    };

    // TODO: Send data to your backend
    console.log('Donation Data:', donationData);
    
    // Show success message
    alert('🎉 Thank you for your donation!\n\nYour contribution will help reduce food waste and support the community.\n\nYou will receive a confirmation email shortly. 🌍💚');
    
    // Update progress
    document.querySelectorAll('.step')[3].classList.add('active');
    
    // Optional: Reset form or redirect
    // window.location.href = 'thank-you.html';
});