path = "C:\\Users\\29842\\Documents\\指导\\restaurant-saas\\src\\app\\(dashboard)\\operations\\page.tsx"

content = '''"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { classifyMerchant } from "@/lib/agent/classification/merchant-classifier";
import { STRATEGY_LABELS, STORAGE_KEYS } from "@/lib/agent/classification/types";
import { getStrategyTemplate } from "@/lib/agent/classification/strategy-templates";
import type { ClassificationInput, ContentStrategyType, PlatformAccountConfig } from "@/lib/agent/classification/types";
import type { MerchantClassification } from "@/lib/agent/classification/types";
import { toast } from "sonner";

const DEMO: ClassificationInput = {
  cuisineType: '\u706b\u9505', priceRange: '80-120', targetCustomers: '\u5e74\u8f7b\u4eba\u3001\u670b\u53cb\u805a\u9910',
  hasDianping: false, hasXiaohongshu: false, hasDouyin: false, accountStage: 'new' as const, city: '\u6210\u90fd',
};

export default function Page() {
  const [classification, setClassification] = useState<MerchantClassification | null>(null);
  const [selectedType, setSelectedType] = useState<ContentStrategyType>("scene_experience");
  const [expanded, setExpanded] = useState(false);
  const template = useMemo(() => getStrategyTemplate(selectedType, DEMO.cuisineType, DEMO.city), [selectedType]);

  useEffect(() => {
    const result = classifyMerchant(DEMO);
    setClassification(result);
    setSelectedType(result.primaryType);
  }, []);

  return (
    <div>
      <h1>OK</h1>
      {template && <p>{template.oneLinePositioning}</p>}
    </div>
  );
}
'''

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Written")
