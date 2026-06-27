import { BoothTop } from "@/components/ui";
import { getCandidateMatches } from "@/lib/queries";
import MissingForm from "./MissingForm";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kiosk?: string }>;
}) {
  const sp = await searchParams;
  const kiosk = sp?.kiosk === "1";
  const matches = await getCandidateMatches();

  return (
    <div className="civic">
      <BoothTop kiosk={kiosk} titleDev="गुमशुदा की सूचना" titleEn="Report missing" />

      <main className="civic-main civic-wide civic-tight">
        <div className="civic-head">
          <h1><span className="dev">कौन बिछड़ गया है?</span><span className="en">Who has been separated?</span></h1>
          <p><span className="dev">जल्दबाज़ी ठीक है। फ़ोटो और आख़िरी जगह सबसे ज़रूरी हैं।</span> Take your time. A photo and the last-seen place matter most.</p>
        </div>

        <div className="work2">
          <MissingForm matches={matches} />
        </div>
      </main>
    </div>
  );
}
