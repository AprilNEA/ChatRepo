import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { NuqsAdapter } from "nuqs/adapters/react";
import { TooltipProvider } from "@radix-ui/react-tooltip";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<NuqsAdapter>
			<TooltipProvider>
				<App />
			</TooltipProvider>
		</NuqsAdapter>
	</React.StrictMode>,
);
