const API_URL = import.meta.env.VITE_API_URL;

export const api = {
  checkUser: async (settings) => {
    const response = await fetch(`${API_URL}/user/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to check user');
    return response.json();
  },

  createUser: async (settings) => {
    const response = await fetch(`${API_URL}/user/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  generateTimeline: async (characterName, activities) => {
    const response = await fetch(`${API_URL}/timeline/generate/${encodeURIComponent(characterName)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activities })
    });
    if (!response.ok) throw new Error('Failed to generate timeline');
    return response.json();
  },

  generateQuestions: async (characterName) => {
    const response = await fetch(`${API_URL}/questions/generate/${encodeURIComponent(characterName)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to generate questions');
    return response.json();
  }
};