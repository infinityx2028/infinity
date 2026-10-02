import { useSyncExternalStore } from "react";

const query = "(max-width: 767px)";
const snapshot = () => window.matchMedia(query).matches;
const subscribe = (notify) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

export default function useIsMobile() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
