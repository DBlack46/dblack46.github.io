document.addEventListener('DOMContentLoaded', () => {
  const cookBtn = document.getElementById('cookBtn');
  const ingredient1 = document.getElementById('ingredient1');
  const ingredient2 = document.getElementById('ingredient2');
  const ingredient3 = document.getElementById('ingredient3');
  const apiKeyInput = document.getElementById('apiKey');
  const loading = document.getElementById('loading');
  const recipeCard = document.getElementById('recipeCard');
  const recipeContent = document.getElementById('recipeContent');

  cookBtn.addEventListener('click', async () => {
    const i1 = ingredient1.value.trim();
    const i2 = ingredient2.value.trim();
    const i3 = ingredient3.value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      alert("Please enter a Gemini API Key to let the magic happen!");
      apiKeyInput.focus();
      return;
    }

    const ingredients = [i1, i2, i3].filter(i => i !== '');

    if (ingredients.length === 0) {
      alert("Please enter at least one ingredient!");
      ingredient1.focus();
      return;
    }

    // Hide previous results and show loading spinner
    recipeCard.classList.add('hidden');
    loading.classList.remove('hidden');

    const prompt = `You are a creative, expert chef. I have these ingredients: ${ingredients.join(', ')}. Create a delicious recipe using them. You may assume I have basic pantry staples (salt, pepper, olive oil, water). 
    
Please format your response in professional Markdown:
- Start with a clear and catchy recipe title (as a heading).
- Include brief preparation and cooking times.
- Provide a bulleted list of ingredients.
- Provide a numbered list of step-by-step instructions.
- Add an encouraging chef's tip at the end.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      let recipeText = "Sorry, I couldn't generate a recipe this time.";
      if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
        recipeText = data.candidates[0].content.parts[0].text;
      }

      // Convert Markdown to secure HTML using Marked.js
      const htmlContent = marked.parse(recipeText);
      recipeContent.innerHTML = htmlContent;

      loading.classList.add('hidden');
      recipeCard.classList.remove('hidden');

    } catch (error) {
      console.error(error);
      recipeContent.innerHTML = `<p style="color: #ef4444; border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; background: rgba(239, 68, 68, 0.1);">
        <strong>Error connecting to AI Server.</strong> Please check your API key and network connection.
        <br><br><small>${error.message}</small>
      </p>`;
      
      loading.classList.add('hidden');
      recipeCard.classList.remove('hidden');
    }
  });
});
