import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Plus, Trash2 } from "lucide-react";
import Card from "@/shared/components/layout/Card";
import { Button } from "@/shared/components/ui/Button";

export interface SectionItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon?: LucideIcon;
  iconColor?: string;
}

export interface ItemSectionCardProps<T extends SectionItem = SectionItem> {
  title: string;
  description?: string;
  items: T[];
  onAdd: () => void;
  onDelete?: (id: string) => void;
  defaultIcon?: LucideIcon;
  defaultIconColor?: string;
  addLabel?: string;
  emptyMessage?: string;
  renderItem?: (item: T, onDelete?: (id: string) => void) => ReactNode;
  className?: string;
}

export function ItemSectionCard<T extends SectionItem = SectionItem>({
  title,
  description,
  items,
  onAdd,
  onDelete,
  defaultIcon: DefaultIcon,
  defaultIconColor = "text-amber-600",
  addLabel = "Add",
  emptyMessage = "No records added yet.",
  renderItem,
  className = "",
}: ItemSectionCardProps<T>) {
  return (
    <Card
      title={title}
      description={description}
      className={className}
      actions={
        <Button
          variant="outline"
          size="sm"
          leftIcon={Plus}
          onClick={onAdd}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
        >
          {addLabel}
        </Button>
      }
    >
      <div className="space-y-3 pt-1">
        {items.map((item) => {
          if (renderItem) {
            return <div key={item.id}>{renderItem(item, onDelete)}</div>;
          }

          const ItemIcon = item.icon || DefaultIcon;
          const iconColor = item.iconColor || defaultIconColor;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 dark:bg-card/50 dark:border-slate-800 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                {ItemIcon && (
                  <ItemIcon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-foreground leading-tight">
                      {item.title}
                    </h4>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-[#fcf4e8] text-amber-900 border border-amber-200/80 rounded shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors rounded shrink-0 ml-3"
                  title="Delete"
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-1">{emptyMessage}</p>
        )}
      </div>
    </Card>
  );
}

export default ItemSectionCard;
