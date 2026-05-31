import { createFileRoute } from "@tanstack/react-router";
import { BusinessPublicPage } from "@/components/business-public-page";

export const Route = createFileRoute("/b/$slug")({
  component: BusinessPage,
});

function BusinessPage() {
  const { slug } = Route.useParams();
  return <BusinessPublicPage slug={slug} />;
}
