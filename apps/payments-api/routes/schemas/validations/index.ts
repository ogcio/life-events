import Ajv from "ajv";
import validator from "./validators";

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  allErrors: true,
});

ajv.addKeyword({
  keyword: "validator",
  compile: (validatorFn) => {
    return function validate(data: any, ctx: any) {
      const errors: Array<any> = [];
      try {
        const valid = validator(
          data,
          validatorFn,
          ctx.parentDataProperty,
          errors,
        );

        if (errors.length) {
          (validate as any).errors = errors;
        }

        return valid;
      } catch (err) {
        console.error(err);

        // Bypass validation if the specified validator does not exist
        return true;
      }
    };
  },
  errors: true,
});

export default ajv.compile.bind(ajv);
