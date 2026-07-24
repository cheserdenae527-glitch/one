 "use client";
 
 import React from "react";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
 import type { SubTypeFormSchema, FormFieldSchema } from "./subtype-form-schemas";
 
 interface FormRendererProps {
   schema: SubTypeFormSchema;
   value: Record<string, any>;
   onChange: (key: string, val: any) => void;
 }
 
export function FormRenderer({ schema, value, onChange }: FormRendererProps) {
  return (
   <div className="space-y-6">
      {schema.sections.map((section) => (
         <div key={section.title}>
           <h4 className="text-xs font-semibold text-muted-foreground mb-3">{section.title}</h4>
           <div className="space-y-3">
             {section.fields.map((field) => (
               <FieldRenderer
                 key={field.key}
                 field={field}
                 val={value[field.key]}
                 onChange={(v) => onChange(field.key, v)}
               />
             ))}
           </div>
         </div>
       ))}
     </div>
   );
 }
 
 function currentVal(field: FormFieldSchema, val: any): any {
   if (val !== undefined) return val;
   if (field.defaultValue !== undefined) return field.defaultValue;
   return field.type === "multiselect" ? [] : field.type === "toggle" ? false : "";
 }
 
 function FieldRenderer({ field, val, onChange }: { field: FormFieldSchema; val: any; onChange: (v: any) => void }) {
   const v = currentVal(field, val);
 
   if (field.readonly) {
     return (
       <div className="space-y-1">
         <label className="text-xs font-medium">{field.label}</label>
         <div className="text-sm text-muted-foreground bg-muted/30 rounded border px-3 py-2">
           {typeof v === "string" && v ? v : "（自动读取）"}
         </div>
         {field.helpText && <p className="text-[10px] text-muted-foreground">{field.helpText}</p>}
       </div>
     );
   }
 
   switch (field.type) {
     case "text":
       return (
         <div className="space-y-1">
           <label className="text-xs font-medium">
             {field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}
           </label>
           <Input
             value={v as string}
             onChange={(e) => onChange(e.target.value)}
             placeholder={field.placeholder}
           />
           {field.helpText && <p className="text-[10px] text-muted-foreground">{field.helpText}</p>}
         </div>
       );
 
     case "textarea":
       return (
         <div className="space-y-1">
           <label className="text-xs font-medium">
             {field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}
           </label>
           <textarea
             className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
             value={v as string}
             onChange={(e) => onChange(e.target.value)}
             placeholder={field.placeholder}
           />
           {field.helpText && <p className="text-[10px] text-muted-foreground">{field.helpText}</p>}
         </div>
       );
 
     case "select":
       return (
         <div className="space-y-1">
           <label className="text-xs font-medium">
             {field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}
           </label>
           <div className="flex flex-wrap gap-1.5">
             {(field.options || []).map((opt) => (
               <Button
                 key={opt}
                 size="sm"
                 variant={v === opt ? "default" : "outline"}
                 onClick={() => onChange(opt)}
               >
                 {opt}
               </Button>
             ))}
           </div>
         </div>
       );
 
     case "multiselect":
       return (
         <div className="space-y-1">
           <label className="text-xs font-medium">{field.label}</label>
           <div className="flex flex-wrap gap-1.5">
             {(field.options || []).map((opt) => {
               const selected = Array.isArray(v) && v.includes(opt);
               return (
                 <Button
                   key={opt}
                   size="sm"
                   variant={selected ? "default" : "outline"}
                   onClick={() => {
                     const arr = Array.isArray(v) ? [...v] : [];
                     onChange(selected ? arr.filter((x: string) => x !== opt) : [...arr, opt]);
                   }}
                 >
                   {opt}
                 </Button>
               );
             })}
           </div>
           {field.helpText && <p className="text-[10px] text-muted-foreground">{field.helpText}</p>}
         </div>
       );
 
     case "segmented":
       return (
         <div className="space-y-1">
           <label className="text-xs font-medium">
             {field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}
           </label>
           <div className="flex gap-1.5 flex-wrap">
             {(field.options || []).map((opt) => (
               <Button
                 key={opt}
                 size="sm"
                 variant={v === opt ? "default" : "outline"}
                 onClick={() => onChange(opt)}
               >
                 {opt}
               </Button>
             ))}
           </div>
         </div>
       );
 
     case "toggle":
       return (
         <div className="flex items-center gap-2">
           <Button
             size="sm"
             variant={v ? "default" : "outline"}
             onClick={() => onChange(!v)}
           >
             {v ? "是" : "否"}
           </Button>
           <span className="text-xs text-muted-foreground">{field.label}</span>
         </div>
       );
 
     case "list":
       return (
         <div className="space-y-2">
           <label className="text-xs font-medium">{field.label}</label>
           {Array.isArray(v) && v.map((item: any, idx: number) => (
             <div key={idx} className="rounded-md border bg-muted/20 p-3 space-y-2 relative">
               {field.fields?.map((sub) => {
                 const sv = item[sub.key] ?? sub.defaultValue ?? "";
                 return (
                   <div key={sub.key} className="space-y-1">
                     <label className="text-xs text-muted-foreground">{sub.label}</label>
                     {sub.type === "multiselect" ? (
                       <div className="flex flex-wrap gap-1">
                         {(sub.options || []).map((opt) => {
                           const sel = Array.isArray(sv) && sv.includes(opt);
                           return (
                             <Button key={opt} size="sm" variant={sel ? "default" : "outline"}
                               onClick={() => {
                                 const arr = [...(Array.isArray(sv) ? sv : [])];
                                 const nv = sel ? arr.filter((x: string) => x !== opt) : [...arr, opt];
                                 const newItems = [...v];
                                 newItems[idx] = { ...item, [sub.key]: nv };
                                 onChange(newItems);
                               }}
                             >{opt}</Button>
                           );
                         })}
                       </div>
                     ) : (
                       <Input value={sv as string} onChange={(e) => {
                         const newItems = [...v];
                         newItems[idx] = { ...item, [sub.key]: e.target.value };
                         onChange(newItems);
                       }} placeholder={sub.placeholder} />
                     )}
                   </div>
                 );
               })}
               {v.length > 1 && (
                 <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6 p-0 text-muted-foreground"
                   onClick={() => onChange(v.filter((_: any, i: number) => i !== idx))}>
                   ✕
                 </Button>
               )}
             </div>
           ))}
           {(!v || v.length === 0) && (
             <p className="text-xs text-muted-foreground">暂无数据，请添加</p>
           )}
           {(!field.maxItems || !v || v.length < field.maxItems) && (
             <Button size="sm" variant="outline" className="w-full mt-1"
               onClick={() => {
                 const row: Record<string, any> = {};
                 field.fields?.forEach((f) => {
                   row[f.key] = f.defaultValue ?? (f.type === "multiselect" ? [] : "");
                 });
                 onChange([...(Array.isArray(v) ? v : []), row]);
               }}>
               + 添加一项
             </Button>
           )}
         </div>
       );
 
     default:
       return null;
   }
 }
