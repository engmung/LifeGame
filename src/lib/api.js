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
    try {
      const response = await fetch(`${API_URL}/timeline/generate/${encodeURIComponent(characterName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities })
      });

      // 응답 데이터와 상태 코드를 함께 처리
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        const error = new Error(data.detail || 'Failed to generate timeline');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    } catch (error) {
      // 이미 처리된 오류(response 속성이 있는 경우)는 그대로 던짐
      if (error.response) {
        throw error;
      }
      
      // 네트워크 오류 등 다른 오류 처리
      console.error("API Error:", error);
      const newError = new Error("서버 연결에 실패했습니다.");
      newError.response = { status: 0, data: { detail: error.message } };
      throw newError;
    }
  },

  generateQuestions: async (characterName) => {
    try {
      const response = await fetch(`${API_URL}/questions/generate/${encodeURIComponent(characterName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // 응답 데이터와 상태 코드를 함께 처리
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        const error = new Error(data.detail || 'Failed to generate questions');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    } catch (error) {
      // 이미 처리된 오류(response 속성이 있는 경우)는 그대로 던짐
      if (error.response) {
        throw error;
      }
      
      // 네트워크 오류 등 다른 오류 처리
      console.error("API Error:", error);
      const newError = new Error("서버 연결에 실패했습니다.");
      newError.response = { status: 0, data: { detail: error.message } };
      throw newError;
    }
  },

  getUserStatus: async (characterName) => {
    try {
      const response = await fetch(`${API_URL}/user/status/${encodeURIComponent(characterName)}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const error = new Error(data.detail || 'Failed to get user status');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return response.json();
    } catch (error) {
      if (error.response) throw error;
      console.error("API Error:", error);
      throw new Error("서버 연결에 실패했습니다.");
    }
  }
};