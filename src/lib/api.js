const API_URL = import.meta.env.VITE_API_URL;

export const api = {
  generateQuests: async (characterName) => {
    const response = await fetch(`${API_URL}/quests/generate/${encodeURIComponent(characterName)}`);
    if (!response.ok) throw new Error('Failed to generate quests');
    return response.json();
  },

  getQuests: async (characterName) => {
    const response = await fetch(`${API_URL}/quests/${encodeURIComponent(characterName)}`);
    if (!response.ok) throw new Error('Failed to fetch quests');
    return response.json();
  },

  completeQuest: async (characterName, questData) => {
    const response = await fetch(`${API_URL}/quests/complete/${encodeURIComponent(characterName)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questData)
    });
    if (!response.ok) throw new Error('Failed to complete quest');
    return response.json();
  },

  createCharacter: async (settings) => {
    const response = await fetch(`${API_URL}/character/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to create character');
    return response.json();
  },

  getDailyWrapUp: async (characterName, date) => {
    const response = await fetch(`${API_URL}/daily/wrap-up/${encodeURIComponent(characterName)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    });
    if (!response.ok) throw new Error('Failed to get daily wrap-up');
    return response.json();
  }
};