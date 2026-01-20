import * as yup from 'yup'

export const createEmployeeSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('Имя обязательно'),
  lastName: yup
    .string()
    .required('Фамилия обязательна'),
  email: yup
    .string()
    .email('Некорректный email')
    .notRequired(),
  phoneNumber: yup
    .string()
    .notRequired(),
  preferredLanguage: yup
    .string()
    .oneOf(['ru', 'kz', 'en'], 'Выберите язык')
    .notRequired(),
})

export type CreateEmployeeFormData = yup.InferType<typeof createEmployeeSchema>
