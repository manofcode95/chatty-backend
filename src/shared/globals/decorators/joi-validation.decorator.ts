/* eslint-disable @typescript-eslint/no-explicit-any */

import { JoiRequestValidation } from '@globals/helpers/error-handler';
import { ObjectSchema } from 'joi';

type IJoiDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const res = args[0];
      const { error } = await Promise.resolve(schema.validate(res.body));

      if (error?.details) {
        throw new JoiRequestValidation(error.details[0].message);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
