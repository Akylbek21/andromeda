import * as yup from 'yup'

export const createEmployeeSchema = yup.object().shape({
  lastName: yup.string().required('\u0424\u0430\u043c\u0438\u043b\u0438\u044f \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u0430'),
  firstName: yup.string().required('\u0418\u043c\u044f \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e'),
  phoneNumber: yup
    .string()
    .required('\u041d\u043e\u043c\u0435\u0440 WhatsApp \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u0435\u043d'),
  email: yup
    .string()
    .required('Email \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u0435\u043d')
    .matches(/@gmail\.com$/, 'Email \u0434\u043e\u043b\u0436\u0435\u043d \u0437\u0430\u043a\u0430\u043d\u0447\u0438\u0432\u0430\u0442\u044c\u0441\u044f \u043d\u0430 @gmail.com'),
  iin: yup.string().when('notCitizen', {
    is: false,
    then: (schema) => schema.required('\u0418\u0418\u041d \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u0435\u043d'),
    otherwise: (schema) => schema.transform((value) => value || '000000000000').default('000000000000'),
  }),
  notCitizen: yup.boolean(),
  role: yup
    .string()
    .oneOf(['expert', 'mentor', 'teacher', 'accountant'])
    .required('\u0420\u043e\u043b\u044c \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u0430'),
})

export const updateEmployeeSchema = yup.object().shape({
  iin: yup.string(),
  email: yup.string().email('\u041d\u0435\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 email'),
  role: yup.string().oneOf(['expert', 'mentor', 'teacher', 'accountant']),
})

export const updatePhoneSchema = yup.object().shape({
  phoneNumber: yup.string().required('\u041d\u043e\u043c\u0435\u0440 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u0435\u043d'),
})
