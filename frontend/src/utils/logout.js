// src/utils/logout.js
export const logout = () => {
  localStorage.removeItem("rabwah_token");
  localStorage.removeItem("rabwah_user");
  localStorage.removeItem("rabwah_token_time");
  window.location.href = "/login"; // redirect to login page
};
