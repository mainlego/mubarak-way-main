import { Card } from '@shared/ui';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModuleCardProps {
  title: string;
  titleAr: string;
  description: string;
  icon: LucideIcon;
  route: string;
  gradient?: 'primary' | 'accent' | 'custom';
  customGradient?: string;
}

export default function ModuleCard({
  title,
  titleAr,
  description,
  icon: Icon,
  route,
  gradient = 'primary',
  customGradient,
}: ModuleCardProps) {
  const navigate = useNavigate();

  const gradients = {
    primary: 'bg-gradient-primary',
    accent: 'bg-gradient-accent',
    custom: customGradient || 'bg-gradient-primary',
  };

  return (
    <Card
      variant="glass"
      hoverable
      onClick={() => navigate(route)}
      className="relative overflow-hidden group min-h-[160px]"
    >
      {/* Background Gradient Overlay */}
      <div className={`
        absolute inset-0 opacity-10 group-hover:opacity-20
        transition-opacity duration-base
        ${gradient === 'custom' ? '' : gradients[gradient]}
      `}
        style={gradient === 'custom' ? { background: customGradient } : {}}
      />

      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-accent/5 rounded-full blur-xl" />

      {/* Content */}
      <div className="relative flex flex-col h-full p-6 space-y-4">
        {/* Icon */}
        <div className="icon-container icon-lg">
          <Icon className="w-8 h-8" />
        </div>

        {/* Text */}
        <div className="flex-1 space-y-1">
          <h3 className="text-2xl font-bold text-text-primary">
            {title}
          </h3>
          <p className="text-lg font-arabic text-accent">
            {titleAr}
          </p>
          <p className="text-sm text-text-tertiary pt-1">
            {description}
          </p>
        </div>

        {/* Arrow Indicator */}
        <div className="flex items-center justify-end">
          <div className="
            w-8 h-8 rounded-full
            bg-accent/20 group-hover:bg-accent
            flex items-center justify-center
            transition-all duration-base
            group-hover:scale-110
          ">
            <svg
              className="w-4 h-4 text-accent group-hover:text-bg-primary transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
}
