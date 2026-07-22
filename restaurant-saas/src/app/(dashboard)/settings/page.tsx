import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">设置</h1>
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground text-center">
          设置页面将在后续迭代完善
        </CardContent>
      </Card>
    </div>
  );
}

