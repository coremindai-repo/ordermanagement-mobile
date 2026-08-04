import { useQuery } from "@tanstack/react-query";
import { getOrdersList } from "../../api/orders";

export function useOrdersList(params: { mine: boolean }) {
  return useQuery({
    queryKey: ["orders", "list", params.mine],
    queryFn: () => getOrdersList(params),
  });
}
