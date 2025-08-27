const config = {
  api_base_urls: {
    admin: import.meta.env.VITE_APP_ADMIN_BACKEND_URL,
    user: import.meta.env.VITE_APP_USER_BACKEND_URL,
  }
};

export default config;
