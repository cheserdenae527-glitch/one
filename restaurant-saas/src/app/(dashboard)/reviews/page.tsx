import { Card, CardContent } from "@/components/ui/card";

export default function ReviewsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">评价管理</h1>
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground text-center">
          评价管理模块将在后续迭代完善
        </CardContent>
      </Card>
    </div>
  );
}

