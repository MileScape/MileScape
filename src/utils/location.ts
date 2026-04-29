export const formatCountryName = (country: string, options?: { uppercase?: boolean }) => {
  const formattedCountry = country === "Taiwan" ? "Taiwan (China)" : country;

  return options?.uppercase ? formattedCountry.toUpperCase() : formattedCountry;
};
