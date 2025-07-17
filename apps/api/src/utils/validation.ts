import * as z from "zod";
const UserValidation = z.object({
  first_name: z.string().min(3).max(50),
  last_name: z.string().min(3).max(50),
  username: z.string().min(4).max(20),
  password: z.string().min(5).max(100),
  refresh_token: z.string().optional(),
});

export { UserValidation };
