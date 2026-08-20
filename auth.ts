import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterSession, AdapterUser } from "next-auth/adapters";
import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import Resend from "next-auth/providers/resend";

import {
  AUTH_SESSION_MAX_AGE_SECONDS,
  MAGIC_LINK_MAX_AGE_SECONDS,
  getAuthEmailProvider,
  getAuthResendConfiguration,
  getAuthSmtpConfiguration,
  isBootstrapAdminEmail,
  normalizeAuthEmail
} from "@/lib/auth-config";
import {
  sendMagicLinkEmail,
  sendMagicLinkEmailWithResend
} from "@/lib/auth-email";
import { db } from "@/lib/db";
import { linkHistoricalPurchasesToUser } from "@/lib/lms-commerce";

type DatabaseAuthUser = AdapterUser & {
  role: "learner" | "admin";
  isActive: boolean;
};

const baseAdapter = PrismaAdapter(db);

const authAdapter: Adapter = {
  ...baseAdapter,
  async createUser(user) {
    const createdUser = await db.user.create({
      data: {
        name: user.name,
        email: normalizeAuthEmail(user.email),
        emailVerified: user.emailVerified,
        image: user.image,
        role: isBootstrapAdminEmail(user.email) ? "admin" : "learner",
        isActive: true
      }
    });

    return createdUser as DatabaseAuthUser;
  },
  async getSessionAndUser(sessionToken) {
    const record = await db.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    });

    if (!record?.user.isActive) return null;

    const { user, ...session } = record;
    return {
      user: user as DatabaseAuthUser,
      session: session as AdapterSession
    };
  }
};

const smtpConfiguration = getAuthSmtpConfiguration();
const resendConfiguration = getAuthResendConfiguration();
const emailProvider =
  getAuthEmailProvider() === "resend"
    ? Resend({
        id: "email",
        name: "Lien par courriel",
        apiKey: resendConfiguration.apiKey || "disabled",
        from:
          resendConfiguration.from ||
          "FormeducWeb <connexion@formeducweb.local>",
        maxAge: MAGIC_LINK_MAX_AGE_SECONDS,
        normalizeIdentifier: normalizeAuthEmail,
        sendVerificationRequest: sendMagicLinkEmailWithResend
      })
    : Nodemailer({
        id: "email",
        name: "Lien par courriel",
        server: {
          host: smtpConfiguration.host || "localhost",
          port: smtpConfiguration.port || 1025,
          secure: smtpConfiguration.secure
        },
        from: smtpConfiguration.from,
        maxAge: MAGIC_LINK_MAX_AGE_SECONDS,
        normalizeIdentifier: normalizeAuthEmail,
        sendVerificationRequest: sendMagicLinkEmail
      });

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: authAdapter,
  session: {
    strategy: "database",
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    updateAge: 24 * 60 * 60
  },
  providers: [emailProvider],
  pages: {
    signIn: "/connexion",
    verifyRequest: "/connexion?verification=envoyee",
    error: "/connexion"
  },
  callbacks: {
    async signIn({ user, email }) {
      // During a request, always return the same public response. The sender
      // silently suppresses delivery for inactive or throttled accounts.
      if (email?.verificationRequest) return true;

      if (!user.email) return false;

      const currentUser = await db.user.findUnique({
        where: { email: normalizeAuthEmail(user.email) },
        select: { id: true, role: true, isActive: true }
      });

      if (currentUser?.isActive === false) return false;

      return true;
    },
    async session({ session, user }) {
      // Do not trust role information cached by a client. Database sessions and
      // this fresh lookup make the account's current state authoritative.
      const currentUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isActive: true
        }
      });

      if (!currentUser?.isActive || !currentUser.email) {
        await db.session.deleteMany({ where: { userId: user.id } });
        return {
          ...session,
          user: undefined
        };
      }

      if (!session.user) return session;

      Object.assign(session.user, {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        image: currentUser.image,
        role: currentUser.role === "admin" ? "admin" : "learner",
        isActive: true
      });

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/") && !url.startsWith("//")) {
        return `${baseUrl}${url}`;
      }

      try {
        return new URL(url).origin === baseUrl ? url : `${baseUrl}/mon-espace`;
      } catch {
        return `${baseUrl}/mon-espace`;
      }
    }
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return;

      try {
        await linkHistoricalPurchasesToUser(user.id);
      } catch (error) {
        // Linking is idempotent and can be retried on the next verified login;
        // it must never prevent the learner from opening a valid session.
        console.error(
          "Historical purchase linking failed after sign-in",
          error
        );
      }
    }
  }
});
