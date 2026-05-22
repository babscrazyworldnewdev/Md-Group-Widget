import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { ChatWidget } from "@/components/chat-widget";
import { Button } from "@/components/ui/button";

export function ChatWidgetPage() {
  const [copied, setCopied] = useState(false);
  const widgetBaseUrl = new URL(import.meta.env.BASE_URL, window.location.origin).href.replace(/\/$/, "");
  
  const embedCode = `<script
  src="${widgetBaseUrl}/widget.js"
  data-position="right"
  data-accent="#1b2a41"
  data-label="Chat with Sarah"
  data-api-url="https://YOUR-API-DOMAIN.com"
  defer
></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">MD Law Group</h1>
            <h2 className="text-xl text-muted-foreground">Virtual Intake Assistant</h2>
          </div>
          
          <p className="text-foreground/80 leading-relaxed">
            This is a demonstration of the legal intake chat widget. It's designed to live on the law firm's website and provide 24/7 availability for potential clients.
          </p>
          
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase">Embed this widget</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Copy this script and paste it before the closing body tag on your website.
            </p>
            
            <div className="relative">
              <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto overflow-y-hidden">
                <code>{embedCode}</code>
              </pre>
              <Button 
                size="sm"
                variant="secondary" 
                className="absolute top-2 right-2 h-7"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <ChatWidget />
        </div>
        
      </div>
    </div>
  );
}
