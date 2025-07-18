import * as z from "zod";
const UserRegistrationValidation = z.object({
  name: z.string().min(3).max(50),
  email: z.email(),
  password: z.string().min(5).max(100),
});

export { UserRegistrationValidation };
