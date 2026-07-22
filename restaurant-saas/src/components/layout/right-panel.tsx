interface RightPanelProps {
  children?: React.ReactNode;
}

export function RightPanel({ children }: RightPanelProps) {
  return (
    <aside className="w-[260px] shrink-0 border-l bg-muted/20 p-4 overflow-y-auto">
      {children || (
        <p className="text-sm text-muted-foreground text-center pt-8">
          热门参考内容将显示在此
        </p>
      )}
    </aside>
  );
}
