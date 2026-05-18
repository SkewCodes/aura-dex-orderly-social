import { MetaFunction } from "@remix-run/node";
import { MarketsHomePage } from "@orderly.network/markets";
import { generatePageTitle } from "@/utils/utils";

// export const meta: MetaFunction = () => {
//   return [{ title: generatePageTitle("Markets") }];
// };

export default function MarketsPage() {
  return <MarketsHomePage />;
}
