import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-700">Matematik Koçu</span>
          <span>— 11. Sınıf Edumints Projesi</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Öğrenmeyi kolaylaştırmak için tasarlandı</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
        </div>
      </div>
    </footer>
  );
}
