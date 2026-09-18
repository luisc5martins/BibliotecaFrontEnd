import axios from 'axios';

export default class AuthService {
  async login(email, password) {
    const response = await axios.post('/token/', { email, password });
    return response.data;
  }

  async refreshToken(refresh) {
    const response = await axios.post('/token/refresh/', { refresh });
    return response.data;
  }

  async register(email, name, password) {
    const response = await axios.post('/registro/', { email, name, password });
    return response.data;
  }

  async getUser() {
    const response = await axios.get('/usuarios/me/');
    return response.data;
  }

  async updateUser(data) {
    const response = await axios.patch('/usuarios/me/', data);
    return response.data;
  }
}
