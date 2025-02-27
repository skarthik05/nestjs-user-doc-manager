import { Transform } from 'class-transformer';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function Trim(): PropertyDecorator {
  return Transform((params) => {
    const value = params.value as string[] | string;

    if (Array.isArray(value)) {
      return value.map((v) => v.trim().replaceAll(/\s\s+/g, ' '));
    }

    return value.trim().replaceAll(/\s\s+/g, ' ');
  });
}

export function ToBoolean(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value as string | undefined;

      if (!value) {
        return value;
      }

      switch (value) {
        case 'true': {
          return true;
        }
        case 'false': {
          return false;
        }
        default: {
          return value as unknown as boolean;
        }
      }
    },
    { toClassOnly: true },
  );
}

export function ToInt(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value as string;

      return Number.parseInt(value, 10);
    },
    { toClassOnly: true },
  );
}

export function ToArray(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value as unknown;

      if (!value) {
        return [] as unknown[];
      }

      return (Array.isArray(value) ? value : [value]) as unknown[];
    },
    { toClassOnly: true },
  );
}

export function ToLowerCase(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value as string | string[] | undefined;

      if (!value) {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map((v) => v.toLowerCase());
      }

      return value.toLowerCase();
    },
    {
      toClassOnly: true,
    },
  );
}

export function ToUpperCase(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value as string | string[] | undefined;

      if (!value) {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map((v) => v.toUpperCase());
      }

      return value.toUpperCase();
    },
    {
      toClassOnly: true,
    },
  );
}

export function PhoneNumberSerializer(): PropertyDecorator {
  return Transform((params) => {
    const phoneNumber = parsePhoneNumberFromString(params.value as string);
    return phoneNumber?.number;
  });
}
