export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 px-6 text-center">
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
