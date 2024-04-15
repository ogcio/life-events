import Ajv from "ajv";

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
});

ajv.addKeyword({
  keyword: "validator",
  compile: (schema, parentSchema) => {
    return function validate(data) {
      (validate as any).errors = [
        {
          keyword: "validator",
          message: "shoud be authenticated.",
          params: { keyword: "validator" },
        },
      ];
      console.log(schema);
      console.log(data);
      return false;
    };
  },
  errors: true,
});

// ajv.addKeyword('validator', {
//     macro: (schema: any) => schema,
//     keyword: '',
//     compile : (schema, parentSchema) => {
//         console.log(schema);
//         return () => true
//     },
//     // function validate(data) {
//     //     console.log(data)
//     //     // return true;
//     //     if (typeof schema === 'function') {
//     //         const valid = schema(data);
//     //         if (!valid) {
//     //             // validate.errors = [{
//     //             // keyword: 'validate',
//     //             // message: `: ${data} should pass custom validation`,
//     //             // params: { keyword: 'validate' },
//     //             // }];
//     //         }
//     //         return valid;
//     //     }

//     //     else if (typeof schema === 'object' &&
//     //             Array.isArray(schema) &&
//     //             schema.every(f => typeof f === 'function')) {
//     //         const [ f, errorMessage ] = schema;
//     //         const valid = f(data);
//     //         if (!valid) {
//     //             // validate.errors = [{
//     //             // keyword: 'validate',
//     //             // message: ': ' + errorMessage(schema, parentSchema, data),
//     //             // params: { keyword: 'validate' },
//     //             // }];
//     //         }
//     //         return valid;
//     //     }

//     //     else {
//     //         throw new Error('Invalid definition for custom validator');
//     //     }
//     // },
//     errors : true,
// });

export default ajv.compile.bind(ajv);
