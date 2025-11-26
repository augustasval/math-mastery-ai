import { NavLink } from "@/components/NavLink";
import { BookOpen, Target, AlertCircle, Calendar, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/translations";

export const Navigation = () => {
  const t = useTranslation();
  
  const navItems = [
    { to: "/learn", icon: BookOpen, label: t.learn },
    { to: "/practice", icon: Target, label: t.practice },
    { to: "/video-library", icon: Video, label: t.videos },
    { to: "/mistakes", icon: AlertCircle, label: t.mistakes },
    { to: "/learning-plan", icon: Calendar, label: t.plan },
  ];

  return (
    <nav className="flex gap-1 bg-card/50 p-1 rounded-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
          activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
        >
          <item.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
