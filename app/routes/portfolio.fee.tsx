import { MetaFunction } from "@remix-run/node";
import { FeeTierModule } from "@orderly.network/portfolio";
import { generatePageTitle } from "@/utils/utils";

// export const meta: MetaFunction = () => {
//   return [{ title: generatePageTitle("Fee tier") }];
// };

export default function FeeTierPage() {
  return <FeeTierModule.FeeTierPage dataAdapter={() => ({
    columns: [],
    dataSource: [],
  })} />;
}
