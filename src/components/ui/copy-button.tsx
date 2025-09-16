"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CopyButtonProps extends ButtonProps {
  textToCopy: string;
}

export function CopyButton({ textToCopy, children, ...props }: CopyButtonProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
    toast({ title: "Copiado!", description: "O link foi copiado para a área de transferência." });
  };

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  return (
    <Button onClick={copyToClipboard} {...props}>
      {hasCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
}
