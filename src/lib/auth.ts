import { getServerSession } from "next-auth/next";
import type { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Role } from "@/prisma/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/prisma/config";
import { loginSchema } from "@/lib/validations/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validation = loginSchema.safeParse(credentials);

        if (!validation.success) {
          return null;
        }

        const { email, password } = validation.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            fullName: true,
            role: true,
            isActive: true,
            avatarUrl: true,
          },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
          return null;
        }

        const now = new Date();

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: now }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: User;
      trigger?: "signIn" | "signUp" | "update";
      session?: Partial<Session>;
    }) {
      if (trigger === "update" && session?.user) {
        if (session.user.image !== undefined) {
          token.picture = session.user.image;
        }
        if (session.user.name) {
          token.name = session.user.name;
        }
      }

      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.picture = user.image;
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name ?? session.user.name;
        session.user.role = token.role as Role;
        session.user.image = (token.picture as string) || null;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);