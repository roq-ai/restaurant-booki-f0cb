import * as yup from 'yup';

export const reservationValidationSchema = yup.object().shape({
  date: yup.date().required(),
  status: yup.string().required(),
  guest_id: yup.string().nullable(),
  table_id: yup.string().nullable(),
});
