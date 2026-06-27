import ControlRoom from "./control-room";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getDashboardData();
  return <ControlRoom data={data} />;
}
