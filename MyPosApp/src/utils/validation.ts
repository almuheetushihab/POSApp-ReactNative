export type ValidationErrors<T extends string> = Partial<Record<T, string>>;

export const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());

export const isPositiveNumber = (value: string) => {
    const number = Number(value);
    return value.trim() !== '' && Number.isFinite(number) && number >= 0;
};

export const validateRequired = (value: string, label: string) =>
    value.trim() ? undefined : `${label} is required.`;

export const validateCustomer = (values: {
    name: string;
    phone: string;
    email: string;
}) => {
    const errors: ValidationErrors<'name' | 'phone' | 'email'> = {};
    if (!values.name.trim()) errors.name = 'Customer name is required.';
    else if (values.name.trim().length < 2) errors.name = 'Enter at least 2 characters.';
    else if (!/^[\p{L}\s.'-]+$/u.test(values.name.trim())) errors.name = 'Name can contain letters, spaces, and . \' - only.';
    if (!values.phone.trim()) errors.phone = 'Phone number is required.';
    else if (!/^\d{7,15}$/.test(values.phone.trim())) errors.phone = 'Enter 7 to 15 digits.';
    if (values.email.trim() && !isValidEmail(values.email)) errors.email = 'Enter a valid email address.';
    return errors;
};
