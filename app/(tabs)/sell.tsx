import { router } from "expo-router";
import { ListingWizard } from "@/components/listing/ListingWizard";
import { EmptyState, Screen, T } from "@/components/ui";
import { useIsLoggedIn } from "@/store/auth";

export default function Sell() {
  const loggedIn = useIsLoggedIn();
  if (!loggedIn) {
    return (
      <Screen>
        <T variant="h1" style={{ marginTop: 6 }}>
          Sell
        </T>
        <EmptyState
          icon="pricetags-outline"
          title="Turn your stuff into cash"
          message="Log in to list textbooks, gadgets and more for students on your campus."
          action="Log in to sell"
          onAction={() => router.push("/login")}
        />
      </Screen>
    );
  }
  return <ListingWizard />;
}
