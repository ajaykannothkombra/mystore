export const lookupPhone = (email: string) => {
  const localPartIndex = email.indexOf("@store.local");

  if (localPartIndex > 0) {
    return email.substring(0, localPartIndex);
  }

  return null;
};

export const lookupEmail = (phone: string) => {
  return phone ? `${phone}@store.local` : null;
};
