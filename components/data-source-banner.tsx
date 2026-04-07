export function DataSourceBanner({
  source
}: {
  source: "supabase" | "mock";
}) {
  if (source === "supabase") {
    return (
      <div className="alert-box success" style={{ marginBottom: 16 }}>
        البيانات جاية من Supabase مباشرة.
      </div>
    );
  }

  return (
    <div className="alert-box info" style={{ marginBottom: 16 }}>
      التطبيق شغال حاليًا على بيانات تجريبية. حطي مفاتيح Supabase في `.env.local` علشان القراءة والكتابة تبقى حقيقية.
    </div>
  );
}
