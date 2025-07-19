import { z } from "zod";
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

const BookingValidation = z.object({
  courtId: z
    .number()
    .positive({ message: "Court ID must be a positive number" }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Time must be in HH:mm format",
  }),
  duration: z
    .number()
    .min(30, { message: "Minimum booking duration is 30 minutes" })
    .max(480, { message: "Maximum booking duration is 8 hours" })
    .refine((duration) => duration % 30 === 0, {
      message: "Duration must be in 30-minute intervals",
    }),
});

export { UserRegistrationValidation, BookingValidation };
