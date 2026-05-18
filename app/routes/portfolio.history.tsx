import { MetaFunction } from "@remix-run/node";
import { HistoryModule } from "@orderly.network/portfolio";
import { generatePageTitle } from "@/utils/utils";

// export const meta: MetaFunction = () => {
//   return [{ title: generatePageTitle("API keys") }];
// };

export default function HistoryPage() {
  return <HistoryModule.HistoryPage />;
}