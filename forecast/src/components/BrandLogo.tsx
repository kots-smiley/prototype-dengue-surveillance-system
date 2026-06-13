type BrandLogoSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<BrandLogoSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-24 w-24',
};

interface BrandLogoProps {
  size?: BrandLogoSize;
  showText?: boolean;
  className?: string;
}

export function BrandLogo({ size = 'md', showText = false, className = '' }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/lopez-seal.png"
        alt="Seal of the Municipality of Lopez, Quezon"
        className={`${sizeClasses[size]} shrink-0 rounded-full object-contain`}
      />
      {showText && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-primary-700">HealthWatch</p>
          <p className="truncate text-[10px] text-slate-500">Municipality of Lopez, Quezon</p>
        </div>
      )}
    </div>
  );
}
