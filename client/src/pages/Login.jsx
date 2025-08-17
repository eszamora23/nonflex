import { useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', tenant: '' });
  const { setAuth } = useAuthStore();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/agents/login', form);
      setAuth({ token: res.data.token, tenant: form.tenant });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('tenant', form.tenant);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
      />
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
      />
      <input
        name="tenant"
        value={form.tenant}
        onChange={handleChange}
        placeholder="Tenant"
      />
      <button type="submit">Login</button>
    </form>
  );
}
