import { useAuth } from "@/lib/auth-context";
import { ArrowRightOnRectangle, ShoppingCart } from "@medusajs/icons";
import { Button, Heading, Text } from "@medusajs/ui";

export function POSHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="shadow-borders-base flex size-7 items-center justify-center rounded-md">
          <div className="bg-ui-bg-field text-ui-fg-subtle flex size-6 items-center justify-center">
            <ShoppingCart className="h-4 w-4" />
          </div>
        </div>
        <Heading>Point of Sale</Heading>
      </div>
      <div className="flex items-center gap-4">
        <Text size="xsmall" weight="plus" leading="compact">
          {user?.first_name || user?.email}
        </Text>
        <Button
          onClick={logout}
          variant="transparent"
          className="transition-fg inline-flex items-center rounded-md px-2 py-1 text-xs"
        >
          <ArrowRightOnRectangle className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
