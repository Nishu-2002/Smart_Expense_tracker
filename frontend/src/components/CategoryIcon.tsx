import React from 'react';
import {
  Car,
  Train,
  Bus,
  Fuel,
  Wrench,
  Plane,
  Utensils,
  ShoppingBag,
  Home,
  Zap,
  Flame,
  Wifi,
  Smartphone,
  HeartPulse,
  Music,
  Coins,
  User,
  MoreHorizontal,
  Wallet,
  PiggyBank,
  Coffee,
  Apple,
  Salad,
  Milk,
  Tv,
  Film,
  Dumbbell,
  GraduationCap,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  size?: number;
  color?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name = 'tag',
  size = 20,
  color,
  className = ''
}) => {
  const iconLower = (name || '').toLowerCase();

  const props = { size, color, className };

  // Match icon by name or category hint
  if (iconLower.includes('cab') || iconLower.includes('taxi') || iconLower.includes('uber') || iconLower.includes('ola') || iconLower.includes('car')) {
    return <Car {...props} />;
  }
  if (iconLower.includes('metro') || iconLower.includes('train')) {
    return <Train {...props} />;
  }
  if (iconLower.includes('bus')) {
    return <Bus {...props} />;
  }
  if (iconLower.includes('fuel') || iconLower.includes('petrol') || iconLower.includes('diesel')) {
    return <Fuel {...props} />;
  }
  if (iconLower.includes('maintenance') || iconLower.includes('repair') || iconLower.includes('wrench')) {
    return <Wrench {...props} />;
  }
  if (iconLower.includes('flight') || iconLower.includes('travel')) {
    return <Plane {...props} />;
  }
  if (iconLower.includes('vegetable') || iconLower.includes('salad')) {
    return <Salad {...props} />;
  }
  if (iconLower.includes('fruit') || iconLower.includes('apple')) {
    return <Apple {...props} />;
  }
  if (iconLower.includes('milk') || iconLower.includes('dairy')) {
    return <Milk {...props} />;
  }
  if (iconLower.includes('coffee') || iconLower.includes('tea') || iconLower.includes('snack')) {
    return <Coffee {...props} />;
  }
  if (iconLower.includes('food') || iconLower.includes('swiggy') || iconLower.includes('restaurant') || iconLower.includes('utensils')) {
    return <Utensils {...props} />;
  }
  if (iconLower.includes('shopping') || iconLower.includes('amazon') || iconLower.includes('bag')) {
    return <ShoppingBag {...props} />;
  }
  if (iconLower.includes('electricity') || iconLower.includes('electric') || iconLower.includes('power')) {
    return <Zap {...props} />;
  }
  if (iconLower.includes('gas') || iconLower.includes('cylinder') || iconLower.includes('lpg')) {
    return <Flame {...props} />;
  }
  if (iconLower.includes('wifi') || iconLower.includes('internet')) {
    return <Wifi {...props} />;
  }
  if (iconLower.includes('mobile') || iconLower.includes('recharge') || iconLower.includes('phone')) {
    return <Smartphone {...props} />;
  }
  if (iconLower.includes('home') || iconLower.includes('rent') || iconLower.includes('house')) {
    return <Home {...props} />;
  }
  if (iconLower.includes('heart') || iconLower.includes('health') || iconLower.includes('medical') || iconLower.includes('doctor') || iconLower.includes('medicine')) {
    return <HeartPulse {...props} />;
  }
  if (iconLower.includes('gym') || iconLower.includes('fitness') || iconLower.includes('workout')) {
    return <Dumbbell {...props} />;
  }
  if (iconLower.includes('movie') || iconLower.includes('cinema') || iconLower.includes('pvr')) {
    return <Film {...props} />;
  }
  if (iconLower.includes('ott') || iconLower.includes('tv') || iconLower.includes('netflix')) {
    return <Tv {...props} />;
  }
  if (iconLower.includes('music') || iconLower.includes('entertainment')) {
    return <Music {...props} />;
  }
  if (iconLower.includes('coin') || iconLower.includes('financial') || iconLower.includes('emi') || iconLower.includes('money')) {
    return <Coins {...props} />;
  }
  if (iconLower.includes('education') || iconLower.includes('course') || iconLower.includes('school')) {
    return <GraduationCap {...props} />;
  }
  if (iconLower.includes('insurance')) {
    return <ShieldCheck {...props} />;
  }
  if (iconLower.includes('user') || iconLower.includes('personal') || iconLower.includes('salon')) {
    return <User {...props} />;
  }
  if (iconLower.includes('wallet')) {
    return <Wallet {...props} />;
  }
  if (iconLower.includes('piggy') || iconLower.includes('savings')) {
    return <PiggyBank {...props} />;
  }

  return <MoreHorizontal {...props} />;
};
