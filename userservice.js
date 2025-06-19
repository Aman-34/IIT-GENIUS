class UserService {
  static async getProfile(token) {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch profile';
    }
  }

  static async updateProfile(token, userData) {
    try {
      const response = await axios.patch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER}`,
        userData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update profile';
    }
  }
}