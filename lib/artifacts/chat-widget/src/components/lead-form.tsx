import { useState } from "react";
import { Scale, User, Mail, Phone, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmitLead } from "@workspace/api-client-react";

const LEGAL_ISSUES = [
  "Personal Injury",
  "Car Accident",
  "Family Law",
  "Divorce",
  "Child Custody",
  "Criminal Defense",
  "Immigration",
  "Employment Issues",
  "Business Law",
  "Real Estate",
  "Other Legal Matter",
];

const SARAH_IMAGE_SRC = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/sarah.png`;

interface LeadFormProps {
  conversationId: number | null;
  onSubmit: (leadData: { name: string; email: string; phone: string; legalIssue: string }) => void;
}

export function LeadForm({ conversationId, onSubmit }: LeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [legalIssue, setLegalIssue] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitLead = useSubmitLead();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    submitLead.mutate(
      {
        data: {
          name: name.trim() || "Anonymous",
          email: email.trim() || "not provided",
          phone: phone.trim() || "not provided",
          legalIssue: legalIssue || "General Inquiry",
          conversationId: conversationId ? String(conversationId) : undefined,
        },
      },
      {
        onSuccess: () => {
          onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim(), legalIssue });
        },
        onError: () => {
          // Still proceed even if server fails — don't block the user
          onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim(), legalIssue });
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-primary px-4 py-4 flex items-center gap-3 shrink-0">
        <Avatar className="h-14 w-14 border-2 border-primary-foreground/30 shrink-0">
          <AvatarImage src={SARAH_IMAGE_SRC} alt="Sarah" className="object-cover object-top scale-125 origin-top" />
          <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
            <Scale className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h2 className="font-semibold text-primary-foreground leading-tight">Sarah | Legal Intake</h2>
          <p className="text-xs text-primary-foreground/80 leading-tight">MD Law Group</p>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto p-5 bg-white">
        {/* Welcome bubble */}
        <div className="flex items-start gap-2 mb-5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={SARAH_IMAGE_SRC} alt="Sarah" />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">S</AvatarFallback>
          </Avatar>
          <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-foreground max-w-[85%]">
            Hi, I'm Sarah from <strong>MD Law Group</strong>. Share your info below, or click "Start" to chat right away. Your message will be sent to the team for review.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" data-testid="lead-form">
          {/* Name + Phone on same row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground/60">Name <span className="text-muted-foreground/50">(optional)</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input data-testid="input-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" className="pl-8 h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground/60">Phone <span className="text-muted-foreground/50">(optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input data-testid="input-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 000-0000" className="pl-8 h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground/60">Email <span className="text-muted-foreground/50">(optional)</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input data-testid="input-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" className="pl-8 h-9 text-sm" />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Legal Issue chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground/60">What can we help with? <span className="text-muted-foreground/50">(optional)</span></label>
            <div className="flex flex-wrap gap-1.5">
              {LEGAL_ISSUES.map((issue) => (
                <button
                  key={issue}
                  type="button"
                  data-testid={`chip-${issue.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setLegalIssue(legalIssue === issue ? "" : issue)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                    legalIssue === issue
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white border-input text-foreground hover:bg-muted"
                  }`}
                >
                  {issue}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" data-testid="button-start-chat" disabled={submitLead.isPending} className="w-full gap-2 mt-1">
            {submitLead.isPending ? "Starting..." : "Start Conversation"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
