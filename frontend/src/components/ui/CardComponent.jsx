import { cn } from "@/lib/utils"

const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card;
