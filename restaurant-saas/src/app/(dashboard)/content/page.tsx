import { Card, CardContent } from "@/components/ui/card";

export default function ContentPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">\u5185\u5BB9\u521B\u4F5C</h1>
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground text-center">
          \u5185\u5BB9\u751F\u6210\u6A21\u5757\u5C06\u5728\u540E\u7EED\u8FED\u4EE3\u5B8C\u5584
        </CardContent>
      </Card>
    </div>
  );
}
