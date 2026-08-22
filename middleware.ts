import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Matikan sementara untuk keperluan slicing UI
  // matcher: [
  //   "/((?!api/auth|api|_next/static|_next/image|favicon.ico|images|login).*)",
  // ],
  matcher: [],
};