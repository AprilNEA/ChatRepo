import { hcWithType } from "@chatrepo/api/hc";

const apiClient = hcWithType("/api", {
  init: {
    credentials: "include",
  },
});

export default apiClient;
