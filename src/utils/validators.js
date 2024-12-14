export const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
};

export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};
