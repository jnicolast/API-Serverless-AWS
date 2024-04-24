import * as yup from "yup";

export const schema = yup.object().shape({
    name: yup.string().required(),
    age: yup.number().required(),
    email: yup.string().required(),
});