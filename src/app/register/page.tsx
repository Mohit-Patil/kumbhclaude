import RegisterFlow from "./flow";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kiosk?: string }>;
}) {
  const sp = await searchParams;
  return <RegisterFlow kiosk={sp?.kiosk === "1"} />;
}
