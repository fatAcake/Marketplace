export const productToBackend = (form) => {
  const formData = new FormData();
  formData.append('Name', form.name.trim());
  formData.append('Price', parseFloat(form.price));
  if (form.description) formData.append('Description', form.description);
  return formData;
};