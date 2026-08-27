export interface IdentityCardProps {
  user: {
    fullName: string;
    email: string;
    phone: string;
    noSIPA: string;
    role: string;
    avatarUrl: string | null;
  };
};