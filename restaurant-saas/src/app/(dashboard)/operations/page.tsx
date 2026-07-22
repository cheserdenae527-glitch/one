import { Card, CardContent } from "@/components/ui/card";

export default function OperationsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">运营规划</h1>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4">大众点评</CardContent></Card>
        <Card><CardContent className="p-4">小红书</CardContent></Card>
        <Card><CardContent className="p-4">抖音</CardContent></Card>
      </div>
    </div>
  );
}
