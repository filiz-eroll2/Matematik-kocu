'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogOut, User, Sparkles, BookOpen } from 'lucide-react';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
  } | null;
  remainingUsage?: number;
  maxUsage?: number;
  onLogout?: () => void;
}

export default function Navbar({
  user,
  remainingUsage = 10,
  maxUsage = 10,
  onLogout,
}: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (onLogout) {
        onLogout();
      } else {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-100 bg-white/90 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Marka */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
                Matematik Koçu
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                11. Sınıf
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              Yapay Zekâ Destekli Matematik Rehberin
            </p>
          </div>
        </Link>

        {/* Sağ Alan (Kullanıcı Bilgisi / Oturum İşlemleri) */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Günlük Limit Rozeti */}
              <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-100 text-indigo-900 px-3 py-1.5 rounded-full text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>
                  Bugün: <strong>{remainingUsage} / {maxUsage}</strong> hak
                </span>
              </div>

              {/* Kullanıcı Menüsü */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-gray-800">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-gray-400 max-w-[120px] truncate">
                    {user.email}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs border border-indigo-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  title="Çıkış Yap"
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 transition-all hover:shadow-md"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
