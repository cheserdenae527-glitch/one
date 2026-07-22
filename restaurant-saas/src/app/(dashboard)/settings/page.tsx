import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">\u8BBE\u7F6E</h1>
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground text-center">
          \u8BBE\u7F6E\u9875\u9762\u5C06\u5728\u540E\u7EED\u8FED\u4EE3\u5B8C\u5584
        </CardContent>
      </Card>
    </div>
  );
}

