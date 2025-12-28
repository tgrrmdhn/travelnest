export const validateLogin = (email, password) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

export const validateRegister = (data) => {
  const errors = {};

  if (!data.name) {
    errors.name = 'Name is required';
  }

  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.phone) {
    errors.phone = 'Phone is required';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const validateHostProfile = (data) => {
  const errors = {};

  if (!data.title) {
    errors.title = 'Title is required';
  }

  if (!data.description) {
    errors.description = 'Description is required';
  }

  if (!data.city) {
    errors.city = 'City is required';
  }

  if (!data.country) {
    errors.country = 'Country is required';
  }

  if (!data.maxGuests || data.maxGuests < 1) {
    errors.maxGuests = 'Max guests must be at least 1';
  }

  return errors;
};