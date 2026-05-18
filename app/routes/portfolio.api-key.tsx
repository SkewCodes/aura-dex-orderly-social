import { MetaFunction } from "@remix-run/node";
import { APIManagerModule } from "@orderly.network/portfolio";
import { generatePageTitle } from "@/utils/utils";

// export const meta: MetaFunction = () => {
//   return [{ title: generatePageTitle("API keys") }];
// };

export default function APIKeyPage() {
  return <APIManagerModule.APIManagerPage />;
}
