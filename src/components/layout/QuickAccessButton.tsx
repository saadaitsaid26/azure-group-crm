import { useState, useRef, useEffect } from "react";
import { Plus, Target, FileText, Mail, User, Building2, Package, Layers, UserCog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickActions = [
  { name: "Lead", icon: Target, action: () => console.log("Create Lead") },
  { name: "Quote", icon: FileText, action: () => console.log("Create Quote") },
  { name: "Email", icon: Mail, action: () => console.log("Send Email") },
  { name: "Person", icon: User, action: () => console.log("Add Person") },
  { name: "Organization", icon: Building2, action: () => console.log("Add Organization") },
  { name: "Product", icon: Package, action: () => console.log("Add Product") },
  { name: "Attribute", icon: Layers, action: () => console.log("Create Attribute") },
  { name: "Role", icon: UserCog, action: () => console.log("Create Role") },
  { name: "User", icon: Users, action: () => console.log("Add User") },
];

export default function QuickAccessButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 p-0 rounded-full bg-primary hover:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <Plus className={cn(
          "w-5 h-5 transition-transform duration-200",
          isOpen && "rotate-45"
        )} />
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-12 bg-popover border border-border rounded-lg shadow-lg animate-scale-in z-50"
        >
          <div className="quick-action-grid">
            {quickActions.map((item) => (
              <button
                key={item.name}
                onClick={() => handleActionClick(item.action)}
                className="quick-action-item"
              >
                <item.icon className="w-6 h-6 text-muted-foreground quick-action-icon transition-colors duration-200" />
                <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}