import * as z from "zod";
const UserRegistrationValidation = z.object({
  name: z
    .string()
    .min(4, { message: "Name must be atleast 4 characters" })
    .max(50, { message: "Name must be atmost 50 characters" }),
  email: z.email(),
  password: z
    .string()
    .min(5, { message: "Password must be atleast 5 characters" })
    .max(100, { message: "Password must be atmost 100 characters" }),
});

export { UserRegistrationValidation };
