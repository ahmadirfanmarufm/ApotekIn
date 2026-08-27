"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { loginSchema } from "@/lib/validations/auth";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage(null);
    setFieldErrors({});

    const validation = loginSchema.safeParse(formData);

    if (!validation.success) {
      const formattedErrors: {
        email?: string;
        password?: string;
      } = {};

      for (const issue of validation.error.issues) {
        const field = issue.path[0];

        if (field === "email") {
          formattedErrors.email = issue.message;
        }

        if (field === "password") {
          formattedErrors.password = issue.message;
        }
      }

      setFieldErrors(formattedErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      });

      if (!res) {
        setErrorMessage("Tidak dapat terhubung ke server.");
        return;
      }

      if (res.error) {
        setErrorMessage(
          "Email atau kata sandi yang Anda masukkan salah.",
        );
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        "Terjadi kesalahan sistem. Silakan coba lagi nanti.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setFormData({
      email: "admin@apotekin.com",
      password: "password123",
    });

    setFieldErrors({});
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#e5ece9] overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-12 lg:p-16">
        <Image
          src="/images/pharmacy_bg.png"
          alt="Pharmacy Laboratory"
          fill
          priority
          className="object-cover object-center filter blur-[1px] brightness-[0.97]"
        />

        <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-slate-900/10 to-transparent" />

        <div className="relative z-10 max-w-md space-y-3 bg-white/70 px-6 py-4 rounded-xl">
          <h2 className="text-2xl lg:text-2xl font-bold text-[#10b981] leading-tight">
            Meningkatkan Operasional Farmasi
          </h2>

          <p className="text-xs lg:text-sm text-slate-700 font-medium leading-relaxed drop-shadow-sm">
            Precision, clarity, and security built for modern healthcare
            environments.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 py-10 bg-white lg:rounded-l-4xl shadow-2xl relative z-20">
        <div className="w-full max-w-95 space-y-6">
          <div className="mb-2">
            <Image
              src="/images/logo.png"
              alt="ApotekIn Logo"
              width={260}
              height={70}
              className="object-contain h-14 w-auto"
              priority
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Selamat Datang kembali
            </h1>

            <p className="text-xs sm:text-sm text-slate-500">
              Masuk untuk mengelola operasional apotek Anda.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-800"
              >
                Alamat Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="doctor@clinic.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all ${
                  fieldErrors.email
                    ? "border-red-400 focus:ring-red-400"
                    : "border-slate-300"
                }`}
              />

              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-800"
              >
                Kata sandi
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all ${
                    fieldErrors.password
                      ? "border-red-400 focus:ring-red-400"
                      : "border-slate-300"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800 transition-colors focus:outline-none"
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end text-xs pt-0.5">
              <button
                type="button"
                className="text-[#10b981] font-medium hover:underline focus:outline-none"
                onClick={() =>
                  alert("Fitur Lupa Kata Sandi sedang dikembangkan.")
                }
              >
                Lupa kata sandi?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#10b981] hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium text-sm shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-75 disabled:cursor-not-allowed group mt-2"
            >
              {loading || status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50 text-[#10b981] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gunakan Kredensial Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}