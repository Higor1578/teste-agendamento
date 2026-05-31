import { createFileRoute } from "@tanstack/react-router";
import { BusinessPublicPage } from "@/components/business-public-page";

export const Route = createFileRoute("/$niche/$slug")({
  component: BusinessNichePage,
});

function BusinessNichePage() {
  const { niche, slug } = Route.useParams();
  return <BusinessPublicPage niche={niche} slug={slug} />;
}
