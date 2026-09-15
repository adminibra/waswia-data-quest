import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { WaswiaLogo } from "@/components/waswia-logo";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Connexion — WASWIA" }, { name: "description", content: "Connectez-vous à votre espace de collecte WASWIA." },
    { property: "og:title", content: "Connexion — WASWIA" }, { property: "og:description", content: "Accédez à votre espace de collecte WASWIA." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: AuthPage,
});

function AuthPage() {
  const [visible, setVisible] = useState(false);
  const navigate = Route.useNavigate();
  const submit = (event: FormEvent) => { event.preventDefault(); navigate({ to: "/" }); };
  return <main className="grid min-h-screen place-items-center bg-auth-gradient px-5 py-9"><div className="w-full max-w-md"><WaswiaLogo className="mx-auto mb-8 h-[72px] w-[104px] rounded-lg" /><form onSubmit={submit} className="rounded-xl bg-card p-6 shadow-xl sm:p-8"><h1 className="text-center text-2xl font-bold">Connexion</h1><p className="mt-2 text-center text-sm text-muted-foreground">Connectez-vous pour accéder à vos sondages</p><label className="mt-5 block text-sm font-medium">Email<div className="mt-2 flex h-11 items-center gap-3 rounded-lg border border-input bg-admin-background px-3"><Mail className="h-4 w-4 text-muted-foreground" /><input required type="email" defaultValue="vous@exemple.com" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div></label><label className="mt-5 block text-sm font-medium">Mot de passe<div className="mt-2 flex h-11 items-center gap-3 rounded-lg border border-input bg-admin-background px-3"><LockKeyhole className="h-4 w-4 text-muted-foreground" /><input required type={visible ? "text" : "password"} defaultValue="waswia2026" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><Button type="button" variant="ghost" size="icon" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{visible ? <EyeOff /> : <Eye />}</Button></div></label><Button className="mt-4 h-11 w-full bg-brand-gradient">Se connecter</Button><p className="mt-6 text-center text-sm text-muted-foreground">Pas encore de compte ? <Link to="/" className="text-primary hover:underline">Créer un compte</Link></p></form><p className="mt-6 text-center text-sm text-primary-foreground">Application de collecte de données terrain</p></div></main>;
}