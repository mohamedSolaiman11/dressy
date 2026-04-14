import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTenantContext } from "@/lib/tenant";
import { atelierProfile } from "@/lib/mock-data";
import { AtelierForm } from "@/components/atelier-form";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const tenant = await getTenantContext();

  if (tenant.activeAtelier) {
    redirect("/dashboard");
  }

  return (
    <main className="login-screen">
      <div className="login-wrap">
        <section className="login-brand">
          <div className="brand-mark">ف</div>
          <h1>{atelierProfile.name}</h1>
          <p>
            خلّينا نجهز أول أتيليه أو فرع على الحساب.
            <br />
            وبعدها تقدري تضيفي فروع تانية من داخل التطبيق.
          </p>
        </section>

        <AtelierForm mode="onboarding" />
      </div>
    </main>
  );
}
