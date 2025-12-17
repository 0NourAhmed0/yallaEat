import api from "./axios";

// customer
export const createFeedback = ({ rating, comment, reservationId }) =>
  api.post("/feedback", { rating, comment, reservationId });

export const getMyFeedback = () => api.get("/feedback/my");

// admin/staff
export const getAllFeedback = () => api.get("/feedback");
export const hideFeedback = (id) => api.put(`/feedback/${id}/hide`);
