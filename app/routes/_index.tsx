import { type MetaFunction } from "@remix-run/node";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { DEFAULT_SYMBOL } from "@/utils/storage";

// export const meta: MetaFunction = () => {
//   return [
//     { title: import.meta.env.VITE_APP_NAME },
//     { name: "description", content: import.meta.env.VITE_APP_DESCRIPTION },
//   ];
// };

export default function Index() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const searchParamsString = searchParams.toString();
    const redirectPath = `/perp/${DEFAULT_SYMBOL}${searchParamsString ? `?${searchParamsString}` : ''}`;
    navigate(redirectPath);
  }, [navigate, searchParams]);

  return null;
}
