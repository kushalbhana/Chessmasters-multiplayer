import { NextRequest} from 'next/server';
import { SignupSchema, SignupFormValues } from '@repo/typescript-config';
import prisma from '@repo/db/client';
import { hash } from 'bcrypt';


export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Using zod to validate the req data
    const validatedData: SignupFormValues = SignupSchema.parse(data);

    const existingUser = await prisma.user.findFirst({
        where: {
            email: validatedData.email
        }
    });

    if (existingUser) {
        return Response.json({ message: 'User already exists' }, {status: 409});
    }

    // Hashing  the password
    const hashedPassword = await hash(validatedData.password, 10); // 10 is the saltRounds

    // Save the data to the database
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.fullname,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    if (!newUser) {
      return Response.json({ error: 'Failed to signup' }, {status: 500});
    }

    return Response.json({ message: 'Signup successful' },{status: 200});
  } catch (error) {

    return Response.json({ error: 'Failed to signup' });
  }
}