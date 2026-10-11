import axios from "axios";

const getServerUrl = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  if (!serverUrl) {
    throw new Error("VITE_SERVER_URL is not configured");
  }

  return serverUrl.replace(/\/+$/, "");
};

const API_BASE_URL = () => `${getServerUrl()}/api/preparation-plan`;

// Generate a personalized AI preparation plan
export const generatePreparationPlan = async (planData) => {
  const response = await axios.post(`${API_BASE_URL()}/generate`, planData, {
    withCredentials: true,
  });

  return response.data;
};

// Fetch all preparation plans
export const getMyPreparationPlans = async () => {
  const response = await axios.get(`${API_BASE_URL()}/my-plans`, {
    withCredentials: true,
  });

  return response.data;
};

// Fetch one preparation plan
export const getPreparationPlanById = async (planId) => {
  const response = await axios.get(`${API_BASE_URL()}/${planId}`, {
    withCredentials: true,
  });

  return response.data;
};

// Update task completion status
export const updatePreparationTask = async (planId, taskId, completed) => {
  const response = await axios.patch(
    `${API_BASE_URL()}/${planId}/tasks/${taskId}`,
    { completed },
    { withCredentials: true },
  );

  return response.data;
};

// Delete a preparation plan
export const deletePreparationPlan = async (planId) => {
  const response = await axios.delete(`${API_BASE_URL()}/${planId}`, {
    withCredentials: true,
  });

  return response.data;
};
