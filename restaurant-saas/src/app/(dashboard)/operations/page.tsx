import { Card, CardContent } from "@/components/ui/card";

export default function OperationsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">\u8FD0\u8425\u89C4\u5212</h1>
      <div className="grid grid-cols-3 gap-4">
        {["\u5927\u4F17\u70B9\u8BC4", "\u5C0F\u7EA2\u4E66", "\u6296\u97F3"].map((p) => (
          <Card key={p} className="p-4">
            
            <CardContent className="p-0 text-xs text-muted-foreground">
              \u5C1A\u672A\u7ED1\u5B9A\u8D26\u53F7
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

