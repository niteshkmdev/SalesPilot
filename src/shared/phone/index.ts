export {
  DEFAULT_PHONE_COUNTRY,
  filterPhoneCountries,
  getPhoneCountry,
  PHONE_COUNTRIES,
  type PhoneCountry,
} from "@/shared/phone/countries";
export {
  clampNationalNumber,
  digitsOnly,
  getNationalMaxLength,
  isValidNationalPhone,
  normalizeToE164,
  parseStoredPhone,
  phoneValidationMessage,
  validateOptionalPhoneValue,
  validateRequiredPhoneValue,
} from "@/shared/phone/phone";
export {
  getDefaultPhoneErrorMessage,
  optionalPhoneFieldError,
  optionalPhoneSchema,
  requiredPhoneSchema,
} from "@/shared/phone/phone.schema";
