export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
          AI
        </div>
        <h1 className="text-xl font-bold tracking-tight">餐饮AI运营助手</h1>
        <p className="text-sm text-muted-foreground mt-1">让不懂运营的餐饮老板，每天花5分钟把平台做好</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
